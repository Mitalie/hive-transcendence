# Uses the official, lightweight Alpine Linux image with Node.js 22 LTS.
FROM node:22-alpine

# Sets the internal working directory.
# All subsequent commands run inside this folder.
WORKDIR /app

# Copies ONLY the package files first.
# This leverages Docker's layer caching so 'npm install' only re-runs if dependencies actually change.
COPY package*.json ./

# Installs all Node dependencies inside the isolated Linux container.
RUN npm install

# NOTE: We DO NOT copy the rest of the source code here (no 'COPY . .').
# The docker-compose.yml handles that via a bind mount to enable instant hot-reloading.

# Documents that the container will listen on port 3000 (Next.js default).
EXPOSE 3000

# Starts the Next.js development server when the container launches.
CMD ["npm", "run", "dev"]
