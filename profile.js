const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch profile' });
  }
});

const parseEducation = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeEducation = (educationArray) => {
  return parseEducation(educationArray).map((entry) => {
    if (!entry || typeof entry !== 'object') return entry;
    if (typeof entry._id === 'string' && entry._id.startsWith('temp-')) {
      const { _id, clientId, ...rest } = entry;
      return rest;
    }
    return entry;
  });
};

const parseArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter((item) => item && item !== '[]');
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '[]') return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? item.trim() : item))
          .filter((item) => item && item !== '[]');
      }
    } catch {
      // fall back to comma-separated values
    }
    return trimmed.split(',').map((skill) => skill.trim()).filter((item) => item && item !== '[]');
  }
  return [];
};

router.put('/me', auth, upload.fields([{ name: 'avatar' }, { name: 'resume' }]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.college = req.body.college !== undefined ? req.body.college : user.college;
    user.degree = req.body.degree !== undefined ? req.body.degree : user.degree;
    user.educationDetails = req.body.educationDetails !== undefined ? req.body.educationDetails : user.educationDetails;
    user.education = req.body.education !== undefined ? normalizeEducation(req.body.education) : user.education;
    user.experience = req.body.experience !== undefined ? req.body.experience : user.experience;
    user.linkedin = req.body.linkedin !== undefined ? req.body.linkedin : user.linkedin;
    user.github = req.body.github !== undefined ? req.body.github : user.github;
    user.about = req.body.about !== undefined ? req.body.about : user.about;

    if (req.body.skills !== undefined) {
      user.skills = parseArrayField(req.body.skills);
    }

    if (req.files?.avatar?.length) {
      user.avatarPath = `/uploads/avatars/${req.files.avatar[0].filename}`;
    }

    if (req.files?.resume?.length) {
      user.resumePath = `/uploads/resumes/${req.files.resume[0].filename}`;
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Request files:', req.files);
    res.status(500).json({ 
      message: 'Could not update profile', 
      detail: error.message,
      mongooseError: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : null
    });
  }
});

router.post('/education', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const educationEntry = {
      type: req.body.type || 'High School',
      degree: req.body.degree || '',
      schoolName: req.body.schoolName || '',
      boardName: req.body.boardName || '',
      collegeName: req.body.collegeName || '',
      universityName: req.body.universityName || '',
      startYear: req.body.startYear || '',
      endYear: req.body.endYear || '',
      expectedGraduationYear: req.body.expectedGraduationYear || '',
      current: req.body.current === 'true' || req.body.current === true,
      noBacklogs: req.body.noBacklogs === undefined ? true : req.body.noBacklogs === 'true' || req.body.noBacklogs === true,
      specialization: req.body.specialization || '',
      percentage: req.body.percentage || '',
      cgpa: req.body.cgpa || '',
      skillsLearned: req.body.skillsLearned || '',
      city: req.body.city || '',
      state: req.body.state || ''
    };

    user.education.push(educationEntry);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not add education entry', detail: error.message });
  }
});

router.put('/education/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const education = user.education.id(req.params.id);
    if (!education) return res.status(404).json({ message: 'Education entry not found' });

    education.type = req.body.type || education.type;
    education.degree = req.body.degree || education.degree;
    education.schoolName = req.body.schoolName || education.schoolName;
    education.boardName = req.body.boardName || education.boardName;
    education.collegeName = req.body.collegeName || education.collegeName;
    education.universityName = req.body.universityName || education.universityName;
    education.startYear = req.body.startYear || education.startYear;
    education.endYear = req.body.endYear || education.endYear;
    education.expectedGraduationYear = req.body.expectedGraduationYear || education.expectedGraduationYear;
    education.current = req.body.current === 'true' || req.body.current === true || education.current;
    education.noBacklogs = req.body.noBacklogs === undefined ? education.noBacklogs : req.body.noBacklogs === 'true' || req.body.noBacklogs === true;
    education.specialization = req.body.specialization || education.specialization;
    education.percentage = req.body.percentage || education.percentage;
    education.cgpa = req.body.cgpa || education.cgpa;
    education.skillsLearned = req.body.skillsLearned || education.skillsLearned;
    education.city = req.body.city || education.city;
    education.state = req.body.state || education.state;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not update education entry', detail: error.message });
  }
});

router.delete('/education/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.education.id(req.params.id)?.remove();
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not delete education entry', detail: error.message });
  }
});

module.exports = router;
