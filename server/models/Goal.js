const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: [true, 'Please add a goal name'],
    trim: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount'],
    min: [0, 'Target amount must be greater than zero']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Saved progress cannot be negative']
  },
  deadline: {
    type: Date,
    required: [true, 'Please set a target deadline']
  },
  color: {
    type: String,
    default: '#10B981' // Green
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Goal', GoalSchema);
