/**
 * Meeting Controller (meetingController.js)
 * -----------------------------------------
 * This file contains the logic for handling meeting-related API requests.
 * It interacts with the Webex service to fetch availability and create meetings.
 */

const webexService = require('../config/webex');

/**
 * Checks meeting availability for the fixed host account.
 * It retrieves a valid access token and fetches meetings for a given time range.
 *
 * @param {object} req - Express request object, with `from` and `to` in query params.
 * @param {object} res - Express response object.
 */
exports.checkAvailability = async (req, res) => {
    try {
        const accessToken = await webexService.getValidAccessToken();
        const { from, to } = req.query; // Expecting ISO 8601 format (e.g., 2025-07-25T00:00:00)

        if (!from || !to) {
            return res.status(400).json({ message: 'A "from" and "to" date range is required.' });
        }

        const meetings = await webexService.fetchMeetings(accessToken, from, to);
        res.status(200).json({ meetings });

    } catch (error) {
        console.error('[MEETING_CONTROLLER_ERROR] Error fetching availability:', error.message);
        res.status(500).json({ message: 'Failed to fetch meeting availability.' });
    }
};

/**
 * Schedules a new Webex meeting.
 * It enriches the meeting agenda with the scheduler's information and ensures
 * the scheduler is also invited to the meeting.
 *
 * @param {object} req - Express request object, containing meeting details in the body.
 * @param {object} res - Express response object.
 */
exports.scheduleMeeting = async (req, res) => {
    try {
        const accessToken = await webexService.getValidAccessToken();
        const meetingDetails = req.body;

        // --- Enrich meeting data ---
        // Prepend the scheduler's info to the agenda for context.
        const schedulerInfo = `--------------------------------\nScheduled by: ${req.user.name} (${req.user.email})\n--------------------------------\n\n`;
        meetingDetails.agenda = schedulerInfo + (meetingDetails.agenda || 'No description provided.');

        // Ensure the person scheduling the meeting is always included as an invitee.
        if (meetingDetails.inviteeEmails) {
            meetingDetails.inviteeEmails.push(req.user.email);
        } else {
            meetingDetails.inviteeEmails = [req.user.email];
        }

        const meeting = await webexService.createMeeting(accessToken, meetingDetails);
        res.status(201).json({ success: true, meeting });

    } catch (error) {
        console.error('[MEETING_CONTROLLER_ERROR] Error scheduling meeting:', error.message);
        res.status(500).json({ success: false, message: 'Failed to schedule the Webex meeting.' });
    }
};
