# Backend API Documentation

This is a Node.js Express backend API that provides user authentication and content management with AI-powered search capabilities using RAG (Retrieval-Augmented Generation).

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **AI/Search**: Pinecone vector database for semantic search
- **CORS**: Enabled for cross-origin requests

## 📁 Project Structure

```
backend/
├── server.js          # Main server file
├── userRoutes.js      # User and content routes
├── auth.js           # JWT authentication middleware
├── db.js             # Database models
├── searching.js      # AI search and RAG functionality
├── package.json      # Dependencies
└── README.md         # This file
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
MONGO_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-secret-key
PORT=3000
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=your-index-name
TOPK_DEFAULT=5
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000/api/user
```

### Authentication Routes

#### 1. User Signup
- **POST** `/signup`
- **Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "userId": "user-id-string"
  }
  ```

#### 2. User Signin
- **POST** `/signin`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt-token-string"
  }
  ```

### Content Management Routes (Protected)

All content routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### 3. Add Content
- **POST** `/content`
- **Body**:
  ```json
  {
    "userId": "user-id",
    "title": "string",
    "text": "content-text",
    "tags": ["tag1", "tag2"],
    "link": "optional-url"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "docId": "document-id",
    "chunks": 5
  }
  ```

#### 4. Search Content
- **POST** `/search`
- **Body**:
  ```json
  {
    "userId": "user-id",
    "q": "search-query"
  }
  ```
- **Query Params**:
  - `topK`: Number of results (default: 5)
- **Response**:
  ```json
  {
    "matches": [...],
    "previewContext": "relevant-text",
    "sources": [...]
  }
  ```

#### 5. Ask AI Question (RAG)
- **POST** `/ask`
- **Body**:
  ```json
  {
    "userId": "user-id",
    "query": "your-question",
    "topK": 5
  }
  ```
- **Response**:
  ```json
  {
    "answer": "AI-generated answer based on your content",
    "sources": [...]
  }
  ```

#### 6. Delete Content
- **DELETE** `/content/:id`
- **Params**: `id` - MongoDB document ID
- **Response**:
  ```json
  {
    "success": true
  }
  ```

#### 7. Health Check
- **GET** `/health`
- **Headers**: Authorization token required
- **Response**:
  ```json
  {
    "ok": true
  }
  ```

## 🔐 Authentication Flow

1. **Signup**: Create new user account
2. **Signin**: Get JWT token
3. **Use Token**: Include token in Authorization header for protected routes
4. **Token Format**: `Bearer <jwt-token>`

## 🧠 AI Features

### RAG (Retrieval-Augmented Generation)
- **Semantic Search**: Uses Pinecone vector database for similarity search
- **Context Retrieval**: Finds relevant content chunks based on user queries
- **AI Answers**: Generates responses using retrieved context
- **Source Attribution**: Returns sources used for each answer

### Content Processing
- **Chunking**: Breaks content into smaller pieces for better search
- **Vector Embeddings**: Converts text to vectors for semantic search
- **Tag System**: Organize content with custom tags

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**:
   ```bash
   mongod
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Test the API**:
   ```bash
   # Health check
   curl http://localhost:3000/health

   # Signup
   curl -X POST http://localhost:3000/api/user/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@example.com","password":"password123"}'
   ```

## 📝 Example Usage

### Complete Flow Example

1. **Sign up**:
```bash
curl -X POST http://localhost:3000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"securepass"}'
```

2. **Sign in**:
```bash
curl -X POST http://localhost:3000/api/user/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"securepass"}'
```

3. **Add content**:
```bash
curl -X POST http://localhost:3000/api/user/content \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "title": "My Notes",
    "text": "This is my important note content...",
    "tags": ["personal", "important"]
  }'
```

4. **Search content**:
```bash
curl -X POST http://localhost:3000/api/user/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "q": "important notes"}'
```

5. **Ask AI**:
```bash
curl -X POST http://localhost:3000/api/user/ask \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "query": "What are my important notes about?"}'
```

## 🐛 Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "error_code",
  "details": "Human-readable error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing parameters)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (invalid token)
- `404`: Not Found
- `500`: Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

