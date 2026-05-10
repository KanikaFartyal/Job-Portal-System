const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json(user.notifications || []);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch notifications' });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications = user.notifications.map((notification) => ({
      ...notification.toObject(),
      read: true
    }));
    await user.save();
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Could not mark notifications read' });
  }
});

module.exports = router;
