const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/createAdmin', protect, admin, userController.createAdmin);
router.post('/changePassword', protect, userController.changeUserPassword);
router.post('/addToSchedule', protect, userController.addToSchedule);
router.post('/removeFromSchedule', protect, userController.removeFromSchedule);
router.get('/schedule/:username', protect, userController.getUserSchedule);

module.exports = router;