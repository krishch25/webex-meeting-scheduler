Reliance Webex Meeting Scheduler
An enterprise-grade web application for seamless Webex meeting scheduling, integrated with corporate LDAP authentication. This tool provides a secure, unified interface for employees to schedule meetings without needing direct Webex credentials.

Table of Contents
Overview

Key Features

System Architecture

Quality Assurance

Screenshots

Full Documentation

Tech Stack

Getting Started

Contributing

License

Overview
The Reliance Meeting Scheduler is a production-ready, single-page application built to solve the challenge of efficient meeting scheduling within a corporate environment. It integrates directly with the company's LDAP directory for secure authentication and the Cisco Webex API for automated scheduling. The project was developed to enhance productivity by providing a simple, centralized, and secure platform for all employees.

Key Features
Secure LDAP Authentication: Integrates with the corporate directory (o=relianceada, o=reliancegroup) for secure, single-sign-on access.

JWT Session Management: Employs stateless JSON Web Tokens with a 1-hour expiry for secure and scalable session handling.

Real-time Availability Checking: Instantly queries the host's calendar via the Webex API to prevent scheduling conflicts.

Alternative Slot Suggestions: If a desired time is unavailable, the system intelligently suggests the next best available slots.

Automated Scheduling: Creates Webex meetings, generates links, and sends invitations to all participants automatically.

Comprehensive Validation: Features robust, real-time client-side validation for all form fields, ensuring data integrity.

Fully Responsive UI: The interface is optimized for a seamless experience on desktops, tablets, and mobile devices.

HTTPS Enforced: All communication with the server is secured via HTTPS.

System Architecture
The application follows a robust four-tier architecture to ensure separation of concerns and scalability.

Presentation Layer: A lightweight, vanilla JavaScript single-page application.

Application Layer: A Node.js/Express.js server that handles all API requests.

Authentication Layer: A dedicated service that interfaces with the LDAP server for user verification.

External Service Layer: Manages all communication with the Cisco Webex API.

(As depicted in the Technical Documentation, the flow is User Interface -> Express Server -> LDAP Server / Webex API)

Quality Assurance
This project has undergone a rigorous Final Acceptance Testing cycle to ensure it meets the highest standards of quality and reliability.

Total Test Cases Executed: 35

Pass Rate: 100%

Critical Bugs Found: 0

The application is certified as stable, fully functional, and ready for production deployment. For more details, see the complete Test Report and the Certificate of Test Completion.

Screenshots
Here is a preview of the application's user interface.

(Action for you: Add screenshots here from your RELIANCE MEETING SCHEDULER_SOP.pdf for a great visual guide! You can add images in Markdown like this: ![Login Page](./docs/screenshots/login.png))

The secure login portal.

The intuitive meeting scheduling interface.

Full Documentation
For a deeper dive into the project, please refer to the complete documentation.

Technical Documentation: A comprehensive overview of the system architecture, API specifications, and implementation details.

Standard Operating Procedure (SOP): A step-by-step user guide with screenshots on how to use the application.

Test Execution Report: The complete results from the Final Acceptance Testing cycle.

Tech Stack
Frontend: HTML5, CSS3, Vanilla JavaScript (ES2021)

Backend: Node.js, Express.js

Authentication: LDAP (ldapjs), JSON Web Tokens (jsonwebtoken)

API Integration: Axios, Cisco Webex API

Security: HTTPS/SSL

Getting Started
Please refer to the Technical Documentation for detailed deployment and configuration instructions.

Contributing
Contributions are welcome! Please read the CONTRIBUTING.md file for details on our code of conduct and the process for submitting pull requests.

License
This project is licensed under the MIT License. See the LICENSE file for details.