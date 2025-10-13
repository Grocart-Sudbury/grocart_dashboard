pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t my-nextjs-app:latest .'
            }
        }

        stage('Stop & Remove Previous Container') {
            steps {
                sh '''
                if [ "$(docker ps -aq -f name=my-nextjs-app)" ]; then
                    echo "Stopping and removing old container..."
                    docker stop my-nextjs-app || true
                    docker rm my-nextjs-app || true
                else
                    echo "No existing container found."
                fi
                '''
            }
        }

        stage('Run New Container') {
            steps {
                sh 'docker run -d -p 3000:3000 --name my-nextjs-app my-nextjs-app:latest'
            }
        }
    }

    post {
        always {
            echo 'Pipeline complete.'
        }
    }
}
