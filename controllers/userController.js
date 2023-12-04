const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT for a user
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

/**
 * Registers a new user in the system.
 * It checks if a user with the given username already exists and if not,
 * creates a new user with a hashed password.
 */
const registerUser = async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password and create user
    const user = await User.create({
        username,
        password, // Password will be hashed automatically due to pre-save middleware in User model
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
            schedule: []
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

/**
 * Authenticates a user and returns a JWT token.
 * It checks if the user exists and if the password is correct.
 */
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    // Check if user exists and password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

/**
 * Allows a user to change their password.
 * It checks the old password for validation and then updates it to the new password.
 */
const changeUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id); // Use _id to find the user

    if (user && (await bcrypt.compare(oldPassword, user.password))) {
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(400).json({ message: 'Invalid old password' });
    }
};

/**
 * Admin-only function to create a new admin user.
 * It checks if the current user is an admin and if so, allows them to create another admin user.
 */
const createAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (req.user && req.user.role === 'admin') {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            password,
            role: 'admin', // Set the user role to admin
            schedule: []
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized to create admin' });
    }
};

/**
 * Adds a course (by CRN) to a user's schedule.
 * It ensures that the course is not already in the user's schedule before adding it.
 */
const addToSchedule = async (req, res) => {
    const { username, crn } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add the CRN to the user's schedule if it's not already there
        if (!user.schedule.includes(crn)) {
            user.schedule.push(crn);
            await user.save();
        }

        res.status(200).json({ message: 'CRN added to schedule successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding CRN to schedule' });
    }
};

/**
 * Removes a course (by NewInstance ID) from a user's schedule.
 */
const removeFromSchedule = async (req, res) => {
    const { username, newInstanceId } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.schedule = user.schedule.filter(id => id.toString() !== newInstanceId);
        await user.save();

        res.status(200).json({ message: 'NewInstance removed from user successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing NewInstance from user' });
    }
};

/**
 * Retrieves the schedule of a user.
 * It populates the schedule field with the course details.
 */
const getUserSchedule = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).populate('schedule');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ schedule: user.schedule });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching user schedule' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    changeUserPassword,
    createAdmin,
    addToSchedule,
    removeFromSchedule,
    getUserSchedule
};
