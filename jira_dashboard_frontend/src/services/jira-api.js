// PUBLIC_INTERFACE
export class JiraAPI {
    /**
     * Service class for handling Jira REST API communications
     */
    constructor() {
        this.baseURL = null;
        this.authHeader = null;
    }

    // PUBLIC_INTERFACE
    setCredentials(credentials) {
        /**
         * Set up API credentials for Jira authentication
         * @param {Object} credentials - Object containing domain, email, and apiToken
         */
        const { domain, email, apiToken } = credentials;
        
        // Ensure domain has protocol
        this.baseURL = domain.startsWith('http') ? domain : `https://${domain}`;
        
        // Create Basic Auth header
        const authString = `${email}:${apiToken}`;
        this.authHeader = `Basic ${btoa(authString)}`;
    }

    // PUBLIC_INTERFACE
    clearCredentials() {
        /**
         * Clear stored API credentials
         */
        this.baseURL = null;
        this.authHeader = null;
    }

    // PUBLIC_INTERFACE
    async makeRequest(endpoint, options = {}) {
        /**
         * Make authenticated request to Jira API
         * @param {string} endpoint - API endpoint path
         * @param {Object} options - Fetch options
         * @returns {Promise<Object>} - API response data
         */
        if (!this.baseURL || !this.authHeader) {
            throw new Error('API credentials not set');
        }

        const url = `${this.baseURL}/rest/api/3${endpoint}`;
        
        const requestOptions = {
            ...options,
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Jira API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // PUBLIC_INTERFACE
    async getCurrentUser() {
        /**
         * Get current authenticated user information
         * @returns {Promise<Object>} - User information object
         */
        return await this.makeRequest('/myself');
    }

    // PUBLIC_INTERFACE
    async getProjects() {
        /**
         * Get list of projects accessible to the authenticated user
         * @returns {Promise<Array>} - Array of project objects
         */
        const response = await this.makeRequest('/project/search?expand=lead,description');
        return response.values || [];
    }

    // PUBLIC_INTERFACE
    async getProject(projectKey) {
        /**
         * Get detailed information about a specific project
         * @param {string} projectKey - Project key identifier
         * @returns {Promise<Object>} - Project details object
         */
        return await this.makeRequest(`/project/${projectKey}?expand=lead,description`);
    }
}
