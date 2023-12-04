const mongoose = require('mongoose');

const pastInstanceSchema = new mongoose.Schema({
  instance_id: String,
  course_id: String,
  instructor_id: String,
  year: String,
  term: String,
  crn: String,
  gpa: Number,
  withdraw: Number,
  enrollment: Number
});

const PastInstance = mongoose.model('PastInstance', pastInstanceSchema, 'past_instance');

module.exports = PastInstance;
