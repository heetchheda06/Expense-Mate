const Goal = require('../models/Goal');
const Profile = require('../models/Profile');

// @desc    Get savings goals for a profile
// @route   GET /api/profiles/:id/goals
// @access  Private
exports.getGoals = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const goals = await Goal.find({ profileId: req.params.id }).sort({ deadline: 1 });
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create savings goal under a profile
// @route   POST /api/profiles/:id/goals
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, color } = req.body;

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({ success: false, message: 'Please enter a name, target, and deadline' });
    }

    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const goal = await Goal.create({
      profileId: req.params.id,
      userId: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      color: color || '#10B981'
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a savings goal
// @route   PATCH /api/profiles/:id/goals/:goalId
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    let goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized for this record' });
    }

    goal = await Goal.findByIdAndUpdate(goalId, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a savings goal
// @route   DELETE /api/profiles/:id/goals/:goalId
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized for this record' });
    }

    await Goal.deleteOne({ _id: goalId });
    res.status(200).json({ success: true, message: 'Savings goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
