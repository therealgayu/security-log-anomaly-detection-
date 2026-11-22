# Jenkins CI/CD Setup Guide
## Security Log Anomaly Detection System (NIIT University Capstone II)

This document provides step-by-step instructions for configuring Jenkins, required plugins, credentials, Docker host access, and GitHub webhooks to automate the build, test, containerization, and deployment lifecycle.

---

### 1. Starting Jenkins with Local Docker Daemon Access

To allow Jenkins to build Docker images and execute `docker compose` commands on the host machine, start the official LTS Jenkins container mounting the Docker socket:

```bash
docker run -d \
  --name slads-jenkins \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  --group-add $(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo 0) \
  jenkins/jenkins:lts
```

#### Post-Startup Permissions Fix (Inside Container)
If Jenkins cannot access the Docker socket, execute:
```bash
docker exec -u 0 -it slads-jenkins chmod 666 /var/run/docker.sock
```

Retrieve the initial administrator password:
```bash
docker exec slads-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

### 2. Required Jenkins Plugins

Install the following plugins via **Manage Jenkins -> Plugins -> Available Plugins**:

1. **Git Plugin** (`git`): For cloning the project repository.
2. **GitHub Plugin** (`github`): For automated webhook triggers and commit status updates.
3. **Pipeline** (`workflow-aggregator`): For declarative Jenkinsfile pipeline support.
4. **Docker Pipeline** (`docker-workflow`): For executing Docker commands within pipeline stages.
5. **Credentials Binding Plugin** (`credentials-binding`): For safely injecting API secrets and passwords.
6. **SSH Agent Plugin** (`ssh-agent`): For passwordless SSH deployment to target staging/production servers.
7. **NodeJS Plugin** (`nodejs`): For building Node.js/Express and React applications.
8. **AnsiColor Plugin** (`ansicolor`): For colorized terminal and test output.

---

### 3. Configured Credentials in Jenkins

Navigate to **Manage Jenkins -> Credentials -> System -> Global credentials -> Add Credentials** and register the following:

| Credential ID | Kind | Purpose |
| :--- | :--- | :--- |
| `dockerhub-credentials` | Username with password | Docker Hub registry authentication for pushing container images (`niitcapstone/*`). |
| `deploy-ssh-credentials` | SSH Username with private key | Deployment key for authenticating with the production server (`deploy.slads.internal`). |
| `slads-env-secret` | Secret text | Production application master key and JWT signing secret. |

---

### 4. GitHub Webhook Configuration

To trigger the Jenkins pipeline automatically on every `git push`:

1. Open your GitHub repository and go to **Settings -> Webhooks -> Add webhook**.
2. **Payload URL**:
   ```
   http://<YOUR_JENKINS_PUBLIC_IP_OR_DOMAIN>:8080/github-webhook/
   ```
3. **Content type**: `application/json`
4. **Secret**: Optional shared secret string.
5. **Which events would you like to trigger this webhook?**: Select **Just the push event**.
6. Check **Active** and click **Add webhook**.

---

### 5. Creating the Pipeline Job

1. In Jenkins, click **New Item**.
2. Enter item name `slads-pipeline` and select **Pipeline**.
3. Under **Build Triggers**, check **GitHub hook trigger for GITScm polling**.
4. In the **Pipeline** section:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/your-username/security-log-anomaly-detection-system.git`
   - **Branch Specifier**: `*/main` (or `*/master`)
   - **Script Path**: `Jenkinsfile`
5. Click **Save** and trigger a test build using **Build Now**.
