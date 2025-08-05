// PUBLIC_INTERFACE
export class LoginComponent {
    /**
     * Login form component with validation and error handling
     */
    constructor(options = {}) {
        this.onLogin = options.onLogin || (() => {});
        this.isLoading = false;
        this.errors = {};
        
        // Listen for authentication errors
        document.addEventListener('auth-error', (event) => {
            this.handleAuthError(event.detail.message);
        });
    }

    // PUBLIC_INTERFACE
    render() {
        /**
         * Render the login form HTML
         * @returns {string} - HTML string for the login form
         */
        return `
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="jira-logo">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" fill="#0052CC"/>
                            </svg>
                        </div>
                        <h1>Jira Dashboard</h1>
                        <p>Connect to your Jira workspace</p>
                    </div>
                    
                    <form class="login-form" id="loginForm">
                        <div class="form-group">
                            <label for="domain">Jira Domain</label>
                            <input 
                                type="text" 
                                id="domain" 
                                name="domain" 
                                placeholder="yourcompany.atlassian.net"
                                class="form-input ${this.errors.domain ? 'error' : ''}"
                                required
                            />
                            ${this.errors.domain ? `<div class="error-message">${this.errors.domain}</div>` : ''}
                            <small class="help-text">Enter your Jira domain without https://</small>
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                placeholder="your.email@company.com"
                                class="form-input ${this.errors.email ? 'error' : ''}"
                                required
                            />
                            ${this.errors.email ? `<div class="error-message">${this.errors.email}</div>` : ''}
                        </div>

                        <div class="form-group">
                            <label for="apiToken">API Token</label>
                            <input 
                                type="password" 
                                id="apiToken" 
                                name="apiToken" 
                                placeholder="Your Jira API token"
                                class="form-input ${this.errors.apiToken ? 'error' : ''}"
                                required
                            />
                            ${this.errors.apiToken ? `<div class="error-message">${this.errors.apiToken}</div>` : ''}
                            <small class="help-text">
                                <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank">
                                    Generate an API token
                                </a>
                            </small>
                        </div>

                        ${this.errors.general ? `<div class="error-message general-error">${this.errors.general}</div>` : ''}

                        <button type="submit" class="login-button" ${this.isLoading ? 'disabled' : ''}>
                            ${this.isLoading ? 
                                '<span class="spinner"></span> Connecting...' : 
                                'Connect to Jira'
                            }
                        </button>
                    </form>

                    <div class="login-footer">
                        <p>Secure connection using Jira REST API</p>
                    </div>
                </div>
            </div>
        `;
    }

    // PUBLIC_INTERFACE
    init() {
        /**
         * Initialize event listeners after component is rendered
         */
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Real-time validation
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input.name));
            });
        }
    }

    // PUBLIC_INTERFACE
    async handleSubmit(event) {
        /**
         * Handle form submission
         * @param {Event} event - Form submit event
         */
        event.preventDefault();
        
        if (this.isLoading) return;

        const formData = new FormData(event.target);
        const credentials = {
            domain: formData.get('domain').trim(),
            email: formData.get('email').trim(),
            apiToken: formData.get('apiToken').trim()
        };

        // Validate all fields
        if (!this.validateForm(credentials)) {
            this.updateUI();
            return;
        }

        this.isLoading = true;
        this.errors = {};
        this.updateUI();

        try {
            await this.onLogin(credentials);
        } catch (_error) {
            this.isLoading = false;
            this.errors.general = 'Login failed. Please try again.';
            this.updateUI();
        }
    }

    // PUBLIC_INTERFACE
    validateForm(credentials) {
        /**
         * Validate entire form
         * @param {Object} credentials - Form data to validate
         * @returns {boolean} - Validation result
         */
        this.errors = {};
        let isValid = true;

        // Domain validation
        if (!credentials.domain) {
            this.errors.domain = 'Domain is required';
            isValid = false;
        } else if (!this.isValidDomain(credentials.domain)) {
            this.errors.domain = 'Please enter a valid domain';
            isValid = false;
        }

        // Email validation
        if (!credentials.email) {
            this.errors.email = 'Email is required';
            isValid = false;
        } else if (!this.isValidEmail(credentials.email)) {
            this.errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // API Token validation
        if (!credentials.apiToken) {
            this.errors.apiToken = 'API token is required';
            isValid = false;
        } else if (credentials.apiToken.length < 10) {
            this.errors.apiToken = 'API token seems too short';
            isValid = false;
        }

        return isValid;
    }

    // PUBLIC_INTERFACE
    validateField(input) {
        /**
         * Validate individual form field
         * @param {HTMLInputElement} input - Input element to validate
         */
        const value = input.value.trim();
        const name = input.name;

        switch (name) {
            case 'domain':
                if (!value) {
                    this.errors.domain = 'Domain is required';
                } else if (!this.isValidDomain(value)) {
                    this.errors.domain = 'Please enter a valid domain';
                } else {
                    delete this.errors.domain;
                }
                break;
            case 'email':
                if (!value) {
                    this.errors.email = 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    this.errors.email = 'Please enter a valid email address';
                } else {
                    delete this.errors.email;
                }
                break;
            case 'apiToken':
                if (!value) {
                    this.errors.apiToken = 'API token is required';
                } else if (value.length < 10) {
                    this.errors.apiToken = 'API token seems too short';
                } else {
                    delete this.errors.apiToken;
                }
                break;
        }

        this.updateFieldError(input);
    }

    // PUBLIC_INTERFACE
    clearFieldError(fieldName) {
        /**
         * Clear error for specific field
         * @param {string} fieldName - Name of the field to clear error for
         */
        if (this.errors[fieldName]) {
            delete this.errors[fieldName];
            const input = document.querySelector(`[name="${fieldName}"]`);
            if (input) {
                this.updateFieldError(input);
            }
        }
    }

    // PUBLIC_INTERFACE
    updateFieldError(input) {
        /**
         * Update error display for specific field
         * @param {HTMLInputElement} input - Input element to update
         */
        const fieldName = input.name;
        const errorElement = input.parentElement.querySelector('.error-message');
        
        input.classList.toggle('error', !!this.errors[fieldName]);
        
        if (errorElement) {
            if (this.errors[fieldName]) {
                errorElement.textContent = this.errors[fieldName];
                errorElement.style.display = 'block';
            } else {
                errorElement.style.display = 'none';
            }
        }
    }

    // PUBLIC_INTERFACE
    updateUI() {
        /**
         * Update the entire UI to reflect current state
         */
        const container = document.querySelector('.login-container');
        if (container) {
            container.innerHTML = this.render();
            this.init();
        }
    }

    // PUBLIC_INTERFACE
    handleAuthError(message) {
        /**
         * Handle authentication error from auth service
         * @param {string} message - Error message
         */
        this.isLoading = false;
        this.errors.general = this.formatAuthError(message);
        this.updateUI();
    }

    // PUBLIC_INTERFACE
    formatAuthError(message) {
        /**
         * Format authentication error message for user display
         * @param {string} message - Raw error message
         * @returns {string} - Formatted error message
         */
        if (message.includes('401') || message.includes('Unauthorized')) {
            return 'Invalid credentials. Please check your email and API token.';
        } else if (message.includes('404') || message.includes('Not Found')) {
            return 'Jira domain not found. Please check your domain.';
        } else if (message.includes('CORS') || message.includes('network')) {
            return 'Connection failed. Please check your network and domain.';
        } else {
            return 'Connection failed. Please verify your credentials and try again.';
        }
    }

    // PUBLIC_INTERFACE
    isValidEmail(email) {
        /**
         * Validate email format
         * @param {string} email - Email to validate
         * @returns {boolean} - Validation result
         */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // PUBLIC_INTERFACE
    isValidDomain(domain) {
        /**
         * Validate domain format
         * @param {string} domain - Domain to validate
         * @returns {boolean} - Validation result
         */
        try {
            // Remove protocol if present
            const cleanDomain = domain.replace(/^https?:\/\//, '');
            
            // Basic domain pattern validation
            const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})?$/;
            return domainRegex.test(cleanDomain);
        } catch {
            return false;
        }
    }
}
