const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const educationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  degree: { type: String, default: '' },
  schoolName: { type: String, default: '' },
  boardName: { type: String, default: '' },
  collegeName: { type: String, default: '' },
  universityName: { type: String, default: '' },
  startYear: { type: String, default: '' },
  endYear: { type: String, default: '' },
  expectedGraduationYear: { type: String, default: '' },
  current: { type: Boolean, default: false },
  noBacklogs: { type: Boolean, default: true },
  specialization: { type: String, default: '' },
  percentage: { type: String, default: '' },
  cgpa: { type: String, default: '' },
  skillsLearned: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employer', 'jobseeker', 'recruiter'], default: 'jobseeker' },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  avatarPath: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  college: { type: String, default: '' },
  degree: { type: String, default: '' },
  educationDetails: { type: String, default: '' },
  education: { type: [educationSchema], default: [] },
  skills: { type: [String], default: [] },
  experience: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  resumePath: { type: String, default: '' },
  about: { type: String, default: '' },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  notifications: [notificationSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
