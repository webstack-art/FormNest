const mongoose = require('mongoose');

const formResponseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responses: [{
    fieldId: String,
    value: mongoose.Schema.Types.Mixed
  }],
  ipAddress: String,
  userAgent: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FormResponse', formResponseSchema);