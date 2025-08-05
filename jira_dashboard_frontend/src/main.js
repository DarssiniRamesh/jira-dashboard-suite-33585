import './styles/main.css';
import { AuthService } from './services/auth.js';
import { JiraAPI } from './services/jira-api.js';
import { LoginComponent } from './components/login.js';
import { DashboardComponent } from './components/dashboard.js';
import { LoadingComponent } from './components/loading.js';

// PUBLIC_INTERFACE
class JiraDashboardApp {
    /**
     * Main application class that handles routing and state management
     */
    constructor() {
        this.authService = new AuthService();
        this.jiraAPI = new JiraAPI();
        this.currentView = null;
        this.appElement = document.querySelector('#app');
        
        this.init();
    }

    // PUBLIC_INTERFACE
    async init() {
        /**
         * Initialize the application and check authentication status
         */
        this.showLoading();
        
        // Check if user is already authenticated
        const isAuthenticated = await this.authService.isAuthenticated();
        
        if (isAuthenticated) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    // PUBLIC_INTERFACE
    showLogin() {
        /**
         * Display the login component
         */
        this.currentView = new LoginComponent({
            onLogin: async (credentials) => {
                await this.handleLogin(credentials);
            }
        });
        this.render();
    }

    // PUBLIC_INTERFACE
    showDashboard() {
        /**
         * Display the dashboard component
         */
        this.currentView = new DashboardComponent({
            authService: this.authService,
            jiraAPI: this.jiraAPI,
            onLogout: () => {
                this.handleLogout();
            }
        });
        this.render();
    }

    // PUBLIC_INTERFACE
    showLoading() {
        /**
         * Display loading component
         */
        this.currentView = new LoadingComponent();
        this.render();
    }

    // PUBLIC_INTERFACE
    async handleLogin(credentials) {
        /**
         * Handle user login attempt
         * @param {Object} credentials - User credentials object
         */
        try {
            this.showLoading();
            
            // Authenticate with Jira
            const isValid = await this.authService.authenticate(credentials);
            
            if (isValid) {
                this.showDashboard();
            } else {
                this.showLogin();
                // Error handling is done in the AuthService
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLogin();
        }
    }

    // PUBLIC_INTERFACE
    handleLogout() {
        /**
         * Handle user logout
         */
        this.authService.logout();
        this.showLogin();
    }

    // PUBLIC_INTERFACE
    render() {
        /**
         * Render the current view
         */
        if (this.currentView && this.currentView.render) {
            this.appElement.innerHTML = this.currentView.render();
            
            // Initialize component after rendering
            if (this.currentView.init) {
                this.currentView.init();
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JiraDashboardApp();
});
