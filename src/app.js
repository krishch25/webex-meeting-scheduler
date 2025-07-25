/**
 * Main Application File (app.js)
 *
 * This file is the central entry point for the Express application.
 * It sets up the server, configures middleware, serves static files,
 * and mounts the API routes.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

// --- Application Initialization ---
const app = express();
const httpPort = process.env.PORT || 80;
const httpsPort = process.env.HTTPS_PORT || 443;

// --- Middleware Configuration ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// --- Static File Serving ---
// Serve static files (HTML, CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API Route Mounting ---
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

// --- Root Route ---
// Serve the main index.html file for any route not handled by the API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// --- SSL Certificate Configuration & Server Startup ---
try {
    const privateKey = fs.readFileSync(path.join(__dirname, 'security/private.key'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'security/certificate.cer'), 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(httpsPort, '0.0.0.0', () => {
        console.log(`✅ HTTPS Server is running at https://localhost:${httpsPort}`);
    });

    // --- HTTP to HTTPS Redirect Server ---
    http.createServer((req, res) => {
        const host = req.headers.host || `localhost:${httpPort}`;
        console.log(`Redirecting http://${host}${req.url} to https`);
        res.writeHead(301, { "Location": "https://" + host.replace(`:${httpPort}`, `:${httpsPort}`) + req.url });
        res.end();
    }).listen(httpPort, '0.0.0.0', () => {
        console.log(`👂 HTTP redirect server listening on port ${httpPort}.`);
    });

} catch (error) {
    console.error('❌ FATAL ERROR: Could not read SSL certificate files in src/security/.');
    console.error('Ensure `private.key` and `certificate.cer` exist.');
    console.error(error.message);
    console.log('\n--- ⚠️ Starting in HTTP mode only as a fallback ---');
    app.listen(httpPort, '0.0.0.0', () => {
        console.log(`⚠️ HTTP Server is running on port ${httpPort}. SSL certificates not found.`);
    });
}
