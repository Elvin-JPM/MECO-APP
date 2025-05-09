# Stage 1: Build Vite app
FROM node:18 as build

ENV TZ=America/Tegucigalpa
RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set npm registry (optional)
RUN npm config set registry https://registry.npmmirror.com

# Clear npm cache
RUN npm cache clean --force

# Install a compatible version of npm
RUN npm install -g npm@9

# Copy package.json and install dependencies
COPY ./Frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY ./Frontend ./


# Copy frontend .env for build-time variables
COPY ./Frontend/.env .

# Build the Vite app
RUN npm run build

# Remove .env from final image
RUN rm .env

# Ensure the build folder exists before proceeding
RUN ls -la /app/dist || (echo "Dist directory not found!" && exit 1)

# Stage 2: Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx HTML files
RUN rm -rf ./*

# Copy built files from the previous stage
COPY --from=build /app/dist ./

# Copy the nginx.conf from the root-level nginx folder
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]