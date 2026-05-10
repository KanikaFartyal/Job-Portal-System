const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const recruiterOnly = (req, res, next) => {
  if (!['employer', 'recruiter'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only recruiters/employers can perform this action' });
  }
  next();
};

const buildQuery = (query) => {
  const filters = {};
  if (query.search) {
    filters.title = { $regex: query.search, $options: 'i' };
  }
  if (query.company) {
    filters.company = { $regex: query.company, $options: 'i' };
  }
  if (query.location) {
    filters.location = { $regex: query.location, $options: 'i' };
  }
  if (query.type) {
    filters.type = query.type;
  }
  if (query.skills) {
    const skills = query.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
    if (skills.length) {
      filters.skills = { $all: skills };
    }
  }
  if (query.salary) {
    filters.salary = { $regex: query.salary, $options: 'i' };
  }
  return filters;
};

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const filters = buildQuery(req.query);
    const total = await Job.countDocuments(filters);
    const jobs = await Job.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('postedBy', 'name email');

    res.json({ jobs, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch jobs', detail: error.message });
  }
});

router.get('/mine', auth, recruiterOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch posted jobs', detail: error.message });
  }
});

router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'savedJobs', populate: { path: 'postedBy', select: 'name email' } });
    res.json(user.savedJobs || []);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch saved jobs' });
  }
});

router.get('/applied', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ applicants: req.user._id }).populate('postedBy', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch applied jobs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email').populate('applicants', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch job details' });
  }
});

const createMatchingNotifications = async (job) => {
  const requiredSkills = job.skills || [];
  const minExperience = Number(job.experience || 0);
  const requiredEducation = (job.education || '').toLowerCase();

  const users = await User.find({
    role: 'jobseeker',
    resumePath: { $exists: true, $ne: '' },
    skills: { $exists: true, $ne: [] }
  });

  const matchedUsers = users.filter((user) => {
    const userSkills = (user.skills || []).map((skill) => skill.toLowerCase());
    const skillMatches = requiredSkills.length === 0 || requiredSkills.some((skill) => userSkills.includes(skill.toLowerCase()));
    const userExperience = Number(user.experience) || 0;
    const experienceMatch = minExperience === 0 || userExperience >= minExperience;
    const degree = (user.degree || '').toLowerCase();
    const educationMatch = !requiredEducation || degree.includes(requiredEducation) || (user.educationDetails || '').toLowerCase().includes(requiredEducation) || user.education.some((entry) => String(entry.degree || entry.specialization || entry.schoolName || entry.collegeName || entry.universityName).toLowerCase().includes(requiredEducation));

    return skillMatches && experienceMatch && educationMatch;
  });

  const notificationText = `New ${job.title} job matches your profile.`;

  for (const user of matchedUsers) {
    user.notifications.push({
      title: 'Job Match Alert',
      message: notificationText,
      read: false,
      createdAt: new Date()
    });
    await user.save();
  }
};

const checkJobSeekerEligibility = (user, job) => {
  if (user.role !== 'jobseeker') {
    return { eligible: false, reason: 'Only job seekers can apply for this position.' };
  }
  if (!user.resumePath) {
    return { eligible: false, reason: 'Please upload your resume to apply for this job.' };
  }
  const requiredSkills = job.skills || [];
  const userSkills = (user.skills || []).map((skill) => skill.toLowerCase());
  const missingSkill = requiredSkills.find((skill) => !userSkills.includes(skill.toLowerCase()));
  if (missingSkill) {
    return { eligible: false, reason: `Missing skill: ${missingSkill}. This position requires expertise in ${missingSkill}.` };
  }
  const requiredExperience = Number(job.experience || 0);
  const userExperience = Number(user.experience) || 0;
  if (requiredExperience > userExperience) {
    return { eligible: false, reason: `Less experience: You have ${userExperience} years, but this position requires ${requiredExperience}+ years of experience.` };
  }
  const requiredEducation = (job.education || '').trim().toLowerCase();
  if (requiredEducation) {
    const degreeMatch = (user.degree || '').toLowerCase().includes(requiredEducation);
    const detailsMatch = (user.educationDetails || '').toLowerCase().includes(requiredEducation);
    const educationEntriesMatch = (user.education || []).some((entry) => {
      return [entry.degree, entry.specialization, entry.schoolName, entry.collegeName, entry.universityName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(requiredEducation));
    });
    if (!degreeMatch && !detailsMatch && !educationEntriesMatch) {
      return { eligible: false, reason: `Education not matched: This position requires ${job.education}. Please update your profile with the required education details.` };
    }
  }
  return { eligible: true, reason: '' };
};

router.post('/', auth, recruiterOnly, async (req, res) => {
  const { title, company, location, type, salary, description, skills, experience, education } = req.body;
  try {
    const skillsArray = typeof skills === 'string'
      ? skills.split(',').map((skill) => skill.trim()).filter(Boolean)
      : Array.isArray(skills) ? skills.map((skill) => String(skill).trim()).filter(Boolean) : [];
    const job = new Job({
      title,
      company,
      location,
      type,
      salary: salary || '',
      description,
      skills: skillsArray,
      experience: Number(experience) || 0,
      education: education || '',
      postedBy: req.user._id,
      recruiterId: req.user._id
    });
    await job.save();
    await createMatchingNotifications(job);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Could not create job', detail: error.message });
  }
});

router.put('/apply/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const eligibility = checkJobSeekerEligibility(req.user, job);
    if (!eligibility.eligible) {
      return res.status(403).json({ message: eligibility.reason });
    }
    if (job.applicants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already applied' });
    }
    job.applicants.push(req.user._id);
    await job.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        notifications: {
          title: 'Application Sent',
          message: `You have applied to ${job.title} at ${job.company}.`
        }
      }
    });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Could not apply to job' });
  }
});

router.put('/save/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.id;
    const alreadySaved = user.savedJobs.some((id) => id.toString() === jobId);
    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
      await user.save();
      return res.json({ message: 'Job removed from saved jobs' });
    }
    user.savedJobs.push(jobId);
    user.notifications.push({ title: 'Job Saved', message: 'You saved a job for later review.' });
    await user.save();
    res.json({ message: 'Job saved' });
  } catch (error) {
    res.status(500).json({ message: 'Could not toggle saved job' });
  }
});



router.get('/stats', auth, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const postedJobs = await Job.countDocuments({ postedBy: req.user._id });
    const appliedJobs = await Job.countDocuments({ applicants: req.user._id });
    const appResults = await Job.aggregate([
      { $project: { applicantCount: { $size: '$applicants' } } },
      { $group: { _id: null, total: { $sum: '$applicantCount' } } }
    ]);
    const totalApplications = appResults[0]?.total || 0;
    res.json({ totalJobs, totalApplications, postedJobs, appliedJobs });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch dashboard stats' });
  }
});

router.put('/:id', auth, recruiterOnly, async (req, res) => {
  const { title, company, location, type, salary, description, skills, experience, education } = req.body;
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    job.title = title || job.title;
    job.company = company || job.company;
    job.location = location || job.location;
    job.type = type || job.type;
    job.salary = salary || job.salary;
    job.description = description || job.description;
    job.skills = typeof skills === 'string' ? skills.split(',').map((skill) => skill.trim()).filter(Boolean) : Array.isArray(skills) ? skills.map((skill) => String(skill).trim()).filter(Boolean) : job.skills;
    job.experience = Number(experience || job.experience);
    job.education = education || job.education;
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Could not update job', detail: error.message });
  }
});

router.delete('/:id', auth, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete job' });
  }
});

router.get('/:id/applicants', auth, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('applicants', 'name email phone resumePath');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized - you can only view applicants for your own jobs' });
    }
    res.json(job.applicants);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch applicants', detail: error.message });
  }
});

module.exports = router;
