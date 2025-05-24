#!/bin/bash

# Function to create .env file
create_env_file() {
    local service=$1
    local port=$2
    local mongo_db=$3
    local env_file="services/$service/.env"
    
    echo "PORT=$port" > $env_file
    echo "MONGO_URI=mongodb://localhost:27017/$mongo_db" >> $env_file
    
    if [ "$service" = "auth-service" ]; then
        echo "JWT_SECRET=your_jwt_secret_key" >> $env_file
        echo "JWT_EXPIRES_IN=24h" >> $env_file
    fi
    
    if [ "$service" != "auth-service" ]; then
        echo "AUTH_SERVICE_URL=http://localhost:3001" >> $env_file
    fi
    
    if [ "$service" = "blog-service" ]; then
        echo "BLOG_SERVICE_URL=http://localhost:3002" >> $env_file
    fi
    
    if [ "$service" = "comment-service" ]; then
        echo "BLOG_SERVICE_URL=http://localhost:3002" >> $env_file
    fi
}

# Create .env files for each service
create_env_file "auth-service" "3001" "auth-service"
create_env_file "blog-service" "3002" "blog-service"
create_env_file "comment-service" "3003" "comment-service"
create_env_file "profile-service" "3004" "profile-service"
create_env_file "api-gateway" "3000" "api-gateway"

# Install dependencies for each service
for service in auth-service blog-service comment-service profile-service api-gateway; do
    echo "Installing dependencies for $service..."
    cd services/$service
    npm install
    cd ../..
done

# Start each service in a new terminal window
echo "Starting services..."
osascript -e 'tell application "Terminal" to do script "cd '$PWD'/services/auth-service && npm run dev"'
osascript -e 'tell application "Terminal" to do script "cd '$PWD'/services/blog-service && npm run dev"'
osascript -e 'tell application "Terminal" to do script "cd '$PWD'/services/comment-service && npm run dev"'
osascript -e 'tell application "Terminal" to do script "cd '$PWD'/services/profile-service && npm run dev"'
osascript -e 'tell application "Terminal" to do script "cd '$PWD'/services/api-gateway && npm run dev"'

echo "All services have been started in separate terminal windows."
echo "Make sure MongoDB is running locally on port 27017" 