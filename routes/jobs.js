const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { requireAuth, requireRoles } = require('../middleware/auth');

const router = express.Router();

function serializeJob(j, approvedCount) {
  const vacancies = j.vacancies ?? 1;
  const approved = approvedCount ?? 0;
  const spotsLeft = Math.max(0, vacancies - approved);
  return {
    id: j._id ? j._id.toString() : j.id,
    title: j.title,
    description: j.description,
    grade: j.grade,
    school: j.school,
    deadline: j.deadline,
    postedBy: j.postedBy,
    vacancies,
    approvedCount: approved,
    spotsLeft,
    isFull: !!j.isFull,
    image: j.image || '',
  };
}

router.get('/', async (_req, res) => {
  try {
    const jobs = await Job.find().lean();
    jobs.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

    // Count approved applications per job in one query
    const jobIds = jobs.map(j => j._id);
    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds }, status: 'approved' } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    res.json(jobs.map(j => serializeJob(j, countMap[j._id.toString()] || 0)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load jobs' });
  }
});

router.post('/', requireAuth, requireRoles('adminJSM'), async (req, res) => {
  try {
    const { title, description, grade, school, deadline, postedBy, vacancies, image } = req.body;
    if (!title || !grade || !school || !deadline) {
      return res.status(400).json({ error: 'title, grade, school, and deadline are required' });
    }
    const job = await Job.create({
      title,
      description: description || '',
      grade,
      school,
      deadline,
      postedBy: postedBy || req.auth.email || '',
      vacancies: vacancies ? Math.max(1, parseInt(vacancies, 10)) : 1,
      image: image || '',
    });
    res.status(201).json(serializeJob(job, 0));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.patch('/:id', requireAuth, requireRoles('adminJSM'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const { title, description, grade, school, deadline, postedBy, vacancies, image, isFull } = req.body;
    if (title != null) job.title = title;
    if (description != null) job.description = description;
    if (grade != null) job.grade = grade;
    if (school != null) job.school = school;
    if (deadline != null) job.deadline = deadline;
    if (postedBy != null) job.postedBy = postedBy;
    if (vacancies != null) job.vacancies = Math.max(1, parseInt(vacancies, 10));
    if (image != null) job.image = image;
    if (isFull != null) job.isFull = !!isFull;
    await job.save();

    const approvedCount = await Application.countDocuments({ jobId: job._id, status: 'approved' });
    res.json(serializeJob(job, approvedCount));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

router.delete('/:id', requireAuth, requireRoles('adminJSM'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    // Cascade: remove all applications tied to this job
    await Application.deleteMany({ jobId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
