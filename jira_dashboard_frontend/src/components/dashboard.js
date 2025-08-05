// PUBLIC_INTERFACE
export class DashboardComponent {
    /**
     * Dashboard component for displaying Jira projects and user information
     */
    constructor(options = {}) {
        this.authService = options.authService;
        this.jiraAPI = options.jiraAPI;
        this.onLogout = options.onLogout || (() => {});
        
        this.projects = [];
        this.filteredProjects = [];
        this.isLoading = true;
        this.error = null;
        this.searchTerm = '';
        this.filterStatus = 'all';
        this.currentUser = null;
    }

    // PUBLIC_INTERFACE
    async loadData() {
        /**
         * Load user data and projects from Jira API
         */
        try {
            this.isLoading = true;
            this.currentUser = this.authService.getCurrentUser();
            
            // Fetch projects
            this.projects = await this.jiraAPI.getProjects();
            this.filteredProjects = [...this.projects];
            
            this.isLoading = false;
            this.updateProjectsView();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.error = 'Failed to load projects. Please try again.';
            this.isLoading = false;
            this.updateProjectsView();
        }
    }

    // PUBLIC_INTERFACE
    render() {
        /**
         * Render the dashboard HTML
         * @returns {string} - HTML string for the dashboard
         */
        return `
            <div class="dashboard">
                ${this.renderNavbar()}
                <div class="dashboard-content">
                    ${this.renderSidebar()}
                    ${this.renderMainContent()}
                </div>
            </div>
        `;
    }

    // PUBLIC_INTERFACE
    renderNavbar() {
        /**
         * Render the top navigation bar
         * @returns {string} - HTML string for navbar
         */
        const user = this.currentUser;
        return `
            <nav class="navbar">
                <div class="navbar-content">
                    <div class="navbar-brand">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" fill="#ffffff"/>
                        </svg>
                        <span>Jira Dashboard</span>
                    </div>
                    
                    <div class="navbar-user">
                        <div class="user-info">
                            <img src="${user?.avatarUrls?.['24x24'] || '/default-avatar.png'}" 
                                 alt="User Avatar" 
                                 class="user-avatar"
                                 onerror="this.src='/default-avatar.png'"
                            />
                            <span class="user-name">${user?.displayName || 'User'}</span>
                        </div>
                        <button class="logout-button" id="logoutBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z" fill="currentColor"/>
                                <path d="M4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }

    // PUBLIC_INTERFACE
    renderSidebar() {
        /**
         * Render the sidebar with filters and search
         * @returns {string} - HTML string for sidebar
         */
        return `
            <aside class="sidebar">
                <div class="sidebar-content">
                    <div class="search-section">
                        <h3>Search Projects</h3>
                        <div class="search-input-wrapper">
                            <input 
                                type="text" 
                                id="searchInput" 
                                class="search-input" 
                                placeholder="Search projects..."
                                value="${this.searchTerm}"
                            />
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="m19.6 21-6.3-6.3q-.75.6-1.725.95Q10.6 16 9.5 16q-2.725 0-4.612-1.887Q3 12.225 3 9.5q0-2.725 1.888-4.613Q6.775 3 9.5 3q2.725 0 4.612 1.887Q16 6.775 16 9.5q0 1.1-.35 2.075-.35.975-.95 1.725l6.3 6.3ZM9.5 14q1.875 0 3.188-1.312Q14 11.375 14 9.5q0-1.875-1.312-3.188Q11.375 5 9.5 5q-1.875 0-3.188 1.312Q5 7.625 5 9.5q0 1.875 1.312 3.188Q7.625 14 9.5 14Z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>

                    <div class="filter-section">
                        <h3>Filter by Status</h3>
                        <div class="filter-options">
                            <label class="filter-option">
                                <input type="radio" name="statusFilter" value="all" ${this.filterStatus === 'all' ? 'checked' : ''}>
                                <span>All Projects</span>
                                <span class="project-count">${this.projects.length}</span>
                            </label>
                            <label class="filter-option">
                                <input type="radio" name="statusFilter" value="active" ${this.filterStatus === 'active' ? 'checked' : ''}>
                                <span>Active</span>
                                <span class="project-count">${this.projects.filter(p => !p.archived).length}</span>
                            </label>
                            <label class="filter-option">
                                <input type="radio" name="statusFilter" value="archived" ${this.filterStatus === 'archived' ? 'checked' : ''}>
                                <span>Archived</span>
                                <span class="project-count">${this.projects.filter(p => p.archived).length}</span>
                            </label>
                        </div>
                    </div>

                    <div class="stats-section">
                        <h3>Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-number">${this.projects.length}</span>
                                <span class="stat-label">Total Projects</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${this.projects.filter(p => !p.archived).length}</span>
                                <span class="stat-label">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        `;
    }

    // PUBLIC_INTERFACE
    renderMainContent() {
        /**
         * Render the main content area with projects
         * @returns {string} - HTML string for main content
         */
        return `
            <main class="main-content">
                <div class="content-header">
                    <h1>My Projects</h1>
                    <p>Manage and view your Jira projects</p>
                </div>

                <div class="projects-container" id="projectsContainer">
                    ${this.renderProjectsContent()}
                </div>
            </main>
        `;
    }

    // PUBLIC_INTERFACE
    renderProjectsContent() {
        /**
         * Render projects list or appropriate state message
         * @returns {string} - HTML string for projects content
         */
        if (this.isLoading) {
            return `
                <div class="loading-state">
                    <div class="spinner-large"></div>
                    <p>Loading projects...</p>
                </div>
            `;
        }

        if (this.error) {
            return `
                <div class="error-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#dc3545"/>
                    </svg>
                    <h3>Error Loading Projects</h3>
                    <p>${this.error}</p>
                    <button class="retry-button" onclick="location.reload()">Try Again</button>
                </div>
            `;
        }

        if (this.filteredProjects.length === 0) {
            return `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#cccccc"/>
                    </svg>
                    <h3>No Projects Found</h3>
                    <p>No projects match your current search and filter criteria.</p>
                </div>
            `;
        }

        return `
            <div class="projects-grid">
                ${this.filteredProjects.map(project => this.renderProjectCard(project)).join('')}
            </div>
        `;
    }

    // PUBLIC_INTERFACE
    renderProjectCard(project) {
        /**
         * Render individual project card
         * @param {Object} project - Project data object
         * @returns {string} - HTML string for project card
         */
        const statusClass = project.archived ? 'archived' : 'active';
        const statusText = project.archived ? 'Archived' : 'Active';
        const lastUpdated = project.updated ? new Date(project.updated).toLocaleDateString() : 'N/A';
        
        return `
            <div class="project-card" data-project-key="${project.key}">
                <div class="project-header">
                    <div class="project-avatar">
                        ${project.avatarUrls?.['24x24'] ? 
                            `<img src="${project.avatarUrls['24x24']}" alt="${project.name}" onerror="this.style.display='none'"/>` :
                            `<div class="project-avatar-placeholder">${project.key.charAt(0)}</div>`
                        }
                    </div>
                    <div class="project-info">
                        <h3 class="project-name">${project.name}</h3>
                        <span class="project-key">${project.key}</span>
                    </div>
                    <span class="project-status ${statusClass}">${statusText}</span>
                </div>

                <div class="project-body">
                    <p class="project-description">
                        ${project.description || 'No description available'}
                    </p>
                    
                    <div class="project-details">
                        <div class="detail-item">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${project.projectTypeKey || 'Unknown'}</span>
                        </div>
                        
                        <div class="detail-item">
                            <span class="detail-label">Lead:</span>
                            <span class="detail-value">
                                ${project.lead ? 
                                    `${project.lead.displayName} (${project.lead.emailAddress})` : 
                                    'No lead assigned'
                                }
                            </span>
                        </div>
                        
                        <div class="detail-item">
                            <span class="detail-label">Last Updated:</span>
                            <span class="detail-value">${lastUpdated}</span>
                        </div>
                    </div>
                </div>

                <div class="project-footer">
                    <a href="${project.self}" target="_blank" class="project-link">
                        View in Jira
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="currentColor"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;
    }

    // PUBLIC_INTERFACE
    init() {
        /**
         * Initialize component after rendering
         */
        // Load data first
        this.loadData();

        // Set up event listeners
        this.setupEventListeners();
    }

    // PUBLIC_INTERFACE
    setupEventListeners() {
        /**
         * Set up all event listeners for the dashboard
         */
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.onLogout());
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.filterProjects();
            });
        }

        // Status filter radio buttons
        const statusFilters = document.querySelectorAll('input[name="statusFilter"]');
        statusFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.filterStatus = e.target.value;
                this.filterProjects();
            });
        });
    }

    // PUBLIC_INTERFACE
    filterProjects() {
        /**
         * Filter projects based on search term and status filter
         */
        let filtered = [...this.projects];

        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(project => 
                project.name.toLowerCase().includes(searchLower) ||
                project.key.toLowerCase().includes(searchLower) ||
                (project.description && project.description.toLowerCase().includes(searchLower))
            );
        }

        // Apply status filter
        if (this.filterStatus === 'active') {
            filtered = filtered.filter(project => !project.archived);
        } else if (this.filterStatus === 'archived') {
            filtered = filtered.filter(project => project.archived);
        }

        this.filteredProjects = filtered;
        this.updateProjectsView();
        this.updateSidebarCounts();
    }

    // PUBLIC_INTERFACE
    updateProjectsView() {
        /**
         * Update the projects display area
         */
        const container = document.getElementById('projectsContainer');
        if (container) {
            container.innerHTML = this.renderProjectsContent();
        }
    }

    // PUBLIC_INTERFACE
    updateSidebarCounts() {
        /**
         * Update project counts in the sidebar filters
         */
        const filterOptions = document.querySelectorAll('.filter-option');
        filterOptions.forEach(option => {
            const input = option.querySelector('input');
            const countSpan = option.querySelector('.project-count');
            
            if (input && countSpan) {
                let count = 0;
                switch (input.value) {
                    case 'all':
                        count = this.projects.length;
                        break;
                    case 'active':
                        count = this.projects.filter(p => !p.archived).length;
                        break;
                    case 'archived':
                        count = this.projects.filter(p => p.archived).length;
                        break;
                }
                countSpan.textContent = count;
            }
        });
    }
}
