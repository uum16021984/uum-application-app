const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      required: true,
      enum: ['calon', 'adminJSM', 'adminSchool'],
    },
    grade: { type: String, default: '' },
    school: { type: String, default: '' },
    // Reusable application info the applicant can save and reuse to pre-fill
    // future applications. NOT an application record — purely personal data storage.
    savedDraft: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    phone: this.phone,
    role: this.role,
    grade: this.grade,
    school: this.school,
    savedDraft: this.savedDraft || null,
  };
};

module.exports = mongoose.model('User', userSchema);
