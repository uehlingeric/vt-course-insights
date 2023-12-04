const express = require('express');
const router = express.Router();
const PastInstance = require('../models/PastInstance');

router.get('/', async (req, res) => {
  try {
    const pastInstances = await PastInstance.find();
    res.json(pastInstances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
