const Expense = require('../models/Expense');
const Profile = require('../models/Profile');

// @desc    Get expenses for a specific profile with filtering/search
// @route   GET /api/profiles/:id/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized for this profile' });
    }

    const { category, search, startDate, endDate, range } = req.query;
    const query = { profileId: req.params.id };

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Apply date filters
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    } else if (range) {
      const now = new Date();
      query.date = {};
      
      if (range === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.date.$gte = oneWeekAgo;
      } else if (range === 'month') {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        query.date.$gte = oneMonthAgo;
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new expense under a profile
// @route   POST /api/profiles/:id/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes, tags, isRecurring, recurringInterval } = req.body;
    
    if (!title || !amount || !category) {
      return res.status(400).json({ success: false, message: 'Please enter a title, amount, and category' });
    }

    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const expense = await Expense.create({
      profileId: req.params.id,
      userId: req.user.id,
      title,
      amount,
      category,
      date: date || new Date(),
      notes: notes || '',
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringInterval: recurringInterval || 'none'
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an expense
// @route   PATCH /api/profiles/:id/expenses/:expenseId
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    let expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Verify ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized for this record' });
    }

    expense = await Expense.findByIdAndUpdate(expenseId, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/profiles/:id/expenses/:expenseId
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Verify ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized for this record' });
    }

    await Expense.deleteOne({ _id: expenseId });
    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
