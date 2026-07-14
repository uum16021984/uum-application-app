const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth, requireRoles } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireRoles('calon', 'adminJSM'));

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

// Delete a single notification belonging to the current user
router.delete('/:id', async (req, res) => {
  try {
    const result = await Notification.deleteOne({ _id: req.params.id, userId: req.auth.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Delete all notifications belonging to the current user
router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.auth.userId });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

module.exports = router;
