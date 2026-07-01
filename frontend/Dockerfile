
# Using Node 20 Alpine (lightweight and stable for modern React/Vite)
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to cache dependencies
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy all the rest of your frontend code into the container
COPY . .

# Run the Vite build script (creates the optimized /dist folder)
RUN npm run build


FROM nginx:alpine

# Copy the custom Nginx configuration we just made
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled React files from Stage 1 into Nginx's serving directory
COPY --from=builder /extension/ui /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]