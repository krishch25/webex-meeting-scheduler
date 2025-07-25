/**
 * Reliance Meeting Scheduler - Frontend Logic
 *
 * This script handles all client-side interactions, including:
 * - User login and logout (JWT handling).
 * - Dynamically building and validating the scheduler form.
 * - Communicating with the backend API to check availability and schedule meetings.
 * - Displaying success, error, and loading states to the user.
 */
class RelianceMeetingScheduler {
    constructor() {
        // --- Cache DOM Elements ---
        this.loginContainer = document.getElementById('loginContainer');
        this.schedulerContainer = document.getElementById('schedulerContainer');
        this.loginForm = document.getElementById('loginForm');
        this.meetingForm = document.getElementById('meetingForm');
        this.loginBtn = document.getElementById('loginBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.loggedInUsernameSpan = document.getElementById('loggedInUsername');
        this.loginErrorPanel = document.getElementById('loginErrorPanel');
        this.loginErrorMessage = document.getElementById('loginErrorMessage');
        this.successPanel = document.getElementById('successPanel');
        this.errorPanel = document.getElementById('errorPanel');

        // --- State ---
        this.isAuthenticated = false;
        this.existingMeetings = [];
        this.selectedTimeSlot = null;

        this.initialize();
    }

    /**
     * Main entry point for the application.
     */
    initialize() {
        this.attachEventListeners();
        this.checkAuthenticationStatus();
    }

    /**
     * Attach all necessary event listeners.
     */
    attachEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    /**
     * Check for an existing auth token in localStorage to maintain session.
     */
    checkAuthenticationStatus() {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.isAuthenticated = true;
            this.showScheduler();
        } else {
            this.showLogin();
        }
    }

    /**
     * Show the login form and hide the scheduler.
     */
    showLogin() {
        this.loginContainer.style.display = 'block';
        this.schedulerContainer.style.display = 'none';
    }

    /**
     * Show the scheduler and hide the login form.
     */
    showScheduler() {
        this.loginContainer.style.display = 'none';
        this.schedulerContainer.style.display = 'block';
        this.loggedInUsernameSpan.textContent = localStorage.getItem('loggedInUserName') || 'User';
        this.buildSchedulerForm();
    }

    /**
     * Handle the login form submission.
     */
    async handleLogin(e) {
        e.preventDefault();
        this.setLoadingState(this.loginBtn, true, 'Authenticating...');

        const username = this.loginForm.userid.value;
        const password = this.loginForm.password.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            // Store session info
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('loggedInUserName', data.user.name);
            localStorage.setItem('loggedInUserEmail', data.user.email);

            this.isAuthenticated = true;
            this.showScheduler();

        } catch (error) {
            this.displayLoginError(error.message);
        } finally {
            this.setLoadingState(this.loginBtn, false, 'Login');
        }
    }

    /**
     * Handle user logout.
     */
    handleLogout() {
        // Clear session info
        localStorage.removeItem('authToken');
        localStorage.removeItem('loggedInUserName');
        localStorage.removeItem('loggedInUserEmail');

        this.isAuthenticated = false;
        this.meetingForm.innerHTML = ''; // Clear the dynamic form
        this.showLogin();
    }

    /**
     * Dynamically builds the HTML for the scheduler form.
     */
    buildSchedulerForm() {
        this.meetingForm.innerHTML = `
            <section class="form-section">
                <h4 class="section-title">Meeting Host Information</h4>
                <div class="input-group">
                    <label for="fullName" class="input-label">Full Name</label>
                    <input type="text" id="fullName" class="form-input" value="${localStorage.getItem('loggedInUserName')}" readonly>
                </div>
                <div class="input-group">
                    <label for="emailAddress" class="input-label">Email Address</label>
                    <input type="email" id="emailAddress" class="form-input" value="${localStorage.getItem('loggedInUserEmail')}" readonly>
                </div>
            </section>

            <section class="form-section">
                <h4 class="section-title">Meeting Details</h4>
                <div class="input-group">
                    <label for="meetingTitle" class="input-label">Meeting Title <span class="required">*</span></label>
                    <input type="text" id="meetingTitle" class="form-input" required>
                </div>
                <div class="input-group">
                    <label for="meetingDescription" class="input-label">Meeting Description</label>
                    <textarea id="meetingDescription" class="form-textarea"></textarea>
                </div>
                 <div class="input-group">
                    <label for="meetingPassword" class="input-label">Meeting Password (Optional)</label>
                    <input type="text" id="meetingPassword" class="form-input">
                </div>
            </section>

            <section class="form-section">
                <h4 class="section-title">Meeting Schedule</h4>
                <div class="input-group">
                    <label for="meetingDate" class="input-label">Meeting Date <span class="required">*</span></label>
                    <input type="date" id="meetingDate" class="form-input" required>
                </div>
                <div class="time-fields">
                    <div class="input-group">
                        <label for="startTime" class="input-label">Start Time <span class="required">*</span></label>
                        <input type="time" id="startTime" class="form-input" required>
                    </div>
                    <div class="input-group">
                        <label for="endTime" class="input-label">End Time <span class="required">*</span></label>
                        <input type="time" id="endTime" class="form-input" required>
                    </div>
                </div>
                 <div class="error-message" id="timeRangeError"></div>
            </section>

             <section class="form-section">
                <h4 class="section-title">Meeting Participants</h4>
                <div class="input-group">
                    <label for="participantEmails" class="input-label">Participant Emails <span class="required">*</span></label>
                    <textarea id="participantEmails" class="form-textarea" required placeholder="Enter emails separated by commas..."></textarea>
                </div>
            </section>

            <div class="form-actions">
                <button type="submit" id="scheduleBtn" class="submit-button">
                    <span class="button-text">Schedule Meeting</span>
                    <div class="loading-spinner"></div>
                </button>
            </div>
        `;

        // Attach event listener to the newly created form
        this.meetingForm.addEventListener('submit', (e) => this.handleSchedule(e));
        document.getElementById('meetingDate').min = new Date().toISOString().split("T")[0];
    }

    /**
     * Handle the schedule meeting form submission.
     */
    async handleSchedule(e) {
        e.preventDefault();
        const scheduleBtn = document.getElementById('scheduleBtn');
        this.setLoadingState(scheduleBtn, true, 'Scheduling...');

        const meetingDetails = {
            title: document.getElementById('meetingTitle').value,
            agenda: document.getElementById('meetingDescription').value,
            password: document.getElementById('meetingPassword').value,
            startDateTime: `${document.getElementById('meetingDate').value}T${document.getElementById('startTime').value}:00`,
            endDateTime: `${document.getElementById('meetingDate').value}T${document.getElementById('endTime').value}:00`,
            inviteeEmails: document.getElementById('participantEmails').value.split(',').map(email => email.trim()).filter(Boolean),
        };

        try {
            const response = await fetch('/api/meetings/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(meetingDetails)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to schedule meeting.');

            this.displaySuccess(data.meeting);

        } catch (error) {
            this.displaySchedulerError(error.message);
        } finally {
            this.setLoadingState(scheduleBtn, false, 'Schedule Meeting');
        }
    }

    // --- UI Helper Methods ---

    setLoadingState(button, isLoading, loadingText) {
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');
        const originalText = buttonText.textContent;

        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            buttonText.textContent = loadingText;
            spinner.style.display = 'block';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            buttonText.textContent = originalText;
            spinner.style.display = 'none';
        }
    }

    displayLoginError(message) {
        this.loginErrorMessage.textContent = message;
        this.loginErrorPanel.style.display = 'flex';
    }

    displaySchedulerError(message) {
        this.errorPanel.innerHTML = `<div class="error-icon">⚠</div> <div class="error-text">${message}</div>`;
        this.errorPanel.style.display = 'flex';
        this.successPanel.style.display = 'none';
    }

    displaySuccess(meetingData) {
        this.successPanel.innerHTML = `
            <h3>Meeting Scheduled!</h3>
            <p><strong>Title:</strong> ${meetingData.title}</p>
            <p><strong>Time:</strong> ${new Date(meetingData.start).toLocaleString()}</p>
            <p><strong>Webex Link:</strong> <a href="${meetingData.webLink}" target="_blank">Join Meeting</a></p>
            <button id="newMeetingBtn" class="secondary-button">Schedule Another</button>
        `;
        this.successPanel.style.display = 'block';
        this.errorPanel.style.display = 'none';
        this.meetingForm.style.display = 'none';

        document.getElementById('newMeetingBtn').addEventListener('click', () => {
            this.meetingForm.style.display = 'block';
            this.successPanel.style.display = 'none';
            this.buildSchedulerForm();
        });
    }
}

// Initialize the app once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    new RelianceMeetingScheduler();
});
