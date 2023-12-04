const express = require('express');
const router = express.Router();
const InstructorCourseStats = require('../models/InstructorCourseStats');

router.get('/', async (req, res) => {
  try {
    const stats = await InstructorCourseStats.find();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
