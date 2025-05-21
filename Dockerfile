# Step 1: Build the Angular app
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN npm ci && npm run build

# Step 2: Serve the built app using nginx
FROM nginx:stable-alpine

# Copy the built app to nginx's html directory
COPY --from=builder /app/dist/* /usr/share/nginx/html

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port nginx listens on
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

