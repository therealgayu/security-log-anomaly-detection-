// ==============================================================================
// Security Log Anomaly Detection System (NIIT University Capstone II)
// Declarative Jenkins CI/CD Pipeline
// ==============================================================================

pipeline {
    agent any

    // Triggers automatically on GitHub push webhook events
    triggers {
        githubPush()
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '15'))
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    environment {
        // Docker Hub Registry Credentials & Image Names
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_REPO_PREFIX   = 'niitcapstone'
        
        BACKEND_IMAGE    = "${DOCKERHUB_REPO_PREFIX}/slads-backend"
        ML_SERVICE_IMAGE = "${DOCKERHUB_REPO_PREFIX}/slads-ml-service"
        FRONTEND_IMAGE   = "${DOCKERHUB_REPO_PREFIX}/slads-frontend"
        
        IMAGE_TAG = "${env.BUILD_NUMBER}"

        // Deployment Server Configuration
        DEPLOY_SSH_CREDENTIALS_ID = 'deploy-ssh-credentials'
        DEPLOY_SERVER_USER        = 'deploy'
        DEPLOY_SERVER_HOST        = 'deploy.slads.internal'
        DEPLOY_REMOTE_DIR         = '/opt/slads'

        // Test URLs for Selenium Integration
        BASE_URL = 'https://localhost'
        API_URL  = 'https://localhost/api'
    }

    stages {
        // ----------------------------------------------------------------------
        // Stage 1: Checkout Source Code from Version Control
        // ----------------------------------------------------------------------
        stage('Checkout') {
            steps {
                echo '=== Stage 1: Checking out source code from Git ==='
                checkout scm
            }
        }

        // ----------------------------------------------------------------------
        // Stage 2: Install Dependencies for All Microservices
        // ----------------------------------------------------------------------
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo 'Installing Node.js dependencies for /backend...'
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo 'Installing Node.js dependencies for /frontend...'
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('ML Service Dependencies') {
                    steps {
                        echo 'Setting up Python virtual environment and dependencies for /ml-service...'
                        dir('ml-service') {
                            sh '''
                                python3 -m venv venv
                                . venv/bin/activate
                                pip install --upgrade pip
                                pip install -r requirements.txt pytest pytest-cov
                            '''
                        }
                    }
                }
            }
        }

        // ----------------------------------------------------------------------
        // Stage 3: Static Analysis and Code Linting
        // ----------------------------------------------------------------------
        stage('Lint & Code Quality') {
            parallel {
                stage('Backend Syntax & Validation') {
                    steps {
                        echo 'Validating backend JavaScript syntax...'
                        dir('backend') {
                            sh 'node -c src/server.js src/app.js'
                        }
                    }
                }
                stage('ML Service Code Quality') {
                    steps {
                        echo 'Validating Python ML service modules...'
                        dir('ml-service') {
                            sh '''
                                . venv/bin/activate
                                python -m py_compile app/main.py app/features.py app/model.py app/schemas.py app/config.py
                            '''
                        }
                    }
                }
                stage('Frontend Build Verification') {
                    steps {
                        echo 'Verifying React Vite bundling build...'
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        // ----------------------------------------------------------------------
        // Stage 4: Automated Unit & Integration Testing
        // ----------------------------------------------------------------------
        stage('Unit & Integration Tests') {
            parallel {
                stage('Backend Tests (Jest & Supertest)') {
                    steps {
                        echo 'Executing backend test suite with in-memory MongoDB...'
                        dir('backend') {
                            sh 'npm run test:coverage'
                        }
                    }
                }
                stage('ML Service Tests (Pytest)') {
                    steps {
                        echo 'Executing ML service pytest suite...'
                        dir('ml-service') {
                            sh '''
                                . venv/bin/activate
                                pytest -v --tb=short
                            '''
                        }
                    }
                }
            }
        }

        // ----------------------------------------------------------------------
        // Stage 5: Build Docker Container Images
        // ----------------------------------------------------------------------
        stage('Build Docker Images') {
            steps {
                echo '=== Stage 5: Building container images ==='
                sh """
                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend
                    docker build -t ${ML_SERVICE_IMAGE}:${IMAGE_TAG} -t ${ML_SERVICE_IMAGE}:latest ./ml-service
                    docker build --build-arg VITE_API_URL=https://localhost/api -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend
                """
            }
        }

        // ----------------------------------------------------------------------
        // Stage 6: Selenium End-to-End Tests against Compose Stack
        // ----------------------------------------------------------------------
        stage('Selenium E2E Tests') {
            steps {
                echo '=== Stage 6: Running Selenium E2E UI Tests against docker-compose Stack ==='
                sh '''
                    # Ensure SSL certificates exist for Nginx
                    if [ ! -f nginx/certs/selfsigned.crt ]; then
                        chmod +x nginx/generate-certs.sh
                        ./nginx/generate-certs.sh
                    fi

                    # Spin up the container stack
                    docker-compose up -d

                    # Wait for services to become healthy
                    echo "Waiting for services to pass health checks..."
                    sleep 15

                    # Execute Selenium headless Chrome test suite
                    cd tests/selenium
                    python3 -m venv venv_selenium
                    . venv_selenium/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                    
                    pytest test_ui.py -v --tb=short || {
                        echo "Selenium tests failed!"
                        cd ../..
                        docker-compose logs --tail=100
                        docker-compose down -v
                        exit 1
                    }

                    cd ../..
                    docker-compose down -v
                '''
            }
        }

        // ----------------------------------------------------------------------
        // Stage 7: Push Docker Images to Docker Hub Registry
        // ----------------------------------------------------------------------
        stage('Push Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo '=== Stage 7: Authenticating and pushing images to Docker Hub ==='
                withCredentials([usernamePassword(credentialsId: DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${ML_SERVICE_IMAGE}:${IMAGE_TAG}
                        docker push ${ML_SERVICE_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                        docker logout
                    """
                }
            }
        }

        // ----------------------------------------------------------------------
        // Stage 8: Production Deployment (SSH + docker-compose Pull & Up)
        // ----------------------------------------------------------------------
        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo '=== Stage 8: Deploying to Production via SSH ==='
                sshagent([DEPLOY_SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_HOST} '
                            set -e
                            cd ${DEPLOY_REMOTE_DIR}
                            docker-compose pull
                            docker-compose up -d --remove-orphans
                            docker image prune -af --filter "until=72h"
                            echo "Deployment completed successfully."
                        '
                    """
                }
            }
        }
    }

    // --------------------------------------------------------------------------
    // Post-Execution Pipeline Notifications and Cleanup
    // --------------------------------------------------------------------------
    post {
        success {
            echo "Pipeline SUCCESS: Build #${env.BUILD_NUMBER} (${env.JOB_NAME}) completed without errors."
        }
        failure {
            echo "Pipeline FAILURE: Build #${env.BUILD_NUMBER} (${env.JOB_NAME}) failed. Check console log for details."
        }
        always {
            echo "Cleaning up workspace and stopped containers..."
            sh 'docker-compose down -v --remove-orphans || true'
            cleanWs()
        }
    }
}
