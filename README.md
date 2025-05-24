# Microservices Blog Platform

A secure, containerized microservices-based blog platform with the following services:

## Services

1. **Auth Service (Port 3001)**

   - User registration and login
   - JWT token generation and validation
   - User credential management

2. **Blog Service (Port 3002)**

   - CRUD operations for blogs
   - Author-only blog management
   - JWT-protected endpoints

3. **Comment Service (Port 3003)**

   - Comment creation and management
   - Public comment viewing
   - JWT-protected endpoints

4. **Profile Service (Port 3004)**

   - User profile management
   - Profile viewing
   - JWT-protected endpoints

5. **API Gateway (Port 3000)**
   - Single entry point for all services
   - Request routing
   - JWT verification

## Setup

1. Install dependencies:

   ```bash
   cd services/auth-service && npm install
   cd ../blog-service && npm install
   cd ../comment-service && npm install
   cd ../profile-service && npm install
   cd ../api-gateway && npm install
   ```

2. Create `.env` files for each service with the following variables:

   Auth Service:

   ```
   PORT=3001
   MONGO_URI=mongodb://localhost:27017/auth-service
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   ```

   Blog Service:

   ```
   PORT=3002
   MONGO_URI=mongodb://localhost:27017/blog-service
   AUTH_SERVICE_URL=http://localhost:3001
   ```

   Comment Service:

   ```
   PORT=3003
   MONGO_URI=mongodb://localhost:27017/comment-service
   AUTH_SERVICE_URL=http://localhost:3001
   BLOG_SERVICE_URL=http://localhost:3002
   ```

   Profile Service:

   ```
   PORT=3004
   MONGO_URI=mongodb://localhost:27017/profile-service
   AUTH_SERVICE_URL=http://localhost:3001
   ```

   API Gateway:

   ```
   PORT=3000
   AUTH_SERVICE_URL=http://localhost:3001
   BLOG_SERVICE_URL=http://localhost:3002
   COMMENT_SERVICE_URL=http://localhost:3003
   PROFILE_SERVICE_URL=http://localhost:3004
   ```

3. Start MongoDB:

   ```bash
   mongod
   ```

4. Start services:

   ```bash
   # Start Auth Service
   cd services/auth-service && npm start

   # Start Blog Service
   cd services/blog-service && npm start

   # Start Comment Service
   cd services/comment-service && npm start

   # Start Profile Service
   cd services/profile-service && npm start

   # Start API Gateway
   cd services/api-gateway && npm start
   ```

## Docker Deployment

1. Build and start all services:

   ```bash
   docker-compose up --build
   ```

2. Stop all services:
   ```bash
   docker-compose down
   ```

## API Endpoints

### Auth Service

- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- POST /api/auth/verify - Verify JWT token

### Blog Service

- GET /api/blogs - Get all blogs
- GET /api/blogs/:id - Get single blog
- POST /api/blogs - Create blog (protected)
- PUT /api/blogs/:id - Update blog (protected)
- DELETE /api/blogs/:id - Delete blog (protected)

### Comment Service

- GET /api/comments/blog/:blogId - Get comments for blog
- POST /api/comments - Create comment (protected)
- PUT /api/comments/:id - Update comment (protected)
- DELETE /api/comments/:id - Delete comment (protected)

### Profile Service

- GET /api/profiles/me - Get current user's profile (protected)
- POST /api/profiles - Create/update profile (protected)
- GET /api/profiles/user/:userId - Get user profile
- DELETE /api/profiles - Delete profile (protected)

## Security Features

1. JWT-based authentication
2. Password hashing
3. Input validation and sanitization
4. Author-only access control
5. Environment variable configuration
6. CORS enabled
7. Error handling
8. Request rate limiting (via API Gateway)

## Development

To run services in development mode with hot reloading:

```bash
npm run dev
```
