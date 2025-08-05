import { JiraAPI } from './jira-api.js';

// PUBLIC_INTERFACE
export class AuthService {
    /**
     * Authentication service for managing user sessions and Jira authentication
     */
    constructor() {
        this.jiraAPI = new JiraAPI();
        this.currentUser = null;
        this.credentials = null;
    }

    // PUBLIC_INTERFACE
    async authenticate(credentials) {
        /**
         * Authenticate user with Jira API
         * @param {Object} credentials - Object containing domain, email, and apiToken
         * @returns {boolean} - Authentication success status
         */
        try {
            // Validate credentials format
            if (!this.validateCredentials(credentials)) {
                throw new Error('Invalid credentials format');
            }

            // Set up Jira API with credentials
            this.jiraAPI.setCredentials(credentials);

            // Test authentication by calling /myself endpoint
            const userInfo = await this.jiraAPI.getCurrentUser();
            
            if (userInfo) {
                // Store credentials and user info
                this.credentials = credentials;
                this.currentUser = userInfo;
                
                // Store in sessionStorage for persistence during session
                sessionStorage.setItem('jira-credentials', JSON.stringify(credentials));
                sessionStorage.setItem('jira-user', JSON.stringify(userInfo));
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Authentication failed:', error);
            this.showAuthError(error.message);
            return false;
        }
    }

    // PUBLIC_INTERFACE
    async isAuthenticated() {
        /**
         * Check if user is currently authenticated
         * @returns {boolean} - Authentication status
         */
        // Check if we have current session
        if (this.currentUser && this.credentials) {
            return true;
        }

        // Check sessionStorage
        const storedCredentials = sessionStorage.getItem('jira-credentials');
        const storedUser = sessionStorage.getItem('jira-user');

        if (storedCredentials && storedUser) {
            try {
                this.credentials = JSON.parse(storedCredentials);
                this.currentUser = JSON.parse(storedUser);
                this.jiraAPI.setCredentials(this.credentials);
                
                // Verify credentials are still valid
                const userInfo = await this.jiraAPI.getCurrentUser();
                if (userInfo) {
                    return true;
                }
            } catch (error) {
                console.error('Stored credentials invalid:', error);
                this.logout();
            }
        }

        return false;
    }

    // PUBLIC_INTERFACE
    logout() {
        /**
         * Log out the current user and clear stored data
         */
        this.currentUser = null;
        this.credentials = null;
        sessionStorage.removeItem('jira-credentials');
        sessionStorage.removeItem('jira-user');
        this.jiraAPI.clearCredentials();
    }

    // PUBLIC_INTERFACE
    getCurrentUser() {
        /**
         * Get current authenticated user info
         * @returns {Object|null} - Current user information
         */
        return this.currentUser;
    }

    // PUBLIC_INTERFACE
    validateCredentials(credentials) {
        /**
         * Validate credentials object format
         * @param {Object} credentials - Credentials to validate
         * @returns {boolean} - Validation result
         */
        if (!credentials || typeof credentials !== 'object') {
            return false;
        }

        const { domain, email, apiToken } = credentials;
        
        if (!domain || !email || !apiToken) {
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // Basic domain validation (should be a valid URL)
        try {
            new URL(domain.startsWith('http') ? domain : `https://${domain}`);
        } catch {
            return false;
        }

        return true;
    }

    // PUBLIC_INTERFACE
    showAuthError(message) {
        /**
         * Display authentication error to user
         * @param {string} message - Error message to display
         */
        const errorEvent = new CustomEvent('auth-error', {
            detail: { message }
        });
        document.dispatchEvent(errorEvent);
    }
}
