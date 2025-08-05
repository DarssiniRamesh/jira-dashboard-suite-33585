// PUBLIC_INTERFACE
export class Config {
    /**
     * Configuration utility class for managing environment variables and app settings
     */
    static getEnvVar(key, defaultValue = null) {
        /**
         * Get environment variable value with fallback
         * @param {string} key - Environment variable key
         * @param {any} defaultValue - Default value if not found
         * @returns {any} - Environment variable value or default
         */
        const value = import.meta.env[key];
        return value !== undefined ? value : defaultValue;
    }

    // PUBLIC_INTERFACE
    static get appName() {
        /**
         * Get application name
         * @returns {string} - Application name
         */
        return this.getEnvVar('VITE_APP_NAME', 'Jira Dashboard');
    }

    // PUBLIC_INTERFACE
    static get appVersion() {
        /**
         * Get application version
         * @returns {string} - Application version
         */
        return this.getEnvVar('VITE_APP_VERSION', '1.0.0');
    }

    // PUBLIC_INTERFACE
    static get siteUrl() {
        /**
         * Get site URL for authentication redirects
         * @returns {string} - Site URL
         */
        return this.getEnvVar('VITE_SITE_URL', window.location.origin);
    }

    // PUBLIC_INTERFACE
    static get debugMode() {
        /**
         * Check if debug mode is enabled
         * @returns {boolean} - Debug mode status
         */
        return this.getEnvVar('VITE_DEBUG_MODE', 'false') === 'true';
    }

    // PUBLIC_INTERFACE
    static get apiTimeout() {
        /**
         * Get API request timeout in milliseconds
         * @returns {number} - Timeout in milliseconds
         */
        return parseInt(this.getEnvVar('VITE_API_TIMEOUT', '30000'), 10);
    }

    // PUBLIC_INTERFACE
    static log(message, ...args) {
        /**
         * Log message if debug mode is enabled
         * @param {string} message - Log message
         * @param {...any} args - Additional arguments
         */
        if (this.debugMode) {
            console.log(`[${this.appName}]`, message, ...args);
        }
    }

    // PUBLIC_INTERFACE
    static error(message, ...args) {
        /**
         * Log error message
         * @param {string} message - Error message
         * @param {...any} args - Additional arguments
         */
        console.error(`[${this.appName}]`, message, ...args);
    }
}
