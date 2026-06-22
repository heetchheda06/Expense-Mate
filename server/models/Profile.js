const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a profile name'],
    trim: true,
    maxlength: [20, 'Profile name cannot exceed 20 characters']
  },
  avatar: {
    type: String,
    default: 'GraduationCap' // We will represent avatars using modern Lucide React component names
  },
  color: {
    type: String,
    default: '#4F46E5' // Default tailwind-indigo color
  },
  monthlyBudget: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
