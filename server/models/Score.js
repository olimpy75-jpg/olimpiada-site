const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    enum: [9, 11],
    required: true
  },
  part1: {
    type: Number,
    default: 0,
    min: 0,
    max: 9
  },
  part2: {
    type: Number,
    default: 0,
    min: 0,
    max: 15
  },
  part3: {
    type: Number,
    default: 0,
    min: 0,
    max: 26
  },
  total: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

scoreSchema.index({ total: -1 });

module.exports = mongoose.model('Score', scoreSchema);
