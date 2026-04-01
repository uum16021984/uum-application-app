const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicantName: { type: String, required: true },
    position: { type: String, required: true },
    grade: { type: String, default: '' },
    school: { type: String, default: '' },

    // ✅ FIXED (added enum)
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // ✅ ADDED (for DS11 / DS13 separation - safe addition)
    program: {
      type: String,
      enum: ['DS11', 'DS13'],
      default: '',
    },

    dateApplied: { type: String, default: '' },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    jobTitle: { type: String, default: '' },
    applicant: { type: String, default: '' },
    qualification: { type: String, default: '' },
    experience: { type: String, default: '' },
    resume: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    schoolApproved: { type: Boolean, default: false },
    schoolRejected: { type: Boolean, default: false },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

applicationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.applicantId) ret.applicantId = ret.applicantId.toString();
    if (ret.jobId) ret.jobId = ret.jobId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Application', applicationSchema);
  },
});

module.exports = mongoose.model('Application', applicationSchema);
