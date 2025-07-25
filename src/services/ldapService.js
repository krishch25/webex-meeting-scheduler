/**
 * LDAP Service (ldapService.js)
 * -----------------------------
 * This service encapsulates all logic for interacting with the LDAP server.
 * It handles creating a client, searching for users, and binding (authenticating),
 * throwing specific errors that can be caught by the controllers.
 */

const ldap = require('ldapjs');

// A custom error class for more specific error handling
class LdapError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'LdapError';
        this.statusCode = statusCode;
    }
}

/**
 * Creates and returns a new LDAP client instance.
 * @returns {ldap.Client}
 */
const createLdapClient = () => {
    const client = ldap.createClient({
        url: `ldap://${process.env.LDAP_SERVER}:${process.env.LDAP_PORT}`,
        timeout: 10000,
        connectTimeout: 10000
    });
    // Optional: Add event listeners for detailed debugging if needed
    client.on('error', (err) => console.error('[LDAP_CLIENT_ERROR]', err));
    return client;
};

/**
 * Searches for a user within a single Base DN.
 * @param {ldap.Client} client - The LDAP client.
 * @param {string} baseDn - The Base DN to search within.
 * @param {string} username - The username to find.
 * @returns {Promise<object|null>} The user's data object or null.
 */
const searchInBaseDn = (client, baseDn, username) => new Promise((resolve, reject) => {
    const searchOptions = {
        filter: `(cn=${username})`,
        scope: 'sub',
        attributes: ['dn', 'mail', 'cn', 'displayName']
    };
    let userData = null;
    let entryCount = 0;

    client.search(baseDn, searchOptions, (err, res) => {
        if (err) return reject(new LdapError('LDAP search initialization failed.'));

        res.on('searchEntry', (entry) => {
            entryCount++;
            userData = entry.object;
        });
        res.on('error', (streamErr) => reject(new LdapError(`LDAP stream error: ${streamErr.message}`)));
        res.on('end', (result) => {
            if (result.status !== 0) return reject(new LdapError(`LDAP search failed with status: ${result.status}`));
            if (entryCount > 1) return reject(new LdapError('Ambiguous username found.', 400));
            resolve(userData);
        });
    });
});

/**
 * Authenticates a user by finding their DN and then binding with their password.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} The authenticated user's data.
 * @throws {LdapError} If user is not found, password is invalid, or another error occurs.
 */
exports.authenticate = async (username, password) => {
    const client = createLdapClient();
    try {
        let userData = null;
        // Search across all configured Base DNs
        for (const baseDn of [process.env.LDAP_BASE_DN_1, process.env.LDAP_BASE_DN_2].filter(Boolean)) {
            userData = await searchInBaseDn(client, baseDn, username);
            if (userData) break; // Stop searching once the user is found
        }

        if (!userData) {
            throw new LdapError('User not found.', 404);
        }

        // Attempt to bind with the found user DN and provided password
        await new Promise((resolve, reject) => {
            client.bind(userData.dn, password, (err) => {
                if (err) {
                    // This error typically means an incorrect password
                    return reject(new LdapError('Invalid username or password.', 401));
                }
                resolve();
            });
        });

        return userData; // Return user data only on successful bind

    } finally {
        // Always ensure the LDAP client connection is closed
        client.unbind();
    }
};
