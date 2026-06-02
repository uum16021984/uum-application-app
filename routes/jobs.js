const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const { requireAuth, requireRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();
    const list = jobs.map((j) => ({
      id: j._id.toString(),
      title: j.title,
      description: j.description,
      grade: j.grade,
      school: j.school,
      deadline: j.deadline,
      postedBy: j.postedBy,
    }));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load jobs' });
  }
});

router.post('/', requireAuth, requireRoles('adminJSM'), async (req, res) => {
  try {
    const { title, description, grade, school, deadline, postedBy } = req.body;
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
    });
    res.status(201).json({
      id: job._id.toString(),
      title: job.title,
      description: job.description,
      grade: job.grade,
      school: job.school,
      deadline: job.deadline,
      postedBy: job.postedBy,
    });
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
    const { title, description, grade, school, deadline, postedBy } = req.body;
    if (title != null) job.title = title;
    if (description != null) job.description = description;
    if (grade != null) job.grade = grade;
    if (school != null) job.school = school;
    if (deadline != null) job.deadline = deadline;
    if (postedBy != null) job.postedBy = postedBy;
    await job.save();
    res.json({
      id: job._id.toString(),
      title: job.title,
      description: job.description,
      grade: job.grade,
      school: job.school,
      deadline: job.deadline,
      postedBy: job.postedBy,
    });
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
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
