# ==============================================================================
# Agent Workspace Rules (AGENTS.md)
# Security Log Anomaly Detection System (NIIT University Capstone II)
# ==============================================================================

## 1. Scope & Context Lock
* **Target Project**: Security Log Anomaly Detection System (NIIT University Capstone II).
* **Mandatory Action**: Read and enforce `PROJECT_CONTEXT.md` before executing any task.
* **Isolation**: Ignore any memory, knowledge items, or files from other projects. Do not introduce concepts outside this project's defined boundaries.

## 2. Fixed Tech Stack (Strictly Enforced)
* **Frontend**: React (Vite)
* **Backend**: Node.js + Express
* **Database**: MongoDB Atlas (Mongoose)
* **Authentication**: JWT (`jsonwebtoken`), `bcryptjs`, Google Sign-In (`google-auth-library` + Google Identity Services)
* **ML Service**: Python + FastAPI + Pandas + scikit-learn (`IsolationForest`)
* **API Documentation**: Postman, Swagger (OpenAPI)
* **Infrastructure**: Nginx, Docker, Kubernetes (`k8s`), Jenkins

## 3. Explicitly Excluded Features
Never propose, generate, or incorporate:
1. DAG / evidence graphs
2. Jaccard similarity
3. Ollama / LLM / Gemma / Generative AI
4. Evidence locking
5. Case builder / case management
6. Law-enforcement training features
7. Payments or billing
8. Any feature not documented in `PROJECT_CONTEXT.md`

## 4. Code Quality & Completeness
* Generate full, working, production-grade code without placeholders, ellipses, or "TODO: implement here" comments.
* Stick strictly to source of truth: `/docs/SRS.docx`, `/docs/SDD.docx`, and `PROJECT_CONTEXT.md`.
