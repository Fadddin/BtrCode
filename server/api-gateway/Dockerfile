# Dockerfile

# Step 1: Build
FROM node:18 AS build
WORKDIR /app

# Install dependencies, including TypeScript
COPY package*.json ./
RUN npm install && npm install -g typescript  # Ensures tsc is available
COPY . .
RUN npm run build

# Step 2: Run
FROM node:18
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY package*.json ./
RUN npm install --only=production
CMD ["node", "dist/index.js"]
