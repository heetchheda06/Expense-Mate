const Income = require('../models/Income');
const Profile = require('../models/Profile');

// @desc    Get all income entries for a profile
// @route   GET /api/profiles/:id/incomes
// @access  Private
exports.getIncomes = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { month, range, startDate, endDate } = req.query;
    const query = { profileId: req.params.id };

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      if (year && monthNum) {
        const startOfMonth = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
        const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);
        query.date = { $gte: startOfMonth, $lte: endOfMonth };
      }
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    } else if (range && range !== 'lifetime') {
      const now = new Date();
      query.date = {};
      if (range === 'month') {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        query.date.$gte = oneMonthAgo;
      }
    }

    const incomes = await Income.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create income entry
// @route   POST /api/profiles/:id/incomes
// @access  Private
exports.createIncome = async (req, res) => {
  try {
    const { source, amount, date, notes } = req.body;

    if (!source || !amount) {
      return res.status(400).json({ success: false, message: 'Please enter a source and amount' });
    }

    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const income = await Income.create({
      profileId: req.params.id,
      userId: req.user.id,
      source,
      amount,
      date: date || new Date(),
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete income entry
// @route   DELETE /api/profiles/:id/incomes/:incomeId
// @access  Private
exports.deleteIncome = async (req, res) => {
  try {
    const { incomeId } = req.params;
    const income = await Income.findById(incomeId);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized for this record' });
    }

    await Income.deleteOne({ _id: incomeId });
    res.status(200).json({ success: true, message: 'Income entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
