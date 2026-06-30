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
  };
};

module.exports = mongoose.model('User', userSchema);
