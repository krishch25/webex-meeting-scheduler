/**
 * Meeting Routes (meetingRoutes.js)
 * ---------------------------------
 * This file defines the API endpoints for all meeting-related actions.
 * It protects these routes using the verifyToken middleware to ensure
 * only authenticated users can access them.
 */

const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/meetings/availability
 * @desc    Checks the host's calendar for existing meetings within a time range.
 * @access  Private (Requires valid JWT)
 */
router.get('/availability', verifyToken, meetingController.checkAvailability);

/**
 * @route   POST /api/meetings/schedule
 * @desc    Schedules a new Webex meeting.
 * @access  Private (Requires valid JWT)
 */
router.post('/schedule', verifyToken, meetingController.scheduleMeeting);

module.exports = router;
