const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Form = require('../models/Form');
const auth = require('../middleware/auth');

// @route   GET api/forms
// @desc    Get all forms for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const forms = await Form.find({ creator: req.user.id }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/forms/:id
// @desc    Get a specific form by ID
// @access  Private/Public depending on sharing settings
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    // Check if form is public or user has access
    if (!form.sharing.isPublic && !req.headers['x-auth-token']) {
      return res.status(401).json({ msg: 'Access denied' });
    }

    res.json(form);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/forms
// @desc    Create a new form
// @access  Private
router.post('/', [auth, [
  body('title', 'Title is required').not().isEmpty(),
  body('fields').isArray()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, fields, theme, settings, sharing } = req.body;

  try {
    const newForm = new Form({
      title,
      description,
      fields,
      theme,
      settings,
      sharing,
      creator: req.user.id
    });

    const form = await newForm.save();
    res.json(form);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/forms/:id
// @desc    Update a form
// @access  Private
router.put('/:id', [auth, [
  body('title', 'Title is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, fields, theme, settings, sharing } = req.body;

  try {
    let form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    // Check ownership
    if (form.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const updateData = {
      title,
      description,
      fields,
      theme,
      settings,
      sharing,
      updatedAt: Date.now()
    };

    form = await Form.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json(form);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/forms/:id
// @desc    Delete a form
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    // Check ownership
    if (form.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Form.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Form removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/forms/:id/share
// @desc    Update sharing settings for a form
// @access  Private
router.post('/:id/share', auth, async (req, res) => {
  const { isPublic, allowedUsers, password } = req.body;

  try {
    let form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    // Check ownership
    if (form.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const sharingUpdate = {
      isPublic,
      allowedUsers,
      password
    };

    form = await Form.findByIdAndUpdate(
      req.params.id,
      { $set: { sharing: sharingUpdate } },
      { new: true }
    );

    res.json(form);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/forms/:id/responses
// @desc    Get responses for a form
// @access  Private
router.get('/:id/responses', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ msg: 'Form not found' });
    }

    // Check ownership
    if (form.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Get responses for this form
    const FormResponse = require('../models/FormResponse');
    const responses = await FormResponse.find({ form: req.params.id }).sort({ submittedAt: -1 });
    
    res.json(responses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;