const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    grade: { type: String, required: true },
    school: { type: String, required: true },
    deadline: { type: String, required: true },
    postedBy: { type: String, default: '' },
    vacancies: { type: Number, default: 1, min: 1 },
    isFull: { type: Boolean, default: false },
    image: { type: String, default: '' }, // base64 data URL
  },
  { timestamps: true }
);

jobSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Job', jobSchema);
