# LinkMark Backend Architecture Options

## Overview

This document outlines several backend architecture options for the LinkMark bookmark management system. Choose the option that best fits your requirements, budget, and technical expertise.

## Option 1: Node.js + Express + MongoDB (Recommended for Beginners)

### Architecture
```
Chrome Extension → Express.js API → MongoDB → Cloud Storage
```

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (cloud) or local MongoDB
- **Authentication**: JWT + Google OAuth verification
- **Hosting**: Heroku, Railway, or DigitalOcean

### Implementation

#### 1. Project Setup
```bash
mkdir linkmark-backend
cd linkmark-backend
npm init -y
npm install express mongoose cors helmet morgan jsonwebtoken google-auth-library dotenv
npm install -D nodemon
```

#### 2. Basic Server Structure
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 3. Database Models
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

// models/Bookmark.js
const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  notes: String,
  favicon: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookmarkSchema.index({ userId: 1, category: 1 });
bookmarkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
```

#### 4. Authentication Route
```javascript
// routes/auth.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Find or create user
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
      await user.save();
    }
    
    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token: jwtToken, user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
```

#### 5. Bookmark Routes
```javascript
// routes/bookmarks.js
const express = require('express');
const Bookmark = require('../models/Bookmark');
const auth = require('../middleware/auth');

const router = express.Router();

// Create bookmark
router.post('/', auth, async (req, res) => {
  try {
    const bookmark = new Bookmark({
      ...req.body,
      userId: req.userId
    });
    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user bookmarks
router.get('/', auth, async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const filter = { userId: req.userId };
    if (category) filter.category = category;
    
    const bookmarks = await Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create linkmark-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id

# Deploy
git push heroku main
```

---

## Option 2: Python + FastAPI + PostgreSQL (Recommended for Python Developers)

### Tech Stack
- **Language**: Python 3.8+
- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Authentication**: JWT + Google OAuth
- **Hosting**: Railway, Heroku, or DigitalOcean

### Implementation

#### 1. Project Setup
```bash
mkdir linkmark-backend
cd linkmark-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic python-jose[cryptography] google-auth python-multipart
```

#### 2. Basic FastAPI App
```python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud, auth
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LinkMark API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/auth/google")
async def google_auth(token_data: schemas.GoogleToken, db: Session = Depends(get_db)):
    user = await auth.verify_google_token(token_data.token, db)
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.post("/api/bookmarks/", response_model=schemas.Bookmark)
async def create_bookmark(
    bookmark: schemas.BookmarkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.create_bookmark(db=db, bookmark=bookmark, user_id=current_user.id)

@app.get("/api/bookmarks/", response_model=list[schemas.Bookmark])
async def read_bookmarks(
    category: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_bookmarks(db, user_id=current_user.id, category=category, skip=skip, limit=limit)
```

### Deployment (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up
```

---

## Option 3: Serverless (AWS Lambda + DynamoDB)

### Tech Stack
- **Compute**: AWS Lambda
- **Database**: DynamoDB
- **API Gateway**: AWS API Gateway
- **Framework**: Serverless Framework
- **Language**: Node.js or Python

### Benefits
- **Pay-per-use**: Only pay for actual requests
- **Auto-scaling**: Handles traffic spikes automatically
- **No server management**: AWS manages infrastructure

### Implementation with Serverless Framework

#### 1. Project Setup
```bash
npm install -g serverless
serverless create --template aws-nodejs --path linkmark-serverless
cd linkmark-serverless
npm install aws-sdk jsonwebtoken google-auth-library
```

#### 2. serverless.yml Configuration
```yaml
service: linkmark-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    GOOGLE_CLIENT_ID: ${env:GOOGLE_CLIENT_ID}
    JWT_SECRET: ${env:JWT_SECRET}
    DYNAMODB_TABLE: linkmark-bookmarks
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}"

functions:
  auth:
    handler: handler.auth
    events:
      - http:
          path: api/auth/google
          method: post
          cors: true
  
  createBookmark:
    handler: handler.createBookmark
    events:
      - http:
          path: api/bookmarks
          method: post
          cors: true
  
  getBookmarks:
    handler: handler.getBookmarks
    events:
      - http:
          path: api/bookmarks
          method: get
          cors: true

resources:
  Resources:
    BookmarksTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.DYNAMODB_TABLE}
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
          - AttributeName: createdAt
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
          - AttributeName: createdAt
            KeyType: RANGE
        BillingMode: PAY_PER_REQUEST
```

### Deployment
```bash
serverless deploy
```

---

## Option 4: Firebase (Google Cloud)

### Tech Stack
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Functions
- **Storage**: Firebase Storage (for icons/images)

### Benefits
- **Integrated with Google**: Natural fit for Gmail OAuth
- **Real-time**: Firestore provides real-time updates
- **Generous free tier**: Good for getting started

### Implementation

#### 1. Project Setup
```bash
npm install -g firebase-tools
firebase login
firebase init functions
cd functions
npm install google-auth-library
```

#### 2. Functions Implementation
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OAuth2Client } = require('google-auth-library');

admin.initializeApp();
const db = admin.firestore();
const client = new OAuth2Client(functions.config().google.client_id);

exports.saveBookmark = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const { token, bookmark } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: functions.config().google.client_id,
    });
    
    const payload = ticket.getPayload();
    const userId = payload.sub;
    
    // Save bookmark
    const bookmarkData = {
      ...bookmark,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('bookmarks').add(bookmarkData);
    
    res.json({ id: docRef.id, ...bookmarkData });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});
```

### Deployment
```bash
firebase deploy --only functions
```

---

## Option 5: Supabase (Open Source Firebase Alternative)

### Tech Stack
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Auto-generated REST API
- **Real-time**: WebSocket subscriptions

### Benefits
- **Open source**: Can self-host if needed
- **PostgreSQL**: Full SQL capabilities
- **Built-in auth**: Google OAuth integration
- **Auto-generated API**: No backend code needed

### Implementation

#### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Enable Google OAuth in Authentication settings
4. Create tables:

```sql
-- Users table (auto-created by Supabase Auth)

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  favicon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### 2. Chrome Extension Integration
```javascript
// In popup.js, replace the saveBookmarkToBackend method
async saveBookmarkToBackend(bookmarkData) {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([bookmarkData]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase error:', error);
    return false;
  }
}
```

---

## Comparison Matrix

| Feature | Node.js/Express | FastAPI | Serverless | Firebase | Supabase |
|---------|----------------|---------|------------|----------|----------|
| **Setup Complexity** | Medium | Medium | High | Low | Low |
| **Cost (Small Scale)** | $5-10/month | $5-10/month | $0-5/month | $0-5/month | $0-10/month |
| **Scalability** | Good | Good | Excellent | Excellent | Good |
| **Real-time** | Custom | Custom | Complex | Built-in | Built-in |
| **Learning Curve** | Medium | Medium | High | Low | Low |
| **Database Type** | NoSQL/SQL | SQL | NoSQL | NoSQL | SQL |
| **Self-hosting** | Yes | Yes | No | No | Yes |

## Recommendation

**For beginners**: Start with **Supabase** or **Firebase** for rapid development.

**For full control**: Choose **Node.js + Express** or **FastAPI**.

**For scale**: Consider **Serverless** architecture.

**For Python developers**: Go with **FastAPI**.

**For JavaScript developers**: Choose **Node.js + Express**.

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Input Validation**: Validate all inputs on the backend
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Token Expiration**: Use short-lived tokens with refresh mechanism
5. **CORS**: Configure CORS properly for Chrome extension origins
6. **Data Encryption**: Encrypt sensitive data at rest
7. **Audit Logs**: Log important actions for security monitoring

Choose the option that best fits your technical expertise, budget, and long-term plans!
