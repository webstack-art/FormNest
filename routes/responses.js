const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Form = require('../models/Form');
const FormResponse = require('../models/FormResponse');
const auth = require('../middleware/auth');

// @route   POST api/responses/submit/:formId
// @desc    Submit a form response
// @access  Public (with form access checks)
router.post('/submit/:formId', [
  body('responses').isArray({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { responses, respondentEmail } = req.body;
  const formId = req.params.formId;

  try {
    // Find the form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    // Check if form is expired or has reached max submissions
    if (form.settings.expirationDate && new Date() > new Date(form.settings.expirationDate)) {
      return res.status(400).json({ msg: 'This form is no longer accepting responses' });
    }

    if (form.settings.maxSubmissions && form.responsesCount >= form.settings.maxSubmissions) {
      return res.status(400).json({ msg: 'Maximum number of submissions reached' });
    }

    // Validate responses against form fields
    for (const response of responses) {
      const field = form.fields.find(f => f.id === response.fieldId);
      if (!field) {
        return res.status(400).json({ msg: `Invalid field ID: ${response.fieldId}` });
      }

      // Check required fields
      if (field.required && (!response.value || response.value.length === 0)) {
        return res.status(400).json({ msg: `Field "${field.label}" is required` });
      }

      // Validate email if field type is email
      if (field.type === 'email' && response.value && !/\S+@\S+\.\S+/.test(response.value)) {
        return res.status(400).json({ msg: `Invalid email format for field "${field.label}"` });
      }
    }

    // Create form response
    const newResponse = new FormResponse({
      form: formId,
      responses,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Add respondent if user is authenticated
    if (req.user) {
      newResponse.respondent = req.user.id;
    }

    const savedResponse = await newResponse.save();

    // Update form's response count
    await Form.findByIdAndUpdate(formId, {
      $inc: { responsesCount: 1 }
    });

    // Emit response to connected clients via Socket.IO
    // We'll emit the event directly using the global io reference
    if (global.io) {
      global.io.to(formId).emit('new-response', savedResponse);
    }

    res.json({ msg: 'Response submitted successfully', responseId: savedResponse._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/responses/:formId
// @desc    Get all responses for a form (admin only)
// @access  Private
router.get('/:formId', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const responses = await FormResponse.find({ form: req.params.formId })
      .populate('respondent', ['name', 'email'])
      .sort({ submittedAt: -1 });

    res.json(responses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/responses/:formId/analytics
// @desc    Get analytics for a form
// @access  Private
router.get('/:formId/analytics', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const responses = await FormResponse.find({ form: req.params.formId });

    // Calculate basic analytics
    const analytics = {
      totalResponses: responses.length,
      completionRate: form.settings.shuffleFields ? 'N/A' : '100%', // Simplified
      averageTimeToComplete: 'N/A', // Would need more data to calculate properly
      responsesByDate: [], // Group responses by date
      fieldAnalytics: {}
    };

    // Group responses by date
    const responsesByDate = {};
    responses.forEach(response => {
      const date = new Date(response.submittedAt).toDateString();
      if (!responsesByDate[date]) {
        responsesByDate[date] = 0;
      }
      responsesByDate[date]++;
    });
    
    analytics.responsesByDate = Object.entries(responsesByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate analytics for each field
    form.fields.forEach(field => {
      if (['radio', 'checkbox', 'dropdown'].includes(field.type)) {
        const fieldResponses = responses.map(r => 
          r.responses.find(resp => resp.fieldId === field.id)
        ).filter(Boolean);

        const values = {};
        fieldResponses.forEach(resp => {
          if (Array.isArray(resp.value)) {
            resp.value.forEach(v => {
              values[v] = (values[v] || 0) + 1;
            });
          } else {
            const val = resp.value;
            if (val) {
              values[val] = (values[val] || 0) + 1;
            }
          }
        });

        analytics.fieldAnalytics[field.id] = {
          fieldLabel: field.label,
          type: field.type,
          totalResponses: fieldResponses.length,
          values: values
        };
      }
    });

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/responses/:id
// @desc    Delete a specific response
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const response = await FormResponse.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ msg: 'Response not found' });
    }

    // Get the form to check ownership
    const form = await Form.findById(response.form);
    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    if (form.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await FormResponse.findByIdAndRemove(req.params.id);

    // Decrement form's response count
    await Form.findByIdAndUpdate(response.form, {
      $inc: { responsesCount: -1 }
    });

    res.json({ msg: 'Response deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;