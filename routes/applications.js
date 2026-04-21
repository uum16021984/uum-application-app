const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Job = require('../models/Job'); // ✅ ADDED
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function notifyUser(userId, title, message) {
  await Notification.create({
    userId,
    title,
    message,
    date: new Date().toISOString().split('T')[0],
    read: false,
  });
}

function canViewApplication(auth, app) {
  if (auth.role === 'adminJSM') return true;
  if (auth.role === 'adminSchool' && app.school === auth.schoolScope) return true;
  if (app.applicantId && app.applicantId.toString() === auth.userId) return true;
  return false;
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { role, userId } = req.auth;
    let query = {};

    if (role === 'calon') {
      query.applicantId = userId;
    } else if (role === 'adminSchool') {
      const user = await User.findById(userId).lean();

      // ✅ FIXED (no empty filter)
      if (user?.school) {
        query.school = user.school;
      }
    }

    const apps = await Application.find(query).sort({ createdAt: -1 }).lean();

    const list = apps.map((a) => ({
      id: a._id.toString(),
      applicantId: a.applicantId?.toString(),
      applicantName: a.applicantName,
      position: a.position,
      grade: a.grade,
      school: a.school,
      status: a.status,
      dateApplied: a.dateApplied,
      details: a.details || {},
      jobId: a.jobId ? a.jobId.toString() : null,
      jobTitle: a.jobTitle,
      applicant: a.applicant,
      qualification: a.qualification,
      experience: a.experience,
      resume: a.resume,
      coverLetter: a.coverLetter,
      schoolApproved: a.schoolApproved,
      schoolRejected: a.schoolRejected,
      rejectionReason: a.rejectionReason,
    }));

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load applications' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const app = await Application.findById(req.params.id).lean();
    if (!app) return res.status(404).json({ error: 'Not found' });

    const adminUser = await User.findById(req.auth.userId).lean();
    const authScope = {
      ...req.auth,
      schoolScope: adminUser?.school || '',
    };

    if (!canViewApplication(authScope, app)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({
      id: app._id.toString(),
      applicantId: app.applicantId?.toString(),
      applicantName: app.applicantName,
      position: app.position,
      grade: app.grade,
      school: app.school,
      status: app.status,
      dateApplied: app.dateApplied,
      details: app.details || {},
      jobId: app.jobId ? app.jobId.toString() : null,
      jobTitle: app.jobTitle,
      applicant: app.applicant,
      qualification: app.qualification,
      experience: app.experience,
      resume: app.resume,
      coverLetter: app.coverLetter,
      schoolApproved: app.schoolApproved,
      schoolRejected: app.schoolRejected,
      rejectionReason: app.rejectionReason,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load application' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (req.auth.role !== 'calon') {
      return res.status(403).json({ error: 'Only applicants can create applications' });
    }

    const body = req.body;

    // ✅ FIXED (get job for correct school)
    let job = null;
    if (body.jobId && mongoose.isValidObjectId(body.jobId)) {
      job = await Job.findById(body.jobId).lean();
    }

    const doc = {
      applicantId: req.auth.userId,
      applicantName: body.applicantName,
      position: body.position,
      grade: body.grade || '',
      school: job?.school || '', // ✅ FIXED
      status: body.status || 'pending',
      dateApplied: body.dateApplied || new Date().toISOString().split('T')[0],
      details: body.details || {},
      qualification: body.qualification || '',
      experience: body.experience || '',
      resume: body.resume || '',
      coverLetter: body.coverLetter || '',
    };

    if (body.jobId && mongoose.isValidObjectId(body.jobId)) {
      doc.jobId = body.jobId;
    }
    if (body.jobTitle) doc.jobTitle = body.jobTitle;
    if (body.applicant) doc.applicant = body.applicant;

    if (!doc.applicantName || !doc.position) {
      return res.status(400).json({ error: 'applicantName and position are required' });
    }

    const created = await Application.create(doc);
    const a = created.toJSON();
    res.status(201).json(a);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save application' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });

    const adminUser = await User.findById(req.auth.userId);
    const role = req.auth.role;

    const isOwner = app.applicantId.toString() === req.auth.userId;

    if (role === 'calon' && isOwner) {
      const allowed = ['applicantName', 'position', 'grade', 'school', 'status', 'details', 'qualification', 'experience', 'resume', 'coverLetter'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) app[key] = req.body[key];
      }
      await app.save();
      return res.json(app.toJSON());
    }

    if (role === 'adminJSM') {
      const { status, schoolApproved, schoolRejected, rejectionReason } = req.body;
      if (status != null) {
        app.status = status;
        if (status === 'approved' && app.applicantId) {
          await notifyUser(app.applicantId, 'Application Approved', `Your application for ${app.position} has been approved by Admin JSM.`);
        }
        if (status === 'rejected' && app.applicantId) {
          await notifyUser(app.applicantId, 'Application Rejected', `We regret to inform you that your application for ${app.position} has been rejected.`);
        }
      }
      if (schoolApproved != null) app.schoolApproved = schoolApproved;
      if (schoolRejected != null) app.schoolRejected = schoolRejected;
      if (rejectionReason != null) app.rejectionReason = rejectionReason;
      await app.save();
      return res.json(app.toJSON());
    }

    if (role === 'adminSchool' && adminUser && app.school === adminUser.school) {
      const { status, schoolApproved, schoolRejected, rejectionReason } = req.body;
      if (schoolApproved === true) {
        app.schoolApproved = true;
        app.status = 'school-approved';
        if (app.applicantId) {
          await notifyUser(app.applicantId, 'Application Approved by School', `Your application for ${app.position} has been approved by ${app.school}.`);
        }
      }
      if (schoolRejected === true) {
        app.schoolRejected = true;
        app.status = 'school-rejected';
        if (rejectionReason) app.rejectionReason = rejectionReason;
        if (app.applicantId) {
          await notifyUser(app.applicantId, 'Application Rejected by School', `Your application for ${app.position} has been rejected by ${app.school}. Reason: ${rejectionReason || 'N/A'}`);
        }
      }
      if (status != null) app.status = status;
      await app.save();
      return res.json(app.toJSON());
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });

    const isOwner = app.applicantId.toString() === req.auth.userId;

    if (req.auth.role === 'calon' && isOwner) {
      await Application.deleteOne({ _id: app._id });
      return res.json({ ok: true });
    }

    if (req.auth.role === 'adminJSM') {
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
