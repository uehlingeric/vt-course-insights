const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  instructor_id: String,
  last_name: String,
  dept: String,
  gpa: Number,
  enrollment: Number,
  withdraw: Number,
  past_classes: Number,
  new_classes: Number
});

const Instructor = mongoose.model('Instructor', instructorSchema, 'instructor');

module.exports = Instructor;
