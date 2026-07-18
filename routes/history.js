const express = require('express');
const Application = require('../models/Application');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { role, userId } = req.auth;
    let query = {};

    if (role === 'adminJSM') {
      // JSM admin sees all applications
    } else if (role === 'adminSchool') {
      const User = require('../models/User');
      const user = await User.findById(userId).lean();
      if (user?.school) query.school = user.school;
    } else {
      query.applicantId = userId;
    }

    const apps = await Application.find(query).sort({ createdAt: -1 }).lean();
    res.json(apps.map(a => ({
      id: a._id.toString(),
      applicantId: a.applicantId?.toString(),
      applicantName: a.applicantName,
      position: a.position,
      grade: a.grade,
      school: a.school,
      status: a.status,
      dateApplied: a.dateApplied,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

module.exports = router;
