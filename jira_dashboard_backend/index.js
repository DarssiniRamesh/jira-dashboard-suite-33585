import express from "express";
import cors from "cors";
import session from "express-session";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Load allowed origins for CORS from environment variable
const ALLOWED_ORIGINS = (process.env.ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(express.json());

// Configure CORS for frontend integration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin like curl or mobile apps
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error("CORS policy: This origin is not allowed by the server."),
        false
      );
    },
    credentials: true, // Allow cookies (for session)
  })
);

// Session middleware (in-memory for demo, use Redis or DB for production)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "jira_dashboard_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set true if behind HTTPS proxy in production!
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

// PUBLIC_INTERFACE
/**
 * @route POST /api/login
 * @summary Jira authentication endpoint
 * @description
 *   Receives {domain, email, apiToken} in body.
 *   Calls Jira /myself to verify credentials.
 *   On success, stores credentials in session (not returned).
 * @param {object} req.body - { domain, email, apiToken }
 * @returns {200} - {success: true, user: { ...JiraUserFields }}
 * @returns {400|401|500} - {success: false, error: "..."}
 */
app.post("/api/login", async (req, res) => {
  const { domain, email, apiToken } = req.body;
  if (!domain || !email || !apiToken) {
    return res.status(400).json({
      success: false,
      error: "Missing domain, email, or API token.",
    });
  }

  // Normalize Jira domain
  let cleanDomain = domain.trim().replace(/^https?:\/\//, "");
  if (!cleanDomain.endsWith(".atlassian.net")) {
    cleanDomain = cleanDomain.split("/")[0].replace(/\/$/, "") + ".atlassian.net";
  }
  const baseURL = `https://${cleanDomain}/rest/api/3`;

  try {
    // Call Jira /myself to verify credentials
    const myselfRes = await axios.get(`${baseURL}/myself`, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${email}:${apiToken}`).toString("base64"),
        Accept: "application/json",
      },
    });

    // On success, store credentials in session (never returned to client!)
    req.session.jiraAuth = {
      domain: cleanDomain,
      email,
      apiToken,
    };

    // Send limited user info back
    return res.json({
      success: true,
      user: {
        displayName: myselfRes.data.displayName,
        emailAddress: myselfRes.data.emailAddress,
        accountId: myselfRes.data.accountId,
      },
    });
  } catch (err) {
    // Handle Jira authentication error
    const status = err.response?.status || 500;
    return res.status(status).json({
      success: false,
      error:
        status === 401
          ? "Jira authentication failed. Check credentials."
          : "Jira API error: " + (err.response?.statusText || err.message),
    });
  }
});

// PUBLIC_INTERFACE
/**
 * @route GET /api/projects
 * @summary Fetch Jira projects for authenticated user (proxy)
 * @description
 *   Uses session credentials to fetch projects from Jira /project/search.
 *   Returns full Jira API response (but never credentials).
 * @returns {200} - JSON list of projects (Jira API format)
 * @returns {401|500} - {success: false, error: "..."}
 */
app.get("/api/projects", async (req, res) => {
  if (!req.session.jiraAuth) {
    return res
      .status(401)
      .json({ success: false, error: "Not authenticated with Jira." });
  }

  const { domain, email, apiToken } = req.session.jiraAuth;
  const baseURL = `https://${domain}/rest/api/3`;

  try {
    const jiraRes = await axios.get(
      `${baseURL}/project/search?expand=description,lead,avatarUrls&orderBy=key`,
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${email}:${apiToken}`).toString("base64"),
          Accept: "application/json",
        },
      }
    );
    return res.json(jiraRes.data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      success: false,
      error: "Jira API error: " + (err.response?.statusText || err.message),
    });
  }
});

// PUBLIC_INTERFACE
/**
 * @route POST /api/logout
 * @summary Clear Jira credentials from session
 * @description Logs user out by destroying session
 */
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get("/", (req, res) => {
  res.send("Jira Dashboard Backend is running.");
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Jira Dashboard Backend running on port ${PORT}`);
});
