const Profile = require('../models/Profile');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Goal = require('../models/Goal');

// @desc    Get all profiles for active user
// @route   GET /api/profiles
// @access  Private
exports.getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({ userId: req.user.id });
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new budget profile
// @route   POST /api/profiles
// @access  Private
exports.createProfile = async (req, res) => {
  try {
    const { name, avatar, color, monthlyBudget } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a profile name' });
    }

    // Check profile limit (up to 5)
    const profileCount = await Profile.countDocuments({ userId: req.user.id });
    if (profileCount >= 5) {
      return res.status(400).json({ success: false, message: 'Limit exceeded: You can only create up to 5 profiles.' });
    }

    const profile = await Profile.create({
      userId: req.user.id,
      name,
      avatar: avatar || 'GraduationCap',
      color: color || '#4F46E5',
      monthlyBudget: monthlyBudget || 0
    });

    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile configurations
// @route   PATCH /api/profiles/:id
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Validate ownership
    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized for this profile' });
    }

    profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a profile & cascade delete transaction logs
// @route   DELETE /api/profiles/:id
// @access  Private
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Validate ownership
    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized for this profile' });
    }

    // Perform cascade deletions
    await Expense.deleteMany({ profileId: profile._id });
    await Income.deleteMany({ profileId: profile._id });
    await Goal.deleteMany({ profileId: profile._id });

    // Remove profile itself
    await Profile.deleteOne({ _id: profile._id });

    res.status(200).json({ success: true, message: 'Profile and associated finances deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
