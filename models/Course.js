const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_id: String,
  dept: String,
  title: String,
  credits: Number,
  gpa: Number,
  enrollment: Number,
  withdraw: Number,
  past_classes: Number,
  new_classes: Number
});

const Course = mongoose.model('Course', courseSchema, 'course');

module.exports = Course;
