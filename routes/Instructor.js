const express = require('express');
const router = express.Router();
const Instructor = require('../models/Instructor');

// Endpoint to get all instructors
router.get('/', async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
