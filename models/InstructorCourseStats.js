const mongoose = require('mongoose');

const instructorCourseStatsSchema = new mongoose.Schema({
  stat_id: String,
  course_id: String,
  instructor_id: String,
  gpa: Number,
  enrollment: Number,
  withdraw: Number,
  past_classes: Number
});

const InstructorCourseStats = mongoose.model('InstructorCourseStats', instructorCourseStatsSchema, 'instructor_course_stats');

module.exports = InstructorCourseStats;
