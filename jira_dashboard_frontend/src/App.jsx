import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * App - Root component for the Jira Dashboard frontend.
 * Handles authentication, project fetching, dashboard UI, and logout via secure backend proxy endpoints only.
 * All credential interaction is handled through backend endpoints: /api/login, /api/projects, /api/logout.
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

  // Handler: login form submit
  // All authentication is handled via backend POST /api/login. Session is maintained by backend using cookies.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !domain || !apiToken) {
      setError("Please fill in all fields.");
      return;
    }
    setStep("loading");
    try {
      // Send credentials to backend only.
      const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          domain,
          email,
          apiToken,
        }),
      });

      let loginData;
      if (!loginRes.ok) {
        let status = loginRes.status;
        let message = "";
        try {
          const isJson = loginRes.headers
            .get("content-type")
            ?.includes("application/json");
          if (isJson) {
            const errorJson = await loginRes.json();
            message =
              (errorJson && (errorJson.error || errorJson.message)) ||
              loginRes.statusText ||
              status;
          } else {
            const errorText = await loginRes.text();
            message =
              errorText ||
              (status === 401
                ? "Jira authentication failed. Check credentials."
                : loginRes.statusText ||
                  "Login error (" + status + ")");
          }
        } catch (parseErr) {
          message =
            status === 401
              ? "Jira authentication failed. Check credentials."
              : "Login error: " + (loginRes.statusText || status);
        }
        setStep("login");
        setError(message);
        return;
      } else {
        loginData = await loginRes.json();
      }

      if (!loginData.success || !loginData.user) {
        setStep("login");
        setError(
          loginData.error ||
            "Invalid response from backend. Could not retrieve user info."
        );
        return;
      }

      setJiraUser({
        displayName: loginData.user.displayName,
        emailAddress: loginData.user.emailAddress,
        accountId: loginData.user.accountId,
      });

      // Now fetch user's projects using backend proxy (GET /api/projects), using session cookie.
      const projectsRes = await fetch("/api/projects", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      let projectsListObj;
      if (!projectsRes.ok) {
        let status = projectsRes.status;
        let message = "";
        try {
          const isJson = projectsRes.headers
            .get("content-type")
            ?.includes("application/json");
          if (isJson) {
            const errorJson = await projectsRes.json();
            message =
              (errorJson && (errorJson.error || errorJson.message)) ||
              projectsRes.statusText ||
              status;
          } else {
            const text = await projectsRes.text();
            message =
              "Failed to fetch projects: " +
              (text || projectsRes.statusText || status);
          }
        } catch (parseErr) {
          message =
            "Failed to fetch projects: " + (projectsRes.statusText || status);
        }
        setStep("login");
        setError(message);
        return;
      } else {
        projectsListObj = await projectsRes.json();
      }

      // Jira backend API always returns { values: [ ... ] }, but fallback to .projects if format ever changes
      const projects =
        projectsListObj.values || projectsListObj.projects || [];
      setJiraProjects(projects);
      setSelectedProjectKey(
        projects && projects.length > 0 ? projects[0].key : null
      );
      setStep("dashboard");
    } catch (err) {
      setStep("login");
      setError(
        "Network error: " +
          ((err && err.message) || "Could not communicate with backend.")
      );
    }
  };

  // Handler: Logout (uses backend endpoint to clear session, then resets frontend state)
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch {
      // Ignore errors; we clear frontend state regardless
    }
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
