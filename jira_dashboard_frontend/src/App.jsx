import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * App - Root component for the Jira Dashboard frontend.
 * Handles: Jira credential login, live authentication, project fetching, modern dashboard UI, and logout.
 * Refactored to remove all backend proxy references: Jira API calls use only the proxied /api/... endpoints (handled by Vite).
 */
export default function App() {
  // App states
  const [step, setStep] = useState("login"); // "login" | "loading" | "dashboard"
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState("");
  const [jiraUser, setJiraUser] = useState(null); // {displayName, emailAddress, ...}
  const [jiraProjects, setJiraProjects] = useState([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState(null);

  // Returns standardized Jira domain for generating links
  function getCleanJiraDomain(inputDomain) {
    let url = (inputDomain || domain || "").trim().replace(/^https?:\/\//, "");
    if (!url.endsWith(".atlassian.net")) {
      url = url.split("/")[0].replace(/\/$/, "") + ".atlassian.net";
    }
    return url;
  }

  // Helper: Create Authorization header value for Jira API requests
  function getJiraAuthHeader(emailArg, apiTokenArg) {
    const encoded = btoa(`${emailArg}:${apiTokenArg}`);
    return `Basic ${encoded}`;
  }

  // Handler: login form submit
  // Directly calls Jira's /myself and /project/search endpoints (proxied via Vite), handles raw errors
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !domain || !apiToken) {
      setError("Please fill in all fields.");
      return;
    }
    setStep("loading");
    try {
      // Validate/clean domain but only for links, not fetch path (always use '/api/*')
      const cleanDomain = getCleanJiraDomain(domain);

      // Authenticate by calling proxied /api/myself endpoint
      const myselfRes = await fetch(
        `/api/myself`,
        {
          method: "GET",
          headers: {
            Authorization: getJiraAuthHeader(email, apiToken),
            Accept: "application/json",
          },
        }
      );

      let jiraUserData = null;
      if (myselfRes.status === 401) {
        setStep("login");
        setError("Authentication failed. Please check your credentials.");
        return;
      } else if (!myselfRes.ok) {
        // Jira may return raw errors, display best feedback
        let errText, errData;
        try {
          errData = await myselfRes.json();
        } catch {
          errText = await myselfRes.text();
        }
        setStep("login");
        setError(
          "Login error: " +
            (errData && (errData.errorMessages?.join(" | ") || errData.error) ||
            errText ||
            myselfRes.statusText ||
            myselfRes.status)
        );
        return;
      } else {
        jiraUserData = await myselfRes.json();
      }

      if (!jiraUserData || !jiraUserData.displayName) {
        setStep("login");
        setError(
          "Could not get user profile info from Jira (API returned no user data)."
        );
        return;
      }

      // Store minimal user info only in frontend state
      const minimalUser = {
        displayName: jiraUserData.displayName,
        emailAddress: jiraUserData.emailAddress,
        accountId: jiraUserData.accountId,
      };
      setJiraUser(minimalUser);

      // Now get user's projects from proxied /api/project/search
      const projectRes = await fetch(
        `/api/project/search?expand=description,lead,avatarUrls&orderBy=key`,
        {
          method: "GET",
          headers: {
            Authorization: getJiraAuthHeader(email, apiToken),
            Accept: "application/json",
          },
        }
      );

      let projectsListObj, errRespText, errRespJson;
      if (projectRes.status === 401) {
        setStep("login");
        setError(
          "Not authenticated with Jira (invalid API token or expired, or insufficient permissions)."
        );
        return;
      }
      if (!projectRes.ok) {
        try {
          errRespJson = await projectRes.json();
        } catch {
          errRespText = await projectRes.text();
        }
        setStep("login");
        setError(
          "Failed to fetch projects: " +
            (errRespJson && (errRespJson.errorMessages?.join(" | ") || errRespJson.error) ||
            errRespText ||
            projectRes.statusText ||
            projectRes.status)
        );
        return;
      }
      projectsListObj = await projectRes.json();
      const projects = projectsListObj.values || projectsListObj.projects || [];
      setJiraProjects(projects);
      setSelectedProjectKey(projects && projects.length > 0 ? projects[0].key : null);
      setStep("dashboard");
    } catch (err) {
      setStep("login");
      setError(
        "Network error: " +
          ((err && err.message) || "Could not connect to Jira API.")
      );
    }
  };

  // Handler: Logout (frontend only, fully resets all state)
  const handleLogout = () => {
    setEmail("");
    setDomain("");
    setApiToken("");
    setJiraUser(null);
    setJiraProjects([]);
    setSelectedProjectKey(null);
    setError("");
    setStep("login");
  };

  // Handler: Select a project in the sidebar
  const handleSelectProject = (key) => setSelectedProjectKey(key);

  // Login form view
  function LoginForm() {
    return (
      <div className="login-form-container">
        <form className="login-form" autoComplete="off" onSubmit={handleLogin}>
          <h2>Jira Login</h2>
          {error && (
            <div className="error-banner">
              {error}
              <button
                className="close-error-btn"
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          )}

          <label>
            Jira Workspace Domain
            <input
              type="text"
              placeholder="your-domain.atlassian.net or your-domain"
              value={domain}
              autoComplete="organization"
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </label>
          <label>
            Jira Email Address
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            API Token
            <div className="input-pw-row">
              <input
                type={showToken ? "text" : "password"}
                placeholder="Jira API token"
                value={apiToken}
                autoComplete="current-password"
                onChange={(e) => setApiToken(e.target.value)}
                required
                className={showToken ? "show-pw" : ""}
              />
              <button
                className="show-hide-btn"
                tabIndex={-1}
                type="button"
                aria-label={showToken ? "Hide token" : "Show token"}
                onClick={() => setShowToken((s) => !s)}
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <div className="pw-help">
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              rel="noopener noreferrer"
              target="_blank"
            >
              Get API token
            </a>
          </div>
          <button
            className="primary-btn"
            type="submit"
            disabled={!email || !domain || !apiToken}
          >
            Login to Jira
          </button>
        </form>
      </div>
    );
  }

  // Top navigation bar view
  function TopNav() {
    return (
      <nav className="topnav">
        <div className="logo-title">
          <span className="logo" role="img" aria-label="Jira Logo">
            🧩
          </span>
          Jira Dashboard
        </div>
        <div className="topnav-right">
          <span className="user-email">{jiraUser?.emailAddress || ""}</span>
          <button className="logout-btn" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>
    );
  }

  // Sidebar project list view
  function ProjectSidebar() {
    return (
      <aside className="sidebar">
        <div className="sidebar-header">Your Projects</div>
        <ul className="sidebar-list">
          {jiraProjects.length === 0 && (
            <li className="sidebar-item" style={{ color: "#888" }}>
              No projects found.
            </li>
          )}
          {jiraProjects.map((proj) => (
            <li
              key={proj.key}
              className={
                "sidebar-item" +
                (proj.key === selectedProjectKey ? " selected" : "")
              }
              onClick={() => handleSelectProject(proj.key)}
            >
              <span
                className="dot"
                style={{
                  background:
                    `url(${proj.avatarUrls?.["16x16"] || proj.avatarUrls?.["48x48"]}) no-repeat center/cover, var(--primary)`,
                }}
              />
              <span className="sidebar-project-name">{proj.name}</span>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  // Project detail card (main content)
  function ProjectDetailCard({ project }) {
    if (!project) {
      return (
        <div className="empty-state-card">
          Select a project from the sidebar.
        </div>
      );
    }
    const cleanDomain = getCleanJiraDomain();
    return (
      <div className="project-detail-card">
        <div className="project-card-header">
          <span
            className="project-avatar"
            style={{
              backgroundImage: `url(${project.avatarUrls?.["48x48"]})`,
            }}
            title={project.name}
          />
          <span className="project-title">{project.name}</span>
          <span className="project-key">{project.key}</span>
        </div>
        <div className="project-info">
          <b>Type:</b> {project.projectTypeKey} <br />
          <b>Lead:</b>{" "}
          {project.lead?.displayName || "Unknown"} ({project.lead?.emailAddress || "?"})
        </div>
        <div className="project-info">
          <b>Description:</b>{" "}
          {project.description ? (
            typeof project.description === "string"
              ? project.description
              : (project.description.plain?.text || "")
          ) : (
            <span style={{ color: "#aaa" }}>No description</span>
          )}
        </div>
        <div className="project-links">
          <a
            href={`https://${cleanDomain}/jira/software/c/projects/${project.key}/boards`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Jira
          </a>
        </div>
      </div>
    );
  }

  // Dashboard view after authentication
  function DashboardView() {
    const project =
      jiraProjects.find((p) => p.key === selectedProjectKey) || null;
    return (
      <div className="dashboard-bg">
        <TopNav />
        <div className="dashboard-main">
          <ProjectSidebar />
          <main className="main-content">
            {error && (
              <div className="error-banner">
                {error}
                <button
                  className="close-error-btn"
                  type="button"
                  aria-label="Dismiss error"
                  onClick={() => setError("")}
                >
                  ×
                </button>
              </div>
            )}
            {jiraProjects.length === 0 ? (
              <div className="empty-state-card">
                No accessible projects on this Jira instance.
              </div>
            ) : (
              <ProjectDetailCard project={project} />
            )}
          </main>
        </div>
      </div>
    );
  }

  // Loading screen view
  function LoadingOverlay() {
    return (
      <div className="app-bg loading-overlay">
        Authenticating &amp; fetching projects from Jira...
      </div>
    );
  }

  // Main render logic
  if (step === "login") return <LoginForm />;
  if (step === "loading") return <LoadingOverlay />;
  if (step === "dashboard") return <DashboardView />;
  // Fallback state
  return (
    <div className="app-bg">
      <h2>Unexpected app state.</h2>
    </div>
  );
}
