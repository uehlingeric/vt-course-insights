const express = require('express');
const router = express.Router();
const NewInstance = require('../models/NewInstance');

router.get('/', async (req, res) => {
  try {
    const newInstances = await NewInstance.find();
    res.json(newInstances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
