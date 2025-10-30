# Docker commands


## Build and start (first time or after code changes)
docker-compose up --build

## Start without rebuilding (if no code changes)
docker-compose up

## Stop the application
docker-compose down

## Visit
 http://localhost:8000

 # manual setup


# Install all dependencies
 npm install

# Terminal 1 - Start the backend server
npm run dev:server

# Terminal 2 - Start the frontend dev server  
npm start

# Frontend will be available at http://localhost:3000