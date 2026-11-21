# PROJECT_CONTEXT.md
# Project Context & Scope Specification

## 1. Project Information
* **Project Name**: Security Log Anomaly Detection System
* **Academic Context**: NIIT University Capstone II Project
* **Source of Truth**: `/docs/SRS.docx`, `/docs/SDD.docx`, and this `PROJECT_CONTEXT.md` file.

---

## 2. Project Description
The **Security Log Anomaly Detection System** is a secure, end-to-end web application developed for NIIT University Capstone II that ingests multi-source security event logs, cleans and normalizes event data, extracts behavioral and statistical feature vectors, and applies an unsupervised scikit-learn Isolation Forest machine learning model via a dedicated Python FastAPI microservice to detect anomalous security occurrences. The system automatically categorizes, scores, and prioritizes anomalies into actionable, severity-rated security alerts stored within MongoDB Atlas, and presents them in real time on an interactive React (Vite) dashboard with robust authentication (local bcryptjs + JWT and Google Sign-In via Google Identity Services) and role-based access control, empowering security analysts to rapidly identify, investigate, and mitigate infrastructure threats.

---

## 3. Project Objectives
1. **Secure Web Application**: Build a production-ready, defensively engineered web platform adhering to standard application security practices (CORS, secure headers, sanitized inputs, rate limiting).
2. **User Registration & Login**: Provide secure user registration and login workflows using local email/password credentials with salted password hashing via `bcryptjs`.
3. **JWT Authentication & Authorization**: Implement stateless, signed JSON Web Tokens (JWT) for session management and enforce Role-Based Access Control (RBAC: `Admin`, `Analyst`) across protected API endpoints and frontend views.
4. **Google Sign-In**: Integrate federated Google OAuth 2.0 authentication using Google Identity Services on the React frontend and server-side token verification using `google-auth-library` on the Express backend.
5. **Log Collection and Ingestion**: Support ingestion of security event logs (authentication attempts, firewall logs, server access records) through batch CSV/JSON file uploads and REST API ingestion endpoints.
6. **Log Preprocessing**: Validate, clean, and standardize raw log entries, including timestamp normalization (ISO 8601), IP address sanitization/extraction, missing value resolution, and categorical event standardization.
7. **Feature Extraction**: Transform cleaned security logs into structured numerical feature vectors (e.g., event frequencies, failed authentication rates, off-hour activity flags, distinct resource access counts) for ML ingestion.
8. **ML Anomaly Detection**: Deploy an unsupervised `scikit-learn` Isolation Forest algorithm within an independent Python FastAPI microservice to detect outliers and anomalous behaviors without requiring labeled training datasets.
9. **Alert Generation & Prioritization**: Automatically transform detected anomalous events into persisted alert records in MongoDB Atlas, computing anomaly scores and categorizing severity levels (`Critical`, `High`, `Medium`, `Low`).
10. **Interactive Analyst Dashboard**: Provide an intuitive, responsive React dashboard displaying high-level security metrics, anomaly trends, recent alerts, severity distribution charts, log search/filtering, and detailed alert inspection.

---

## 4. Fixed Tech Stack (Strictly Enforced - No Substitutions)

| Component | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | **React (Vite)** | Single Page Application (SPA), lightning-fast HMR, component-driven UI. |
| **Backend Framework** | **Node.js + Express** | RESTful API gateway, authentication, business logic, log ingestion orchestrator. |
| **Database & ODM** | **MongoDB Atlas + Mongoose** | Document database for flexible log storage, user entities, and alert schemas. |
| **Authentication & Security** | **JWT (`jsonwebtoken`) + `bcryptjs`** | Stateless session authorization and cryptographic password hashing. |
| **OAuth Integration** | **Google Sign-In (`google-auth-library` + Google Identity Services)** | Third-party federated identity authentication. |
| **ML Microservice** | **Python 3.10+ & FastAPI** | High-performance asynchronous ML inference API. |
| **Data Processing & ML** | **Pandas & scikit-learn (`IsolationForest`)** | Tabular data manipulation, feature matrix preparation, and outlier detection. |
| **API Testing & Docs** | **Postman & Swagger (OpenAPI)** | Interactive API documentation (`swagger-ui-express` & FastAPI auto-docs) and Postman test collections. |
| **Reverse Proxy** | **Nginx** | Reverse proxy, static asset delivery, SSL termination, and request routing. |
| **Containerization & K8s** | **Docker & Kubernetes (`k8s`)** | Container packaging for frontend, backend, and ML services; pod deployments and services. |
| **CI/CD Automation** | **Jenkins** | Continuous integration and automated deployment pipelines. |

---

## 5. End-to-End System Flow
The platform executes the following sequential operational pipeline:
```
User (Analyst / Admin)
       │
       ▼
[Sign up / Login / Google Sign-In]
       │
       ▼
[JWT Token Issued & Role Stored]
       │
       ▼
[Access Protected Dashboard]
       │
       ▼
[Log Collection / Ingestion] ────► Batch File Upload (CSV/JSON) or REST API endpoint
       │
       ▼
[Log Preprocessing Pipeline] ────► Cleaning, timestamp normalization, IP parsing, field validation
       │
       ▼
[Feature Extraction Engine] ─────► Numerical aggregation (frequencies, failed attempts, off-hour flags)
       │
       ▼
[FastAPI ML Microservice] ───────► Input vectors passed to scikit-learn Isolation Forest model
       │
       ▼
[Anomaly Detection & Scoring] ───► Outlier flag (-1) & anomaly score calculation
       │
       ▼
[Alert Generation Engine] ───────► Alert document constructed with severity (Critical/High/Med/Low)
       │
       ▼
[MongoDB Atlas Persistence] ─────► Logs and Alerts saved to collections
       │
       ▼
[Dashboard Visualization] ───────► Real-time alert list, anomaly charts, filterable log tables
```

---

## 6. Excluded Features (Strictly Forbidden - Never Add)
The following components, libraries, methodologies, or architectural features are **strictly out of scope** and must **NEVER** be implemented, suggested, or referenced:
* ❌ **DAG / Evidence Graphs**: No directed acyclic graphs, graph databases (Neo4j), or topological attack graphs.
* ❌ **Jaccard Similarity**: No Jaccard coefficient or set-similarity metrics for log clustering.
* ❌ **Ollama / LLMs / Gemma / Generative AI**: No Large Language Models, natural language explanations, chat bots, or external AI APIs.
* ❌ **Evidence Locking**: No cryptographic chain-of-custody, immutable evidence vaults, or write-once-read-many (WORM) locking mechanisms.
* ❌ **Case Builder / Case Management**: No incident response ticketing, case dossiers, legal export modules, or evidence collation workflows.
* ❌ **Law-Enforcement Training Features**: No specialized law enforcement modules, forensic interview tools, courtroom presentation exports, or police academy training aids.
* ❌ **Payments & Billing**: No Stripe, PayPal, subscription management, or financial gateways.
* ❌ **Any Unlisted Feature**: No feature beyond those explicitly specified in this document and the project SRS/SDD.

---

## 7. Assumptions & Minimal Option Principles
* **Log Ingestion Format**: Standardized security event logs conforming to basic authentication logs (Timestamp, Source IP, Destination IP, Username, Event Type, Status, Port, Message).
* **Isolation Forest Hyperparameters**: Contamination rate defaults to `0.05` (5% expected anomalies), `n_estimators=100`, `random_state=42`.
* **Roles**: Two roles only: `Analyst` (view logs, view alerts, upload logs, acknowledge alerts) and `Admin` (all analyst capabilities + user management and system settings).
* **Minimal Dependencies**: Use lean, standard npm and pip packages directly aligned with the fixed stack.
