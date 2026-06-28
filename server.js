require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Job = require('./models/Job');
const Application = require('./models/Application');
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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
