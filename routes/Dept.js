const express = require('express');
const router = express.Router();
const Dept = require('../models/Dept');

router.get('/', async (req, res) => {
  try {
    const depts = await Dept.find();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
