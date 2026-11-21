# JIRA_BACKLOG.md
# Project Backlog & Epics Specification (Phases 1 - 9)
# Security Log Anomaly Detection System (NIIT University Capstone II)

This backlog contains the complete work breakdown structure organized into 9 Epics corresponding to project phases. It is formatted for direct Jira import (CSV or manual entry) with detailed User Stories, Acceptance Criteria, Subtasks, Story Points (Fibonacci), and Priorities.

---

## Jira Import Reference Table

| Issue Type | Issue Key | Epic Link / Parent | Summary | Priority | Story Points |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Epic** | `SLAD-EPIC-1` | - | Phase 1: Project Architecture, Skeleton & Context Lock | High | - |
| Story | `SLAD-101` | `SLAD-EPIC-1` | Repository Skeleton and Service Directory Scaffolding | High | 3 |
| Story | `SLAD-102` | `SLAD-EPIC-1` | Project Context Lock and Excluded Features Guardrails | Highest | 2 |
| Story | `SLAD-103` | `SLAD-EPIC-1` | Git Collaboration Workflow and PR Policy Definition | Medium | 2 |
| **Epic** | `SLAD-EPIC-2` | - | Phase 2: Database Modeling & Express Backend Core Setup | High | - |
| Story | `SLAD-201` | `SLAD-EPIC-2` | Express Server Setup with Security Headers & CORS | High | 3 |
| Story | `SLAD-202` | `SLAD-EPIC-2` | MongoDB Atlas Connection & Mongoose Configuration | High | 3 |
| Story | `SLAD-203` | `SLAD-EPIC-2` | User Entity Data Model and Validation Schema | High | 3 |
| Story | `SLAD-204` | `SLAD-EPIC-2` | Security Log Entity Data Model and Indexes | High | 5 |
| Story | `SLAD-205` | `SLAD-EPIC-2` | Security Alert Entity Data Model and Relationships | High | 3 |
| Story | `SLAD-206` | `SLAD-EPIC-2` | Centralized Error Handling and Logging Infrastructure | Medium | 3 |
| **Epic** | `SLAD-EPIC-3` | - | Phase 3: Authentication & Authorization System | Highest | - |
| Story | `SLAD-301` | `SLAD-EPIC-3` | User Registration with bcryptjs Password Hashing | Highest | 5 |
| Story | `SLAD-302` | `SLAD-EPIC-3` | Local User Login with JWT Token Minting | Highest | 5 |
| Story | `SLAD-303` | `SLAD-EPIC-3` | Google Sign-In Verification via google-auth-library | Highest | 8 |
| Story | `SLAD-304` | `SLAD-EPIC-3` | JWT Verification & Role-Based Access Control Middleware | High | 5 |
| **Epic** | `SLAD-EPIC-4` | - | Phase 4: Frontend Foundations & Authentication UI | High | - |
| Story | `SLAD-401` | `SLAD-EPIC-4` | React Vite Scaffold, Routing & Global Theme Setup | High | 3 |
| Story | `SLAD-402` | `SLAD-EPIC-4` | Authentication Context, Token Storage & Axios Interceptors | High | 5 |
| Story | `SLAD-403` | `SLAD-EPIC-4` | User Login & Registration UI with Form Validation | High | 5 |
| Story | `SLAD-404` | `SLAD-EPIC-4` | Google Identity Services Sign-In Button Integration | High | 5 |
| Story | `SLAD-405` | `SLAD-EPIC-4` | Protected Route Guards & Role-Based Navigation UI | Medium | 3 |
| **Epic** | `SLAD-EPIC-5` | - | Phase 5: Security Log Ingestion & Preprocessing Pipeline | Highest | - |
| Story | `SLAD-501` | `SLAD-EPIC-5` | Multipart CSV/JSON Security Log File Upload Route | High | 5 |
| Story | `SLAD-502` | `SLAD-EPIC-5` | Direct JSON REST Log Ingestion API Endpoint | High | 3 |
| Story | `SLAD-503` | `SLAD-EPIC-5` | Log Parsing, Schema Validation & Sanitization Engine | High | 5 |
| Story | `SLAD-504` | `SLAD-EPIC-5` | Timestamp Normalization and IP Address Sanitization | Medium | 3 |
| Story | `SLAD-505` | `SLAD-EPIC-5` | Log Aggregation & Query Service with Pagination | High | 5 |
| **Epic** | `SLAD-EPIC-6` | - | Phase 6: Python FastAPI ML Microservice & Isolation Forest | Highest | - |
| Story | `SLAD-601` | `SLAD-EPIC-6` | FastAPI Microservice Initialization & Health Check | High | 3 |
| Story | `SLAD-602` | `SLAD-EPIC-6` | Feature Extraction Pipeline with Pandas | Highest | 8 |
| Story | `SLAD-603` | `SLAD-EPIC-6` | Isolation Forest Model Training and Persistence Module | Highest | 8 |
| Story | `SLAD-604` | `SLAD-EPIC-6` | Real-Time Anomaly Prediction and Scoring REST API | Highest | 5 |
| Story | `SLAD-605` | `SLAD-EPIC-6` | Batch Anomaly Evaluation Endpoint for Historical Logs | High | 5 |
| **Epic** | `SLAD-EPIC-7` | - | Phase 7: Backend-to-ML Integration & Alert Generation | Highest | - |
| Story | `SLAD-701` | `SLAD-EPIC-7` | Express HTTP Client for ML Microservice Invocations | High | 5 |
| Story | `SLAD-702` | `SLAD-EPIC-7` | Alert Generation Engine with Anomaly Score Thresholding | Highest | 5 |
| Story | `SLAD-703` | `SLAD-EPIC-7` | Alert Severity Mapping (Critical, High, Medium, Low) | High | 3 |
| Story | `SLAD-704` | `SLAD-EPIC-7` | Alert Management APIs (Acknowledge, Resolve, Filter) | High | 5 |
| **Epic** | `SLAD-EPIC-8` | - | Phase 8: Security Analyst Dashboard & Visualization | High | - |
| Story | `SLAD-801` | `SLAD-EPIC-8` | Dashboard Metric Summary Cards (Logs, Anomaly Count, Alerts) | High | 5 |
| Story | `SLAD-802` | `SLAD-EPIC-8` | Real-Time Alert List with Severity Badges and Filters | High | 5 |
| Story | `SLAD-803` | `SLAD-EPIC-8` | Anomaly Timeline & Trend Charts Component | High | 5 |
| Story | `SLAD-804` | `SLAD-EPIC-8` | Security Log Viewer with Search, Filter & Inspection Modal | High | 5 |
| Story | `SLAD-805` | `SLAD-EPIC-8` | Security Log File Upload & Analysis Trigger UI | High | 5 |
| **Epic** | `SLAD-EPIC-9` | - | Phase 9: Testing, API Docs, Containerization & CI/CD | High | - |
| Story | `SLAD-901` | `SLAD-EPIC-9` | Swagger (OpenAPI) Documentation for Backend and ML APIs | High | 3 |
| Story | `SLAD-902` | `SLAD-EPIC-9` | Postman Automated Test Collection & Environment Setup | Medium | 3 |
| Story | `SLAD-903` | `SLAD-EPIC-9` | Backend Unit & Integration Tests (Supertest, Jest) | High | 5 |
| Story | `SLAD-904` | `SLAD-EPIC-9` | ML Service Unit Tests (pytest, FastAPI TestClient) | High | 5 |
| Story | `SLAD-905` | `SLAD-EPIC-9` | Docker Containerization for Backend, Frontend, and ML | High | 5 |
| Story | `SLAD-906` | `SLAD-EPIC-9` | Nginx Reverse Proxy Configuration & SSL Routing | High | 5 |
| Story | `SLAD-907` | `SLAD-EPIC-9` | Kubernetes Manifests for Cluster Deployment | Medium | 5 |
| Story | `SLAD-908` | `SLAD-EPIC-9` | Jenkins CI/CD Pipeline Automation Script | Medium | 5 |

---

## Detailed User Stories & Acceptance Criteria

### Phase 1: Project Architecture, Skeleton & Context Lock (`SLAD-EPIC-1`)

#### `SLAD-101`: Repository Skeleton and Service Directory Scaffolding
* **Description**: As a lead developer, I want to establish a modular monorepo structure containing `/backend`, `/frontend`, `/ml-service`, `/tests`, `/docs`, `/nginx`, `/k8s`, and `/jenkins`, so that all subsystems have clean separation of concerns.
* **Acceptance Criteria**:
  * Root directories exist: `backend`, `frontend`, `ml-service`, `tests`, `docs`, `nginx`, `k8s`, `jenkins`.
  * Comprehensive `.gitignore` covering Node, Python virtualenvs, build artifacts (`dist`), logs, and `.env`.
  * Root and per-service `.env.example` templates created with all environment keys documented.
* **Tasks**:
  1. Initialize folder structure and `.gitkeep` placeholders.
  2. Write root `.gitignore` with Node/Python/OS exclusions.
  3. Create `.env.example` at root, `/backend`, `/frontend`, and `/ml-service`.
* **Points**: 3 | **Priority**: High

#### `SLAD-102`: Project Context Lock and Excluded Features Guardrails
* **Description**: As an architect, I want to create `PROJECT_CONTEXT.md` and workspace rules, so that developers and AI assistants adhere strictly to the project scope and never introduce disallowed features.
* **Acceptance Criteria**:
  * `PROJECT_CONTEXT.md` explicitly lists project name, 1-paragraph summary, objectives, fixed stack, system flow, and the EXCLUDED list (no DAG, no Jaccard, no Ollama/LLM, no evidence locking, no case builder, no law enforcement tools, no payments).
  * `.antigravity/rules` and `AGENTS.md` force agents to read context and reject other-project memories.
* **Tasks**:
  1. Author `PROJECT_CONTEXT.md`.
  2. Author `.antigravity/rules` and `AGENTS.md`.
* **Points**: 2 | **Priority**: Highest

#### `SLAD-103`: Git Collaboration Workflow and PR Policy Definition
* **Description**: As a repository maintainer, I want to document the Git branching strategy, commit conventions, and PR review rules in `GIT_WORKFLOW.md`, so that team contributions remain consistent and auditable.
* **Acceptance Criteria**:
  * Documents `main`, `develop`, and `feature/<jira-key>-<name>` branches.
  * Enforces `<JIRA-KEY>: <type>(<scope>): <subject>` commit structure.
  * Defines PR checklist including tests, security checks, and review requirements.
* **Tasks**:
  1. Author `GIT_WORKFLOW.md`.
* **Points**: 2 | **Priority**: Medium

---

### Phase 2: Database Modeling & Express Backend Core Setup (`SLAD-EPIC-2`)

#### `SLAD-201`: Express Server Setup with Security Headers & CORS
* **Description**: As a backend developer, I want to initialize an Express application with security middleware (`helmet`, `cors`, `express-rate-limit`, `express.json()`), so that the API gateway is secure against common web vulnerabilities.
* **Acceptance Criteria**:
  * Express server boots cleanly on configured `PORT`.
  * CORS restricted to `CLIENT_ORIGIN`.
  * Helmet security headers applied to all responses.
  * Health check route `/api/health` returns status `200 OK`.
* **Tasks**:
  1. Scaffold `backend/package.json` with required dependencies.
  2. Implement `backend/src/server.js` and `app.js`.
  3. Configure security middleware and rate limiters.
* **Points**: 3 | **Priority**: High

#### `SLAD-202`: MongoDB Atlas Connection & Mongoose Configuration
* **Description**: As a backend developer, I want to establish a resilient Mongoose connection to MongoDB Atlas, so that data operations can proceed reliably with automated reconnects.
* **Acceptance Criteria**:
  * Successful connection logged on startup using `MONGODB_URI`.
  * Connection error handlers gracefully report failure and retry.
  * Graceful shutdown hooks handle `SIGINT` and `SIGTERM`.
* **Tasks**:
  1. Create `backend/src/config/db.js` with connection logic.
  2. Test local and Atlas cloud connectivity.
* **Points**: 3 | **Priority**: High

#### `SLAD-203`: User Entity Data Model and Validation Schema
* **Description**: As a backend developer, I want to create a Mongoose schema for the `User` entity, so that local and Google OAuth user records are securely stored.
* **Acceptance Criteria**:
  * Fields: `name` (String), `email` (String, unique, lowercase, trimmed), `password` (String, optional for OAuth users), `role` (`Analyst` | `Admin`, default `Analyst`), `authProvider` (`local` | `google`), `googleId` (String, optional), `createdAt`, `updatedAt`.
  * Index on `email` with uniqueness constraint.
* **Tasks**:
  1. Write `backend/src/models/User.js`.
  2. Add Mongoose schema pre-save hooks and instance methods.
* **Points**: 3 | **Priority**: High

#### `SLAD-204`: Security Log Entity Data Model and Indexes
* **Description**: As a data engineer, I want to design the Mongoose `Log` schema, so that ingested security events are normalized and queried efficiently.
* **Acceptance Criteria**:
  * Fields: `timestamp` (Date, indexed), `sourceIp` (String, indexed), `destinationIp` (String), `username` (String, indexed), `eventType` (String, indexed), `status` (`SUCCESS` | `FAILURE`), `port` (Number), `message` (String), `rawLog` (String), `isProcessed` (Boolean, default false).
  * Compound indexes on `(timestamp, eventType)` and `(sourceIp, status)`.
* **Tasks**:
  1. Create `backend/src/models/Log.js`.
  2. Add indexing strategy for log analytical queries.
* **Points**: 5 | **Priority**: High

#### `SLAD-205`: Security Alert Entity Data Model and Relationships
* **Description**: As a security analyst, I want detected anomalies saved in an `Alert` collection, so that anomalous events are surfaced with actionable context and severity rankings.
* **Acceptance Criteria**:
  * Fields: `logId` (Ref to `Log`), `title` (String), `description` (String), `severity` (`Critical` | `High` | `Medium` | `Low`), `anomalyScore` (Number), `status` (`OPEN` | `ACKNOWLEDGED` | `RESOLVED`), `assignedTo` (Ref to `User`, optional), `detectedAt` (Date), `resolvedAt` (Date).
  * Index on `(severity, status, detectedAt)`.
* **Tasks**:
  1. Create `backend/src/models/Alert.js`.
  2. Add population helpers for linked log records.
* **Points**: 3 | **Priority**: High

#### `SLAD-206`: Centralized Error Handling and Logging Infrastructure
* **Description**: As a developer, I want a uniform API response format and centralized error middleware, so that errors are logged with stack traces while client responses receive clean, sanitized JSON errors.
* **Acceptance Criteria**:
  * Standard JSON response format `{ success: boolean, data?: any, error?: string, details?: any }`.
  * Custom `AppError` class supporting HTTP status codes.
  * Express 4-argument error handler middleware catching unhandled exceptions.
* **Tasks**:
  1. Create `backend/src/utils/AppError.js`.
  2. Implement `backend/src/middleware/errorHandler.js`.
* **Points**: 3 | **Priority**: Medium

---

### Phase 3: Authentication & Authorization System (`SLAD-EPIC-3`)

#### `SLAD-301`: User Registration with bcryptjs Password Hashing
* **Description**: As a new user, I want to register an account with my email and password, so that I can securely log into the system.
* **Acceptance Criteria**:
  * Route: `POST /api/auth/register`.
  * Validates email format and password strength (min 8 characters).
  * Checks for existing user with identical email (returns `409 Conflict`).
  * Salts and hashes password with `bcryptjs` (salt rounds >= 10).
  * Returns user profile (without password hash) and signed JWT.
* **Tasks**:
  1. Build validation middleware with Joi/express-validator.
  2. Implement `register` controller in `backend/src/controllers/authController.js`.
  3. Mount route in `backend/src/routes/authRoutes.js`.
* **Points**: 5 | **Priority**: Highest

#### `SLAD-302`: Local User Login with JWT Token Minting
* **Description**: As an analyst, I want to authenticate with my email and password to receive a signed JWT token, so that I can access protected endpoints.
* **Acceptance Criteria**:
  * Route: `POST /api/auth/login`.
  * Verifies email existence and compares password hash using `bcryptjs.compare`.
  * Rejects invalid credentials with `401 Unauthorized` (constant-time response).
  * Signs and returns JWT containing `{ id, email, role }` with configurable expiry (`JWT_EXPIRES_IN`).
* **Tasks**:
  1. Implement `login` controller logic.
  2. Create JWT generation utility in `backend/src/utils/jwt.js`.
* **Points**: 5 | **Priority**: Highest

#### `SLAD-303`: Google Sign-In Verification via google-auth-library
* **Description**: As a user, I want to log in using my Google account, so that I can authenticate without maintaining a separate password.
* **Acceptance Criteria**:
  * Route: `POST /api/auth/google`.
  * Accepts Google ID Token string sent from frontend.
  * Verifies token authenticity using `google-auth-library` (`OAuth2Client.verifyIdToken`) against `GOOGLE_CLIENT_ID`.
  * Extracts verified payload (`email`, `name`, `sub`).
  * Upserts user with `authProvider: 'google'`, default role `Analyst`.
  * Returns application JWT token and user profile.
* **Tasks**:
  1. Initialize `OAuth2Client` in `backend/src/services/googleAuthService.js`.
  2. Implement Google token verification and user upsert controller.
  3. Mount endpoint in `authRoutes.js`.
* **Points**: 8 | **Priority**: Highest

#### `SLAD-304`: JWT Verification & Role-Based Access Control Middleware
* **Description**: As a system administrator, I want protected routes guarded by JWT verification and role checks, so that only authorized analysts and admins can access sensitive endpoints.
* **Acceptance Criteria**:
  * Middleware `authenticate`: extracts token from `Authorization: Bearer <token>`, verifies signature with `JWT_SECRET`, attaches decoded user to `req.user`. Returns `401 Unauthorized` if invalid or expired.
  * Middleware `authorize(...roles)`: checks if `req.user.role` matches allowed roles. Returns `403 Forbidden` if unauthorized.
* **Tasks**:
  1. Implement `backend/src/middleware/authMiddleware.js`.
  2. Create route guard unit tests.
* **Points**: 5 | **Priority**: High

---

### Phase 4: Frontend Foundations & Authentication UI (`SLAD-EPIC-4`)

#### `SLAD-401`: React Vite Scaffold, Routing & Global Theme Setup
* **Description**: As a frontend developer, I want to set up the React application using Vite with React Router, so that the team can build modular page views.
* **Acceptance Criteria**:
  * Fast Vite build and hot module replacement (HMR) operational.
  * React Router v6 configured with public and private route definitions.
  * Clean, responsive CSS layout with modern dark/light security dashboard styling.
* **Tasks**:
  1. Initialize React app inside `frontend/` using Vite.
  2. Set up React Router in `frontend/src/App.jsx`.
  3. Create navigation header and footer layout components.
* **Points**: 3 | **Priority**: High

#### `SLAD-402`: Authentication Context, Token Storage & Axios Interceptors
* **Description**: As a developer, I want an `AuthContext` with Axios request/response interceptors, so that the JWT token is automatically attached to API requests and stored securely.
* **Acceptance Criteria**:
  * `AuthContext` provides `user`, `token`, `login()`, `logout()`, `register()`.
  * Token persisted in `localStorage` and restored on application refresh.
  * Axios interceptor appends `Authorization: Bearer <token>` to all outgoing requests.
  * Response interceptor catches `401 Unauthorized` and triggers automatic logout.
* **Tasks**:
  1. Create `frontend/src/context/AuthContext.jsx`.
  2. Configure Axios client instance in `frontend/src/services/api.js`.
* **Points**: 5 | **Priority**: High

#### `SLAD-403`: User Login & Registration UI with Form Validation
* **Description**: As a user, I want intuitive login and registration forms with validation, so that I can easily enter my credentials and view helpful feedback.
* **Acceptance Criteria**:
  * Login page at `/login` with email and password inputs.
  * Registration page at `/register` with name, email, password, and confirm password inputs.
  * Client-side validation (valid email regex, minimum 8 characters).
  * Error banners displayed on invalid credentials or server errors.
* **Tasks**:
  1. Build `LoginPage.jsx` and `RegisterPage.jsx`.
  2. Implement form validation and loading spinners.
* **Points**: 5 | **Priority**: High

#### `SLAD-404`: Google Identity Services Sign-In Button Integration
* **Description**: As a user, I want a "Sign in with Google" button on the login and registration pages, so that I can authenticate in one click.
* **Acceptance Criteria**:
  * Loads Google Identity Services (`https://accounts.google.com/gsi/client`) script.
  * Renders official Google Sign-In button configured with `VITE_GOOGLE_CLIENT_ID`.
  * Callback receives credential response, forwards ID token to backend `/api/auth/google`, and redirects to dashboard upon success.
* **Tasks**:
  1. Create `GoogleSignInButton.jsx` component.
  2. Implement callback handler communicating with `AuthContext`.
* **Points**: 5 | **Priority**: High

#### `SLAD-405`: Protected Route Guards & Role-Based Navigation UI
* **Description**: As an analyst, I want unauthenticated users redirected to the login page when trying to access the dashboard, so that private resources are protected.
* **Acceptance Criteria**:
  * `ProtectedRoute` wrapper checks `isAuthenticated`. Redirects unauthenticated users to `/login`.
  * `RoleRoute` wrapper validates `allowedRoles` (e.g., restricts admin settings to `Admin`).
  * Navbar dynamically reflects authentication state (Logout button, User Name, Role badge).
* **Tasks**:
  1. Implement `ProtectedRoute.jsx` component.
  2. Add role-conditional rendering in navigation bar.
* **Points**: 3 | **Priority**: Medium

---

### Phase 5: Security Log Ingestion & Preprocessing Pipeline (`SLAD-EPIC-5`)

#### `SLAD-501`: Multipart CSV/JSON Security Log File Upload Route
* **Description**: As a security analyst, I want to upload security log files (CSV or JSON) through an API endpoint, so that historical log batches can be ingested for analysis.
* **Acceptance Criteria**:
  * Endpoint: `POST /api/logs/upload`.
  * Uses `multer` to accept `.csv` and `.json` files up to 20MB.
  * Rejects unapproved MIME types and corrupt files with `400 Bad Request`.
  * Parses file rows into structured log objects.
* **Tasks**:
  1. Configure Multer storage and file filter in `backend/src/middleware/uploadMiddleware.js`.
  2. Build file parsing utility for CSV (using `csv-parser`) and JSON.
  3. Implement upload controller.
* **Points**: 5 | **Priority**: High

#### `SLAD-502`: Direct JSON REST Log Ingestion API Endpoint
* **Description**: As a system administrator, I want to stream single or bulk JSON log entries via REST API, so that remote servers can ship real-time logs.
* **Acceptance Criteria**:
  * Endpoint: `POST /api/logs/ingest`.
  * Accepts single log object or array of log objects.
  * Validates required schema fields: `timestamp`, `sourceIp`, `eventType`, `status`.
  * Returns count of successfully ingested logs.
* **Tasks**:
  1. Implement batch validation schema.
  2. Build ingestion controller in `backend/src/controllers/logController.js`.
* **Points**: 3 | **Priority**: High

#### `SLAD-503`: Log Parsing, Schema Validation & Sanitization Engine
* **Description**: As a data engineer, I want raw log entries cleaned, validated, and normalized before saving, so that corrupt data does not reach the ML pipeline.
* **Acceptance Criteria**:
  * Trims whitespace and strips dangerous characters.
  * Normalizes status to standardized uppercase enum (`SUCCESS`, `FAILURE`).
  * Standardizes event types (e.g., `LOGIN_FAILED`, `ACCESS_GRANTED`, `PORT_SCAN`).
  * Discards or flags malformed records with descriptive validation error reports.
* **Tasks**:
  1. Create `backend/src/services/logPreprocessorService.js`.
  2. Write unit tests for log sanitization logic.
* **Points**: 5 | **Priority**: High

#### `SLAD-504`: Timestamp Normalization and IP Address Sanitization
* **Description**: As a data pipeline engineer, I want diverse timestamp formats converted to ISO 8601 UTC and IPv4/IPv6 addresses validated, so that feature extraction is accurate.
* **Acceptance Criteria**:
  * Handles standard date formats (Epoch seconds/millis, ISO 8601, RFC 2822, Syslog date format).
  * Converts all timestamps to UTC JavaScript `Date` instances.
  * Validates IPv4/IPv6 format with regex; flags invalid/loopback/private IPs appropriately.
* **Tasks**:
  1. Implement timestamp parser utility with date-fns or native Date.
  2. Implement IP validation and parser utility.
* **Points**: 3 | **Priority**: Medium

#### `SLAD-505`: Log Aggregation & Query Service with Pagination
* **Description**: As an analyst, I want to filter and search stored logs by IP, user, date range, event type, and status with pagination, so that I can inspect relevant log subsets.
* **Acceptance Criteria**:
  * Endpoint: `GET /api/logs` supporting query parameters: `page`, `limit`, `sourceIp`, `username`, `status`, `startDate`, `endDate`.
  * Returns paginated payload `{ logs: [...], total, page, totalPages }`.
  * Query execution optimized with Mongoose index hints.
* **Tasks**:
  1. Implement paginated query builder in `logController.js`.
  2. Write integration tests verifying query filters.
* **Points**: 5 | **Priority**: High

---

### Phase 6: Python FastAPI ML Microservice & Isolation Forest Model (`SLAD-EPIC-6`)

#### `SLAD-601`: FastAPI Microservice Initialization & Health Check
* **Description**: As an ML engineer, I want to scaffold a Python FastAPI application with Uvicorn, CORS, and health endpoints, so that the ML anomaly detection service runs as an independent microservice.
* **Acceptance Criteria**:
  * FastAPI application boots on `ML_PORT` (default 8000).
  * Health check route `GET /health` returns `{ "status": "ok", "service": "ml-service", "model_loaded": boolean }`.
  * Cross-Origin Resource Sharing (CORS) configured for Express backend.
* **Tasks**:
  1. Create `ml-service/requirements.txt` (`fastapi`, `uvicorn`, `pandas`, `scikit-learn`, `joblib`, `pydantic`).
  2. Implement `ml-service/main.py` and router setup.
* **Points**: 3 | **Priority**: High

#### `SLAD-602`: Feature Extraction Pipeline with Pandas
* **Description**: As a data scientist, I want a feature extraction module that transforms tabular log records into structured numerical vectors, so that the Isolation Forest model can process them.
* **Acceptance Criteria**:
  * Extracts numerical features from log rows:
    1. `event_count_per_ip`: Frequency of occurrences for the source IP within time window.
    2. `failed_login_count`: Cumulative failure count for the IP/user.
    3. `is_off_hours`: Binary flag (1 if event occurred between 22:00 and 06:00 local time, else 0).
    4. `unique_destinations_count`: Distinct count of destination IPs/ports accessed.
    5. `status_numeric`: Encoded status (0 = SUCCESS, 1 = FAILURE).
  * Outputs Pandas DataFrame with clean numeric columns and no NaN values.
* **Tasks**:
  1. Implement `ml-service/src/features.py`.
  2. Write Pandas transformations and unit tests with synthetic log datasets.
* **Points**: 8 | **Priority**: Highest

#### `SLAD-603`: Isolation Forest Model Training and Persistence Module
* **Description**: As a machine learning engineer, I want an automated script to train an `IsolationForest` model on feature matrices and serialize it to disk, so that inference can be executed quickly without retraining per request.
* **Acceptance Criteria**:
  * Model uses `sklearn.ensemble.IsolationForest(contamination=0.05, n_estimators=100, random_state=42)`.
  * Saves trained estimator to `models/isolation_forest.joblib` using `joblib`.
  * Training script loads baseline security log dataset, extracts features, fits model, and outputs training summary (inlier/outlier distribution).
* **Tasks**:
  1. Implement `ml-service/src/train.py`.
  2. Create synthetic baseline training log dataset.
  3. Validate model persistence and reloading in memory.
* **Points**: 8 | **Priority**: Highest

#### `SLAD-604`: Real-Time Anomaly Prediction and Scoring REST API
* **Description**: As a backend developer, I want an inference endpoint `POST /predict` that accepts preprocessed log vectors and returns anomaly predictions and anomaly scores, so that new events can be assessed instantly.
* **Acceptance Criteria**:
  * Endpoint: `POST /predict`.
  * Input: JSON array of log event objects conforming to Pydantic schema.
  * Model predicts `prediction`: `1` for normal, `-1` for anomaly.
  * Computes `anomaly_score`: Float between `0.0` and `1.0` derived from `score_samples()`.
  * Returns list of scored results with boolean `is_anomaly: true/false`.
* **Tasks**:
  1. Define Pydantic request/response schemas in `ml-service/src/schemas.py`.
  2. Implement inference route handler in `ml-service/src/routes.py`.
* **Points**: 5 | **Priority**: Highest

#### `SLAD-605`: Batch Anomaly Evaluation Endpoint for Historical Logs
* **Description**: As an analyst, I want to evaluate a large batch of historical logs in a single call, so that uploaded files can be scored in bulk without timeouts.
* **Acceptance Criteria**:
  * Endpoint: `POST /predict/batch`.
  * Handles up to 10,000 log events efficiently using vectorized Pandas operations.
  * Execution time under 2.5 seconds for 5,000 records.
  * Returns aggregated summary statistics (total logs, anomaly count, contamination percentage).
* **Tasks**:
  1. Implement batch prediction handler with streaming or chunked Pandas processing.
  2. Benchmark execution latency with synthetic 5,000-row batch.
* **Points**: 5 | **Priority**: High

---

### Phase 7: Backend-to-ML Integration & Alert Generation (`SLAD-EPIC-7`)

#### `SLAD-701`: Express HTTP Client for ML Microservice Invocations
* **Description**: As a backend developer, I want an internal service client that communicates with the Python FastAPI microservice over HTTP, so that the Node backend can seamlessly request predictions.
* **Acceptance Criteria**:
  * Axios client configured with `ML_SERVICE_URL` and 5000ms timeout.
  * Automatic retry strategy (up to 2 retries with exponential backoff) on network failure.
  * Fallback handling and meaningful error logging if the ML service is unreachable.
* **Tasks**:
  1. Implement `backend/src/services/mlClient.js`.
  2. Add unit tests with mocked Axios responses.
* **Points**: 5 | **Priority**: High

#### `SLAD-702`: Alert Generation Engine with Anomaly Score Thresholding
* **Description**: As a security system, I want events marked as anomalies (`prediction == -1`) converted into `Alert` records and saved in MongoDB, so that security analysts can inspect and triage them.
* **Acceptance Criteria**:
  * Iterates through ML prediction results.
  * For every event where `is_anomaly === true`, creates an `Alert` document linked to the corresponding `Log` ID.
  * Inserts alerts in bulk to MongoDB for high throughput.
* **Tasks**:
  1. Implement alert creation logic in `backend/src/services/alertService.js`.
  2. Connect alert generation to log upload and ingestion pipelines.
* **Points**: 5 | **Priority**: Highest

#### `SLAD-703`: Alert Severity Mapping (Critical, High, Medium, Low)
* **Description**: As a security analyst, I want alerts categorized into severity tiers based on their anomaly score and event type, so that I can prioritize urgent threats first.
* **Acceptance Criteria**:
  * Severity algorithm:
    * `Critical`: Anomaly score >= 0.85 OR (`LOGIN_FAILED` > 10 within 5 minutes).
    * `High`: Anomaly score >= 0.70 AND < 0.85.
    * `Medium`: Anomaly score >= 0.55 AND < 0.70.
    * `Low`: Anomaly score < 0.55.
  * Computed severity persisted in the `Alert` document.
* **Tasks**:
  1. Implement severity calculation utility in `backend/src/utils/severityCalculator.js`.
  2. Unit test boundary values for each severity tier.
* **Points**: 3 | **Priority**: High

#### `SLAD-704`: Alert Management APIs (Acknowledge, Resolve, Filter)
* **Description**: As an analyst, I want REST API endpoints to list, filter, acknowledge, and resolve alerts, so that I can track alert triage lifecycle.
* **Acceptance Criteria**:
  * `GET /api/alerts`: List alerts with pagination and filters (`severity`, `status`, `startDate`, `endDate`).
  * `PATCH /api/alerts/:id/status`: Update status to `ACKNOWLEDGED` or `RESOLVED`.
  * `GET /api/alerts/summary`: Return counts of open alerts grouped by severity.
* **Tasks**:
  1. Implement alert routes and controller in `backend/src/controllers/alertController.js`.
  2. Add role authorization checks (Analyst and Admin).
* **Points**: 5 | **Priority**: High

---

### Phase 8: Security Analyst Dashboard & Visualization (`SLAD-EPIC-8`)

#### `SLAD-801`: Dashboard Metric Summary Cards (Logs, Anomaly Count, Alerts)
* **Description**: As a security analyst, I want to see top-level KPI cards on the dashboard, so that I can instantly assess the health and threat posture of the environment.
* **Acceptance Criteria**:
  * Displays: Total Logs Ingested, Total Anomalies Detected, Active Open Alerts, and Critical Alerts Count.
  * Dynamic percentage change indicator or status indicator.
  * Smooth skeleton loading states while metrics load from `/api/alerts/summary` and `/api/logs/summary`.
* **Tasks**:
  1. Create `frontend/src/components/MetricCard.jsx`.
  2. Assemble overview metrics section in `DashboardPage.jsx`.
* **Points**: 5 | **Priority**: High

#### `SLAD-802`: Real-Time Alert List with Severity Badges and Filters
* **Description**: As an analyst, I want an alert feed showing recent alerts with color-coded severity badges, so that I can immediately identify critical security incidents.
* **Acceptance Criteria**:
  * Displays alerts with Title, Source IP, Severity badge (Red=Critical, Orange=High, Yellow=Medium, Blue=Low), Status, and Timestamp.
  * Filter controls for Severity dropdown and Status filter (All, Open, Acknowledged, Resolved).
  * Inline action buttons to "Acknowledge" or "Resolve" alerts.
* **Tasks**:
  1. Build `AlertList.jsx` and `AlertCard.jsx` components.
  2. Connect status update actions to backend API.
* **Points**: 5 | **Priority**: High

#### `SLAD-803`: Anomaly Timeline & Trend Charts Component
* **Description**: As an analyst, I want visual trend charts showing anomaly frequency over time, so that I can spot attack patterns and spike intervals.
* **Acceptance Criteria**:
  * Renders a responsive time-series chart showing total logs vs. anomalous logs per hour/day.
  * Renders a donut/pie breakdown chart of alerts by severity.
  * Tooltips displaying exact counts upon hovering over data points.
* **Tasks**:
  1. Implement charting component using Chart.js / Recharts.
  2. Create backend endpoint `/api/alerts/trends` aggregating timeline data.
* **Points**: 5 | **Priority**: High

#### `SLAD-804`: Security Log Viewer with Search, Filter & Inspection Modal
* **Description**: As an analyst, I want a comprehensive log table with search and inspection capabilities, so that I can examine the raw event data linked to an alert.
* **Acceptance Criteria**:
  * Tabular view of security logs with columns: Timestamp, Event Type, Source IP, Status, User, Actions.
  * Search bar filtering by IP or username.
  * Clicking "Inspect" opens a modal displaying the complete log object, parsed fields, and associated ML anomaly score.
* **Tasks**:
  1. Build `LogTable.jsx` and `LogDetailModal.jsx`.
  2. Implement pagination controls (Next, Previous, Page size).
* **Points**: 5 | **Priority**: High

#### `SLAD-805`: Security Log File Upload & Analysis Trigger UI
* **Description**: As an analyst, I want a drag-and-drop file upload interface on the frontend, so that I can upload CSV/JSON log batches and trigger immediate anomaly detection.
* **Acceptance Criteria**:
  * Drag-and-drop zone supporting `.csv` and `.json` file formats.
  * Upload progress bar and real-time status message.
  * Upon upload completion, displays summary modal showing number of logs ingested and anomalies detected, with a direct link to the filtered alert list.
* **Tasks**:
  1. Create `LogUploadModal.jsx` with file dropzone.
  2. Hook upload action to `/api/logs/upload` and refresh dashboard state.
* **Points**: 5 | **Priority**: High

---

### Phase 9: Testing, API Docs, Containerization & CI/CD (`SLAD-EPIC-9`)

#### `SLAD-901`: Swagger (OpenAPI) Documentation for Backend and ML APIs
* **Description**: As a developer and API consumer, I want interactive Swagger documentation for all backend and ML service endpoints, so that endpoints are easily testable.
* **Acceptance Criteria**:
  * Backend Swagger UI accessible at `/api-docs` via `swagger-ui-express`.
  * ML FastAPI Swagger docs accessible at `/docs`.
  * All authentication, log, and alert endpoints documented with request bodies, schemas, and response codes.
* **Tasks**:
  1. Configure `backend/src/config/swagger.js`.
  2. Add JSDoc OpenAPI annotations to route handlers.
  3. Validate FastAPI auto-generated OpenAPI schema.
* **Points**: 3 | **Priority**: High

#### `SLAD-902`: Postman Automated Test Collection & Environment Setup
* **Description**: As a QA engineer, I want an exported Postman collection with automated test scripts and environment variables, so that API testing can be executed reliably.
* **Acceptance Criteria**:
  * Postman collection covering: Register, Login, Google Auth, Ingest Logs, Upload File, Query Logs, Predict ML, Fetch Alerts, Update Alert Status.
  * Includes pre-request scripts saving JWT token to environment.
  * Postman test assertions verify HTTP 200/201 status codes and JSON response schemas.
* **Tasks**:
  1. Author `tests/postman/Security_Log_Anomaly_Detection.postman_collection.json`.
  2. Create `tests/postman/Local_Environment.postman_environment.json`.
* **Points**: 3 | **Priority**: Medium

#### `SLAD-903`: Backend Unit & Integration Tests (Supertest, Jest)
* **Description**: As a backend developer, I want comprehensive unit and integration tests using Jest and Supertest, so that regressions are caught during CI.
* **Acceptance Criteria**:
  * Unit tests for password hashing, JWT generation, severity calculations, and log sanitization.
  * Integration tests for auth routes (`/api/auth/*`), log ingestion (`/api/logs/*`), and alert triage (`/api/alerts/*`).
  * Test suite runs via `npm test` with minimum 75% code coverage.
* **Tasks**:
  1. Set up Jest and Supertest in `backend/`.
  2. Write unit tests in `backend/tests/unit/`.
  3. Write route integration tests in `backend/tests/integration/`.
* **Points**: 5 | **Priority**: High

#### `SLAD-904`: ML Service Unit Tests (pytest, FastAPI TestClient)
* **Description**: As an ML engineer, I want automated tests using `pytest` and FastAPI's `TestClient`, so that feature extraction and model inference logic are verified.
* **Acceptance Criteria**:
  * Tests feature extraction logic against synthetic edge cases (empty strings, missing fields, extreme timestamps).
  * Tests `/predict` and `/predict/batch` endpoints verifying output schema (`prediction`, `anomaly_score`, `is_anomaly`).
  * Tests execute via `pytest` and pass cleanly.
* **Tasks**:
  1. Create test suites in `ml-service/tests/test_features.py` and `ml-service/tests/test_api.py`.
  2. Integrate test execution into service test runner.
* **Points**: 5 | **Priority**: High

#### `SLAD-905`: Docker Containerization for Backend, Frontend, and ML
* **Description**: As a DevOps engineer, I want multi-stage Dockerfiles for each service and a root `docker-compose.yml`, so that the entire system can be spun up locally with a single command.
* **Acceptance Criteria**:
  * Multi-stage `backend/Dockerfile` using lightweight `node:18-alpine`.
  * Multi-stage `frontend/Dockerfile` building Vite static assets and serving via Nginx.
  * `ml-service/Dockerfile` using `python:3.10-slim`.
  * Root `docker-compose.yml` spinning up MongoDB, Backend, ML Service, and Frontend with health checks.
* **Tasks**:
  1. Author `backend/Dockerfile`, `frontend/Dockerfile`, `ml-service/Dockerfile`.
  2. Write root `docker-compose.yml` with bridge network and environment passing.
* **Points**: 5 | **Priority**: High

#### `SLAD-906`: Nginx Reverse Proxy Configuration & SSL Routing
* **Description**: As a DevOps engineer, I want an Nginx reverse proxy configuration, so that external traffic is routed to the frontend, backend API, and ML services through a single port.
* **Acceptance Criteria**:
  * Routes `/` to frontend static build.
  * Routes `/api` to Express backend on port 5000.
  * Configures gzip compression, client max body size (25M for log uploads), and standard proxy headers (`X-Forwarded-For`, `X-Real-IP`).
* **Tasks**:
  1. Implement `nginx/nginx.conf` and `nginx/default.conf`.
  2. Test routing with Docker Compose.
* **Points**: 5 | **Priority**: High

#### `SLAD-907`: Kubernetes Manifests for Cluster Deployment
* **Description**: As a cloud engineer, I want Kubernetes deployment and service manifests in `/k8s`, so that the platform can be deployed to a Kubernetes cluster.
* **Acceptance Criteria**:
  * Deployment and Service manifests for Backend, Frontend, and ML Service.
  * ConfigMap and Secret templates for environment variable injection.
  * Ingress definition with path routing for `/`, `/api`, and `/api-docs`.
* **Tasks**:
  1. Write `k8s/backend-deployment.yaml`, `k8s/frontend-deployment.yaml`, `k8s/ml-deployment.yaml`.
  2. Write `k8s/ingress.yaml` and `k8s/configmap.yaml`.
* **Points**: 5 | **Priority**: Medium

#### `SLAD-908`: Jenkins CI/CD Pipeline Automation Script
* **Description**: As a release engineer, I want a declarative Jenkinsfile in `/jenkins`, so that commits to `develop` and `main` trigger automated linting, testing, Docker builds, and deployment.
* **Acceptance Criteria**:
  * Declarative stages: Checkout, Lint & Static Analysis, Backend Tests, ML Service Tests, Docker Build & Push, Deploy to Staging/Production.
  * Notifications on build failure.
  * Clean teardown of test containers.
* **Tasks**:
  1. Author `jenkins/Jenkinsfile`.
  2. Document Jenkins pipeline configuration steps.
* **Points**: 5 | **Priority**: Medium
