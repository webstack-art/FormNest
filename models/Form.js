const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'number', 'email', 'phone', 'date', 'time', 'dropdown', 'checkbox', 'radio', 'file', 'rating']
  },
  label: {
    type: String,
    required: true
  },
  placeholder: String,
  description: String,
  required: {
    type: Boolean,
    default: false
  },
  validation: {
    type: String,
    enum: ['none', 'email', 'phone', 'url', 'custom']
  },
  validationPattern: String, // For custom validation
  minLength: Number,
  maxLength: Number,
  options: [{
    value: String,
    label: String
  }],
  defaultValue: String,
  conditionalLogic: {
    conditionField: String,
    conditionValue: String,
    action: {
      type: String,
      enum: ['show', 'hide']
    }
  }
}, { _id: false });

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  fields: [formFieldSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#3b82f6'
    },
    secondaryColor: {
      type: String,
      default: '#1e40af'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    font: {
      type: String,
      default: 'Arial'
    }
  },
  settings: {
    allowEditAfterSubmit: {
      type: Boolean,
      default: false
    },
    collectEmail: {
      type: Boolean,
      default: false
    },
    enableProgressBar: {
      type: Boolean,
      default: true
    },
    shuffleFields: {
      type: Boolean,
      default: false
    },
    submitButtonText: {
      type: String,
      default: 'Submit'
    },
    customThankYouMessage: String,
    requireLogin: {
      type: Boolean,
      default: false
    },
    maxSubmissions: Number,
    expirationDate: Date
  },
  sharing: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    password: String
  },
  responsesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Form', formSchema);