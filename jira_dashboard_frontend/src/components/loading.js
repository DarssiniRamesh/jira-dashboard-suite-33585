// PUBLIC_INTERFACE
export class LoadingComponent {
    /**
     * Loading component for displaying loading states
     */
    constructor() {}

    // PUBLIC_INTERFACE
    render() {
        /**
         * Render the loading component HTML
         * @returns {string} - HTML string for loading component
         */
        return `
            <div class="loading-container">
                <div class="loading-content">
                    <div class="spinner-large"></div>
                    <h2>Loading...</h2>
                    <p>Please wait while we connect to your Jira workspace</p>
                </div>
            </div>
        `;
    }

    // PUBLIC_INTERFACE
    init() {
        /**
         * Initialize component (no additional setup needed for loading component)
         */
        // No additional initialization needed
    }
}
