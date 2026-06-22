const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add an expense title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add a spending amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Food',
      'Transport',
      'Education',
      'Shopping',
      'Health',
      'Bills',
      'EMI',
      'Investments',
      'Entertainment',
      'Miscellaneous',
      'Grocery'
    ]
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    default: 'none',
    enum: ['none', 'daily', 'weekly', 'monthly']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
