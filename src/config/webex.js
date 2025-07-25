/**
 * Webex Service (webex.js)
 * ------------------------
 * This service manages all interactions with the Cisco Webex API.
 * It handles the OAuth2 token refresh flow to ensure API calls are
 * always authenticated with a valid access token.
 */

const axios = require('axios');

let currentAccessToken = process.env.WEBEX_ACCESS_TOKEN;
// Set expiry to be slightly less than the actual token lifetime to be safe.
let tokenExpiryTime = Date.now() + (11 * 60 * 60 * 1000); // Assume 11 hours validity

/**
 * Refreshes the Webex access token using the long-lived refresh token.
 * This should be called automatically when the current token is about to expire.
 */
async function refreshAccessToken() {
    console.log('🔄 Webex token expired or expiring soon. Attempting to refresh...');
    try {
        const response = await axios.post('https://webexapis.com/v1/access_token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.WEBEX_CLIENT_ID,
                client_secret: process.env.WEBEX_CLIENT_SECRET,
                refresh_token: process.env.WEBEX_REFRESH_TOKEN
            }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        currentAccessToken = response.data.access_token;
        // Set the new expiry time, subtracting 5 minutes as a buffer
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000) - (5 * 60 * 1000);
        console.log('✅ Webex access token refreshed successfully.');

    } catch (error) {
        console.error('❌ FATAL: Could not refresh Webex access token.', error.response?.data || error.message);
        // This is a critical failure, as the app cannot schedule meetings without a valid token.
        throw new Error('Failed to refresh Webex access token. The refresh_token may be expired or invalid.');
    }
}

/**
 * Provides a valid Webex access token, refreshing it if necessary.
 * @returns {Promise<string>} A valid Webex access token.
 */
exports.getValidAccessToken = async () => {
    if (!currentAccessToken || Date.now() >= tokenExpiryTime) {
        await refreshAccessToken();
    }
    return currentAccessToken;
};

/**
 * Fetches existing meetings for the configured host within a given time range.
 * @param {string} accessToken - A valid Webex access token.
 * @param {string} from - The start of the time range in ISO 8601 format.
 * @param {string} to - The end of the time range in ISO 8601 format.
 * @returns {Promise<Array>} An array of meeting objects.
 */
exports.fetchMeetings = async (accessToken, from, to) => {
    const response = await axios.get('https://webexapis.com/v1/meetings', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: {
            hostEmail: process.env.FIXED_HOST_EMAIL,
            from: from,
            to: to
        }
    });
    return response.data.items;
};

/**
 * Creates a new Webex meeting.
 * @param {string} accessToken - A valid Webex access token.
 * @param {object} details - An object containing meeting details (title, agenda, times, invitees).
 * @returns {Promise<object>} The created Webex meeting object.
 */
exports.createMeeting = async (accessToken, details) => {
    const meetingData = {
        title: details.title,
        agenda: details.agenda,
        password: details.password,
        start: details.startDateTime,
        end: details.endDateTime,
        timezone: "Asia/Kolkata",
        hostEmail: process.env.FIXED_HOST_EMAIL,
        // Ensure there are no duplicate emails before mapping
        invitees: [...new Set(details.inviteeEmails)].map(email => ({ email }))
    };

    const response = await axios.post('https://webexapis.com/v1/meetings', meetingData, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};
