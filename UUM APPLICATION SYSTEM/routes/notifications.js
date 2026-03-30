const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const list = await Notification.find({ userId: req.auth.userId })
      .sort({ createdAt: -1 })
      .lean();
    const out = list.map((n) => ({
      id: n._id.toString(),
      userId: n.userId.toString(),
      title: n.title,
      message: n.message,
      date: n.date,
      read: n.read,
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

router.patch('/mark-read', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.auth.userId, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

module.exports = router;
