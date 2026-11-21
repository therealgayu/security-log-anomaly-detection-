---
name: project-scope-lock
description: Enforces the project scope, fixed stack, and exclusion rules for Security Log Anomaly Detection System (NIIT University Capstone II).
always_on: true
---

# Scope & Context Lock: Security Log Anomaly Detection System

1. **Context Initialization**:
   - Before executing any task, the agent MUST read and strictly adhere to `PROJECT_CONTEXT.md`.
   - The agent is working EXCLUSIVELY on "Security Log Anomaly Detection System" for NIIT University Capstone II.

2. **Memory Isolation**:
   - Ignore any memory, knowledge items, snippets, or files from any other projects or tasks.
   - Do not reference or adopt external unapproved architectures.

3. **Fixed Tech Stack**:
   - React (Vite)
   - Node.js + Express
   - MongoDB Atlas (Mongoose)
   - JWT (`jsonwebtoken`), `bcryptjs`, Google Sign-In (`google-auth-library` + Google Identity Services)
   - Python + FastAPI + Pandas + scikit-learn (`IsolationForest`)
   - Postman, Swagger

4. **Strictly Excluded Features**:
   - NO DAG / evidence graphs
   - NO Jaccard similarity
   - NO Ollama / LLM / Gemma / Generative AI
   - NO Evidence locking
   - NO Case builder
   - NO Law-enforcement training features
   - NO Payments
   - NO unlisted features

5. **Code Completeness**:
   - Generate full, complete, production-grade code without placeholders, stubs, or ellipses.
