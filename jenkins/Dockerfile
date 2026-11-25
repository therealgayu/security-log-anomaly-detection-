# ==============================================================================
# Security Log Anomaly Detection System (NIIT University Capstone II)
# Custom Jenkins Image with Node.js, Python, and Docker CLI preinstalled
# ==============================================================================

FROM jenkins/jenkins:lts

USER root

# Install Node.js, NPM, Python3, Venv, and Docker CLI for pipeline execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    python3 \
    python3-pip \
    python3-venv \
    docker.io \
    curl \
    git \
 && usermod -aG docker jenkins \
 && rm -rf /var/lib/apt/lists/*

USER jenkins
