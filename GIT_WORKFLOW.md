# Git Workflow & Collaboration Guidelines
# Security Log Anomaly Detection System (NIIT University Capstone II)

## 1. Branching Strategy

The repository follows an adapted GitFlow branching model focused on continuous integration and clean, audit-friendly version history.

```
       main  ──────────────────────────────────────────●────── (Production Releases)
              ▲                                       ▲
               \                                     /
    develop  ───●──────────●──────────●─────────────●──────── (Integration)
                 \        /            \           /
feature/SLAD-*    ●──────●              ●─────────●           (Feature Branches)
```

### Core Branches
* **`main`**:
  * Represents production-ready, deployable code.
  * Direct commits to `main` are **strictly forbidden**.
  * Changes reach `main` exclusively via pull requests from `develop` upon release readiness.
  * Every merge to `main` is tagged with a semantic release version (`v1.0.0`, `v1.1.0`, etc.).
* **`develop`**:
  * Main integration branch for active development.
  * Nightly builds, staging deployments, and automated integration tests run against this branch.
  * All feature and bugfix branches fork from and merge back into `develop`.

### Supporting Branches
* **`feature/<jira-key>-<short-description>`**:
  * Used for developing new capabilities (e.g., `feature/SLAD-101-jwt-auth`, `feature/SLAD-204-isolation-forest-api`).
  * Always branch from `develop`.
  * Merged into `develop` through an approved Pull Request.
* **`bugfix/<jira-key>-<short-description>`**:
  * Used to resolve non-critical defects discovered in `develop` during sprint testing.
  * Example: `bugfix/SLAD-315-fix-timestamp-parser`.
  * Merged back into `develop`.
* **`hotfix/<jira-key>-<short-description>`**:
  * Created directly from `main` to address critical production issues that cannot wait for the next release cycle.
  * Example: `hotfix/SLAD-999-fix-google-token-auth`.
  * Merged into both `main` and `develop`.

---

## 2. Commit Message Convention

All commit messages MUST follow the structured format linking directly to a corresponding Jira issue:

```
<JIRA-KEY>: <type>(<scope>): <short imperative description>

[optional body explaining motivation and technical approach]

[optional footer(s) for issue references or breaking changes]
```

### Commit Types
* `feat`: A new user-facing or system capability.
* `fix`: A defect or bug resolution.
* `docs`: Documentation updates (e.g., README, SRS, API docs).
* `style`: Code style, formatting, white-space changes (no functional impact).
* `refactor`: Code restructuring without bug fixes or new features.
* `perf`: Performance optimization.
* `test`: Addition or modification of unit, integration, or end-to-end tests.
* `chore`: Build process, dependencies, tooling, or CI/CD configuration.
* `ci`: Jenkins or deployment pipeline updates.

### Examples
* `SLAD-102: feat(auth): implement Google OAuth token verification via google-auth-library`
* `SLAD-205: fix(ml): calibrate isolation forest contamination threshold calculation`
* `SLAD-310: test(backend): add integration tests for log ingestion file upload`
* `SLAD-401: docs(api): generate Swagger OpenAPI documentation for /api/v1/alerts`

### Rules
1. **Imperative Mood**: Use imperative present tense in the subject ("add feature", not "added feature" or "adds feature").
2. **Subject Length**: Limit subject line to 72 characters.
3. **No Trailing Period**: Do not end the subject line with a period.
4. **Jira Key**: Every commit MUST start with the assigned Jira key (e.g., `SLAD-XXX:`).

---

## 3. Pull Request (PR) Rules

### Lifecycle & Base Target
* Feature and bugfix PRs must target **`develop`**.
* Release PRs target **`main`** from **`develop`**.

### PR Title Convention
PR titles must clearly convey the Jira reference and high-level goal:
```
[<JIRA-KEY>] <Concise, descriptive title>
```
*Example*: `[SLAD-102] Implement Google OAuth Sign-In and JWT session minting`

### Required Pull Request Template
Every PR description must contain the following sections:
```markdown
## Summary
Concise explanation of the changes introduced in this PR.

## Jira Issue
Closes [SLAD-XXX](https://jira.example.com/browse/SLAD-XXX)

## Type of Change
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] Refactor (non-breaking code reorganization)
- [ ] Documentation / CI update

## Verification & Testing
- [ ] Unit tests written and passing locally
- [ ] Integration tests passing
- [ ] Postman / Swagger endpoint verified manually
- [ ] No regression on existing endpoints

## Security & Compliance Checklist
- [ ] No credentials, API secrets, or passwords committed (.env ignored)
- [ ] Input data sanitized and validated
- [ ] Role-Based Access Control verified on protected routes
- [ ] Adheres strictly to PROJECT_CONTEXT.md (no excluded features added)
```

### Review and Merge Policy
1. **Approvals**: At least **one peer review approval** is mandatory before merging.
2. **Automated Status Checks**:
   * CI test pipeline (Jenkins / automated test suite) must pass with zero errors.
   * Linter and code style checks must pass cleanly.
3. **Merge Strategy**:
   * Use **Squash and Merge** for feature branches into `develop` to maintain a concise, clean linear history.
   * Use **Merge Commit** (no fast-forward) when releasing `develop` into `main` to preserve release milestones.
4. **Branch Cleanup**: The branch must be deleted immediately after a successful merge.
