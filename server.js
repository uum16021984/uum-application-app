require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Job = require('./models/Job');
const User = require('./models/User');

// ── School admin accounts ─────────────────────────────────────────────────────
const SCHOOL_ADMINS = [
  { school: 'Tunku Puteri Intan Safinaz School of Accountancy',         email: 'schoolofaccountancy@gmail.com',       password: 'schoolofaccountancy' },
  { school: 'School of Business Management',                             email: 'schoolofbusiness@gmail.com',          password: 'schoolofbusiness' },
  { school: 'School of Economics, Finance and Banking',                  email: 'schoolofeconomics@gmail.com',         password: 'schoolofeconomics' },
  { school: 'Islamic Business School',                                   email: 'islamicbusinessschool@gmail.com',     password: 'islamicbusinessschool' },
  { school: 'School of Technology Management and Logistics',             email: 'schooloftechnology@gmail.com',        password: 'schooloftechnology' },
  { school: 'School of Creative Industry Management and Performing Arts',email: 'schoolofcreativeindustry@gmail.com',  password: 'schoolofcreativeindustry' },
  { school: 'School of Multimedia Technology and Communication',         email: 'schoolofmultimedia@gmail.com',        password: 'schoolofmultimedia' },
  { school: 'School of Applied Psychology, Social Work and Policy',      email: 'schoolofpsychology@gmail.com',        password: 'schoolofpsychology' },
  { school: 'School of Quantitative Sciences',                           email: 'schoolofquantitative@gmail.com',      password: 'schoolofquantitative' },
  { school: 'School of Education',                                       email: 'schoolofeducation@gmail.com',         password: 'schoolofeducation' },
  { school: 'School of Computing',                                       email: 'schoolofcomputing@gmail.com',         password: 'schoolofcomputing' },
  { school: 'School of Languages, Civilization and Philosophy',          email: 'schooloflanguages@gmail.com',         password: 'schooloflanguages' },
  { school: 'School of Law',                                             email: 'schooloflaw@gmail.com',               password: 'schooloflaw' },
  { school: 'School of International Studies',                           email: 'schoolofinternationalstudies@gmail.com', password: 'schoolofinternationalstudies' },
  { school: 'School of Government',                                      email: 'schoolofgovernment@gmail.com',        password: 'schoolofgovernment' },
  { school: 'School of Tourism, Hospitality and Event Management',       email: 'schooloftourism@gmail.com',           password: 'schooloftourism' },
];

async function seedSchoolAdmins() {
  for (const admin of SCHOOL_ADMINS) {
    const exists = await User.findOne({ email: admin.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(admin.password, 10);
      await User.create({
        email: admin.email,
        passwordHash,
        name: admin.school + ' Admin',
        phone: '',
        role: 'adminSchool',
        grade: '',
        school: admin.school,
      });
      console.log(`[seed] Created school admin: ${admin.email}`);
    }
  }
}

// ── Deadline handling ──────────────────────────────────────────────────────────
// Jobs stay visible (shown as "Unavailable"/"Closed") right up until 7 days
// after their deadline passes, at which point the JOB POSTING itself is
// removed. Applications tied to that job are NEVER touched here — they store
// their own snapshot of applicant/position/grade/school/details at submission
// time, so they keep working (viewable, evaluatable, exportable) even after
// the originating job listing is gone.
async function cleanupExpiredJobs() {
  try {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const { deletedCount } = await Job.deleteMany({ deadline: { $lt: cutoffStr } });
    if (deletedCount > 0) {
      console.log(`[cleanup] Removed ${deletedCount} job posting(s) more than 7 days past their deadline.`);
    }
  } catch (err) {
    console.error('[cleanup] Error during job deadline cleanup:', err);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
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
    await seedSchoolAdmins();
    await cleanupExpiredJobs();                        // run once on startup
    setInterval(cleanupExpiredJobs, 6 * 60 * 60 * 1000); // then every 6 hours
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
