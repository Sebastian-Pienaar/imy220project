
# Alpine= lightweight
FROM node:18-alpine

WORKDIR /app


COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 8000

# 7. The command to run when the container starts.
# This is a shell command that does two things:
#`npm run server &`: Starts the backend server in the background
# `npm start`: Starts the React development server in the foreground. This keeps the container running.
CMD ["sh", "-c", "npm run server & npm start"]