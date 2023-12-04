const mongoose = require('mongoose');

const deptSchema = new mongoose.Schema({
  dept_id: String,
  gpa: Number,
  past_classes: Number,
  unique_classes: Number,
  new_classes: Number,
  title: String
});

const Dept = mongoose.model('Dept', deptSchema, 'dept');

module.exports = Dept;
