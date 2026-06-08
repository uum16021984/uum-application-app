require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const Job = require('./models/Job');
const Application = require('./models/Application');

// ── Deadline cleanup ──────────────────────────────────────────────────────────
// Runs once on startup, then every hour.
// Deletes pending applications and the job itself for any job past its deadline.
async function cleanupExpiredJobs() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const expiredJobs = await Job.find({ deadline: { $lt: todayStr } }).lean();
    if (expiredJobs.length === 0) return;

    const expiredJobIds = expiredJobs.map(j => j._id);

    const { deletedCount: appsDeleted } = await Application.deleteMany({
      jobId: { $in: expiredJobIds },
      status: 'pending',
    });

    const { deletedCount: jobsDeleted } = await Job.deleteMany({
      _id: { $in: expiredJobIds },
    });

    console.log(
      `[cleanup] Removed ${jobsDeleted} expired job(s) and ${appsDeleted} pending application(s).`
    );
  } catch (err) {
    console.error('[cleanup] Error during deadline cleanup:', err);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/history', require('./routes/history'));
app.use('/api/notifications', require('./routes/notifications'));

app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function seedSampleJob() {
  const count = await Job.countDocuments();
  if (count === 0) {
    await Job.create({
      title: 'Lecturer',
      description: 'Teach students',
      grade: 'DS11',
      school: 'School of Computing',
      deadline: '2026-12-31',
      postedBy: 'System',
    });
    console.log('Seeded sample job advertisement.');
  }
}

if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment.');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    await seedSampleJob();
    await cleanupExpiredJobs();                       // run once on startup
    setInterval(cleanupExpiredJobs, 60 * 60 * 1000); // then every hour
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
