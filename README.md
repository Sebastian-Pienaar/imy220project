# IMY 220 Project - Docker Commands

## Prerequisites
need Docker

## 1. Build  Docker image

docker build -t bugbox-app .


## 2. Run the Docker Container

docker run -d -p 3000:3000 -p 8000:8000 --name bugbox-container bugbox-app


## 3. Accessing the Application

- **Frontend (React App):** Open a web browser and go to http://localhost:3000
- **Backend (API Server):** The frontend will automatically make requests to http://localhost:8000/api/...


## 4. Stop and remove container

To stop the running container:
docker stop bugbox-container

To remove the stopped container:
docker rm bugbox-container