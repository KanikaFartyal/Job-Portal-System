const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  salary: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  education: { type: String, default: '' },
  description: { type: String, required: true },
  skills: [{ type: String }],
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
