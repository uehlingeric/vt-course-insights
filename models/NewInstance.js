const mongoose = require('mongoose');

const newInstanceSchema = new mongoose.Schema({
  crn: String,
  dept: String,
  course_id: String,
  instructor_id: String,
  title: String,
  modality: String,
  credits: Number,
  capacity: Number,
  days: String,
  start_time: String,
  end_time: String,
  location: String
});

const NewInstance = mongoose.model('NewInstance', newInstanceSchema, 'new_instance');

module.exports = NewInstance;
