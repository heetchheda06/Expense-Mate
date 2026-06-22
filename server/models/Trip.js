const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  contact: {
    type: String,
    default: ''
  },
  memberCount: {
    type: Number,
    default: 1,
    min: [1, 'Number of people must be at least 1']
  }
});

const ContributionSchema = new mongoose.Schema({
  memberName: {
    type: String,
    required: [true, 'Contributor name is required']
  },
  amount: {
    type: Number,
    required: [true, 'Contribution amount is required'],
    min: [0, 'Contribution cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Travel', 'Food', 'Hotel', 'Fuel', 'Shopping', 'Activities', 'Miscellaneous']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Expense cannot be negative']
  },
  paidBy: {
    type: String,
    required: [true, 'Paid By is required'] // Either a member name, or "Common Cash"
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
});

const TripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Trip name is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [MemberSchema],
  contributions: [ContributionSchema],
  expenses: [ExpenseSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', TripSchema);
