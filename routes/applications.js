const express    = require('express');
const mongoose   = require('mongoose');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User       = require('../models/User');
const Job        = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ─── helpers ────────────────────────────────────────────────────────────────

async function notifyUser(userId, title, message) {
  await Notification.create({
    userId,
    title,
    message,
    date: new Date().toISOString().split('T')[0],
    read: false,
  });
}

function serializeApp(a) {
  return {
    id:              a._id ? a._id.toString() : a.id,
    applicantId:     a.applicantId?.toString(),
    applicantName:   a.applicantName,
    position:        a.position,
    grade:           a.grade,
    school:          a.school,
    status:          a.status,
    dateApplied:     a.dateApplied,
    details:         a.details || {},
    jobId:           a.jobId ? a.jobId.toString() : null,
    jobTitle:        a.jobTitle,
    applicant:       a.applicant,
    qualification:   a.qualification,
    experience:      a.experience,
    resume:          a.resume,
    coverLetter:     a.coverLetter,
    rejectionReason: a.rejectionReason,
    reviewedBy:      a.reviewedBy ? a.reviewedBy.toString() : null,
    reviewedAt:      a.reviewedAt,
  };
}

// ─── GET / ───────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { role, userId } = req.auth;
    let query = {};

    if (role === 'calon') {
      query.applicantId = userId;
    } else if (role === 'adminSchool') {
      // School admin sees all applications for their school (pending, approved, rejected)
      const user = await User.findById(userId).lean();
      if (user?.school) {
        query.school = user.school;
      }
    }
    // adminJSM gets everything (no filter)

    const apps = await Application.find(query).sort({ createdAt: -1 }).lean();
    res.json(apps.map(serializeApp));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load applications' });
  }
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ error: 'Invalid id' });

    const app = await Application.findById(req.params.id).lean();
    if (!app) return res.status(404).json({ error: 'Not found' });

    const { role, userId } = req.auth;

    // adminJSM can view anything
    if (role === 'adminJSM') return res.json(serializeApp(app));

    // adminSchool can view any application for their school
    if (role === 'adminSchool') {
      const user = await User.findById(userId).lean();
      if (app.school !== user?.school)
        return res.status(403).json({ error: 'Forbidden' });
      return res.json(serializeApp(app));
    }

    // calon can view their own
    if (role === 'calon') {
      if (app.applicantId?.toString() !== userId)
        return res.status(403).json({ error: 'Forbidden' });
      return res.json(serializeApp(app));
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load application' });
  }
});

// ─── POST / ──────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    if (req.auth.role !== 'calon')
      return res.status(403).json({ error: 'Only applicants can create applications' });

    const body = req.body;

    // Resolve grade and school from the job (server-authoritative)
    let job = null;
    if (body.jobId && mongoose.isValidObjectId(body.jobId)) {
      job = await Job.findById(body.jobId).lean();
    }
    if (!job) return res.status(400).json({ error: 'Valid jobId is required' });

    // Duplicate check
    const existing = await Application.findOne({
      applicantId: req.auth.userId,
      jobId:       job._id,
    });
    if (existing)
      return res.status(409).json({ error: 'You have already applied for this position' });

    if (!body.applicantName || !body.position)
      return res.status(400).json({ error: 'applicantName and position are required' });

    const doc = {
      applicantId:   req.auth.userId,
      applicantName: body.applicantName,
      position:      body.position,
      grade:         job.grade,           // server-authoritative
      school:        job.school,          // server-authoritative
      status:        'pending',           // always starts pending — never trust client
      dateApplied:   new Date().toISOString().split('T')[0],
      details:       body.details || {},
      qualification: body.qualification || '',
      experience:    body.experience || '',
      resume:        body.resume || '',
      coverLetter:   body.coverLetter || '',
      jobId:         job._id,
      jobTitle:      job.title || body.jobTitle || '',
      applicant:     body.applicant || '',
    };

    const created = await Application.create(doc);
    res.status(201).json(serializeApp(created.toJSON()));
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: 'You have already applied for this position' });
    console.error(err);
    res.status(500).json({ error: 'Failed to save application' });
  }
});

// ─── PATCH /:id ───────────────────────────────────────────────────────────────

router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ error: 'Invalid id' });

    const app  = await Application.findById(req.params.id);
    if (!app)  return res.status(404).json({ error: 'Not found' });

    const { role, userId } = req.auth;

    // ── Calon: can only edit their own draft fields, never status ──────────
    if (role === 'calon') {
      if (app.applicantId.toString() !== userId)
        return res.status(403).json({ error: 'Forbidden' });
      if (app.status !== 'pending')
        return res.status(400).json({ error: 'Cannot edit an application that is no longer pending' });

      const allowed = ['applicantName', 'position', 'details', 'qualification', 'experience', 'resume', 'coverLetter'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) app[key] = req.body[key];
      }
      // grade/school stay server-authoritative (from job)
      await app.save();
      return res.json(serializeApp(app.toJSON()));
    }

    // ── adminJSM: can approve or reject with optional reason ──────────────
    if (role === 'adminJSM') {
      const { status, rejectionReason } = req.body;

      if (!['approved', 'rejected'].includes(status))
        return res.status(400).json({ error: 'status must be "approved" or "rejected"' });

      if (app.status !== 'pending')
        return res.status(400).json({ error: 'Application has already been reviewed' });

      app.status     = status;
      app.reviewedBy = userId;
      app.reviewedAt = new Date();

      if (status === 'approved') {
        await notifyUser(
          app.applicantId,
          'Application Approved',
          `Congratulations! Your application for ${app.position} at ${app.school} has been approved by JSM.`
        );

        // Auto-delete job if all vacancies are now filled
        if (app.jobId) {
          const job = await Job.findById(app.jobId);
          if (job) {
            const approvedCount = await Application.countDocuments({ jobId: job._id, status: 'approved' });
            if (approvedCount >= (job.vacancies || 1)) {
              await Job.findByIdAndDelete(job._id);
            }
          }
        }
      }

      if (status === 'rejected') {
        if (rejectionReason) app.rejectionReason = rejectionReason;
        await notifyUser(
          app.applicantId,
          'Application Rejected',
          `We regret to inform you that your application for ${app.position} has been rejected by JSM.${rejectionReason ? ' Reason: ' + rejectionReason : ''}`
        );
      }

      await app.save();
      return res.json(serializeApp(app.toJSON()));
    }

    // ── adminSchool: read-only — no PATCH allowed ─────────────────────────
    if (role === 'adminSchool') {
      return res.status(403).json({ error: 'School admins cannot modify applications' });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ error: 'Invalid id' });

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });

    const { role, userId } = req.auth;

    if (role === 'calon') {
      if (app.applicantId.toString() !== userId)
        return res.status(403).json({ error: 'Forbidden' });
      if (app.status !== 'pending')
        return res.status(400).json({ error: 'Cannot delete an application that has already been reviewed' });
      await Application.deleteOne({ _id: app._id });
      return res.json({ ok: true });
    }

    if (role === 'adminJSM') {
      await Application.deleteOne({ _id: app._id });
      return res.json({ ok: true });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
