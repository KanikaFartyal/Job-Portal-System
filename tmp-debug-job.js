const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const recruiters = await User.find({ role: { $in: ['employer', 'recruiter'] } }).lean().limit(5);
    console.log('RECRUITERS', JSON.stringify(recruiters.map(u => ({ id: u._id.toString(), email: u.email, role: u.role, name: u.name, resume: !!u.resumePath })), null, 2));
    const jobs = await Job.find().sort({ createdAt: -1 }).limit(3).lean();
    console.log('JOBS', JSON.stringify(jobs.map(job => ({ id: job._id.toString(), title: job.title, postedBy: job.postedBy?.toString ? job.postedBy.toString() : job.postedBy })), null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERR', err);
    process.exit(1);
  }
})();
