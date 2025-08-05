# Jira Dashboard

A modern, secure web application for managing and viewing your Jira projects. Built with Vite and vanilla JavaScript, this dashboard provides an intuitive interface to connect to your Jira workspace and visualize your projects.

## Features

- 🔐 **Secure Authentication**: Connect using your Jira domain, email, and API token
- 📊 **Project Dashboard**: View all accessible Jira projects with detailed information
- 🔍 **Search & Filter**: Find projects quickly with search and status filtering
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean, Jira-inspired design with smooth animations
- ⚡ **Fast Performance**: Built with Vite for optimal development and production performance

## Project Information

- **Project Name**: Project Key, Type, Lead (name & email), Status (active/archived)
- **Visual Elements**: Avatar/Icon, Last Updated Time
- **Quick Actions**: Direct links to view projects in Jira

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- A Jira Cloud account with API access
- Jira API token (see [Creating API tokens](https://id.atlassian.com/manage-profile/security/api-tokens))

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional):
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to customize configuration if needed.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

### Production Build

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Usage

### First-Time Setup

1. **Open the application** in your web browser
2. **Enter your Jira credentials**:
   - **Domain**: Your Jira domain (e.g., `yourcompany.atlassian.net`)
   - **Email**: Your Jira account email address
   - **API Token**: Generate one at [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens)

### Using the Dashboard

- **View Projects**: All accessible projects are displayed as cards
- **Search**: Use the search bar to find specific projects
- **Filter**: Filter projects by status (All, Active, Archived)
- **Project Details**: Each card shows:
  - Project name and key
  - Project type and description
  - Lead information
  - Status and last updated date
  - Direct link to view in Jira

### Security

- **No Data Storage**: Credentials are stored only in your browser's session storage
- **Direct API Calls**: All communication goes directly to your Jira instance
- **Session-Based**: Authentication persists only during your browser session
- **HTTPS Required**: Production deployments should use HTTPS

## API Endpoints Used

The application uses the following Jira REST API endpoints:

- `GET /rest/api/3/myself` - Validate credentials and get user information
- `GET /rest/api/3/project/search` - Fetch accessible projects with details

## Technical Details

### Architecture

- **Frontend Framework**: Vite + Vanilla JavaScript
- **Styling**: Modern CSS with CSS variables and responsive design
- **Authentication**: Jira REST API with Basic Auth (email + API token)
- **State Management**: Component-based state management
- **Routing**: Client-side routing between login and dashboard views

### Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Features

- Lazy loading of components
- Efficient DOM updates
- Optimized CSS with modern features
- Responsive images and assets
- Fast development server with HMR

## Troubleshooting

### Common Issues

**"Invalid credentials" error**:
- Verify your Jira domain is correct (without https://)
- Ensure your API token is active and correct
- Check that your email matches your Jira account

**"Connection failed" error**:
- Check your internet connection
- Verify the Jira domain is accessible
- Ensure CORS is properly configured (if hosting on different domain)

**Projects not loading**:
- Verify you have access to projects in your Jira instance
- Check browser console for API errors
- Ensure your API token has sufficient permissions

### Development

To run in development mode with debugging:

1. Set `VITE_DEBUG_MODE=true` in your `.env` file
2. Open browser developer tools to see detailed logs
3. Check the Network tab for API request details

## Contributing

This is a self-contained application. To modify or extend:

1. **Components**: Located in `src/components/`
2. **Services**: API and authentication logic in `src/services/`
3. **Styles**: All CSS in `src/styles/main.css`
4. **Configuration**: Environment variables and utilities in `src/utils/`

## License

This project is intended for educational and personal use. Please ensure compliance with Atlassian's API terms of service when using with Jira Cloud.

## Support

For issues related to:
- **Jira API**: Refer to [Atlassian Developer Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- **API Tokens**: Visit [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens)
- **Application**: Check browser console for error details
