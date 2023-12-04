const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri).then(() => {
  console.log("Successfully connected to MongoDB.");
}).catch(err => {
  console.error("Connection error", err);
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Import routes
const deptsRouter = require('./routes/Dept');
const coursesRouter = require('./routes/Course');
const instructorsRouter = require('./routes/Instructor');
const pastInstancesRouter = require('./routes/PastInstance');
const instructorCourseStatsRouter = require('./routes/InstructorCourseStats');
const newInstancesRouter = require('./routes/NewInstance');
const userRouter = require('./routes/User');


app.use('/api/dept', deptsRouter);
app.use('/api/course', coursesRouter);
app.use('/api/instructor', instructorsRouter);
app.use('/api/pastInstance', pastInstancesRouter);
app.use('/api/instructorCourseStat', instructorCourseStatsRouter);
app.use('/api/newInstance', newInstancesRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});