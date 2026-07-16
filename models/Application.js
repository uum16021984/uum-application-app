const mongoose = require('mongoose');

const VALID_GRADES  = ['DS11', 'DS13', 'DG9'];
const VALID_SCHOOLS = [
  'Tunku Puteri Intan Safinaz School of Accountancy',
  'School of Business Management',
  'School of Economics, Finance and Banking',
  'Islamic Business School',
  'School of Technology Management and Logistics',
  'School of Creative Industry Management and Performing Arts',
  'School of Multimedia Technology and Communication',
  'School of Applied Psychology, Social Work and Policy',
  'School of Quantitative Sciences',
  'School of Education',
  'School of Computing',
  'School of Languages, Civilization and Philosophy',
  'School of Law',
  'School of International Studies',
  'School of Government',
  'School of Tourism, Hospitality and Event Management',
];

const applicationSchema = new mongoose.Schema(
  {
    applicantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicantName: { type: String, required: true },
    position:      { type: String, required: true },
    grade:         { type: String, enum: VALID_GRADES, required: true },
    school:        { type: String, enum: VALID_SCHOOLS, required: true },
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    schoolStatus: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    jsmStatus: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    dateApplied:   { type: String, default: '' },
    details:       { type: mongoose.Schema.Types.Mixed, default: {} },
    jobId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    jobTitle:      { type: String, default: '' },
    applicant:     { type: String, default: '' },
    qualification: { type: String, default: '' },
    experience:    { type: String, default: '' },
    resume:        { type: String, default: '' },
    coverLetter:   { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    // Audit trail
    reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

// One applicant can only have one application per job
applicationSchema.index({ applicantId: 1, jobId: 1 }, { unique: true, sparse: true });

applicationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.applicantId) ret.applicantId = ret.applicantId.toString();
    if (ret.jobId)       ret.jobId       = ret.jobId.toString();
    if (ret.reviewedBy)  ret.reviewedBy  = ret.reviewedBy.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Application', applicationSchema);
