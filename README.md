# 🧠 AI Resume Analyzer

A full-stack AI-powered Resume Analyzer application that evaluates resumes against job descriptions. Features multi-resume processing, embedding-based semantic matching, section-wise scoring, candidate ranking, and detailed AI-generated feedback.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Tech Stack](https://img.shields.io/badge/Express.js-4-green?logo=express)
![Tech Stack](https://img.shields.io/badge/Gemini_AI-2.0-blue?logo=google)
![Tech Stack](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite)

---

## ✨ Features

### Core
- **📄 Resume Upload** — Upload PDF and DOCX resumes (up to 10 at once)
- **🔍 AI Parsing** — Extract structured data (Name, Email, Skills, Experience, Education) using Gemini AI
- **📊 Match Scoring** — Compare resumes against job descriptions with detailed scoring
- **📈 Section-Wise Scoring** — Individual scores for Skills (40%), Experience (35%), and Education (25%)
- **🏆 Candidate Ranking** — Automatically rank multiple candidates with tier badges (Excellent/Good/Fair/Poor)

### Advanced
- **🔗 Embedding-Based Matching** — Semantic similarity using Gemini text-embedding-004
- **💡 AI Feedback** — Strengths, improvements, actionable suggestions, and resume tips
- **🔐 JWT Authentication** — Secure user registration and login
- **⚡ Caching** — In-memory result caching for performance optimization
- **🧬 Basic RAG** — In-memory vector store with document chunking for semantic retrieval
- **📝 Logging** — Winston-based structured logging

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), Vanilla CSS |
| **Backend** | Express.js, Node.js |
| **AI/LLM** | Google Gemini API (gemini-2.0-flash + text-embedding-004) |
| **Database** | SQLite via better-sqlite3 |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **File Parsing** | pdf-parse (PDF) + mammoth (DOCX) |
| **Caching** | node-cache (in-memory, 10-min TTL) |
| **Logging** | Winston |

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18+ installed
- **Google Gemini API Key** — Get one from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the server
npm run dev
```

The backend will start on **http://localhost:5000**.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done by create-next-app)
npm install

# Start the dev server
npm run dev
```

The frontend will start on **http://localhost:3000**.

### 4. Environment Variables

Create `backend/.env` with:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── server.js              # Express entry point
│   │   ├── config/
│   │   │   ├── db.js              # SQLite database
│   │   │   └── cache.js           # In-memory cache
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication
│   │   │   ├── upload.js          # File upload (Multer)
│   │   │   ├── errorHandler.js    # Global error handling
│   │   │   └── logger.js          # Request logging
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # Register, Login, Me
│   │   │   ├── resume.routes.js   # Upload, Analyze, List
│   │   │   └── job.routes.js      # Job description CRUD
│   │   └── services/
│   │       ├── parser.service.js  # PDF/DOCX parsing
│   │       ├── ai.service.js      # Gemini AI analysis
│   │       ├── embedding.service.js # Embedding generation
│   │       ├── scoring.service.js # Section-wise scoring
│   │       ├── ranking.service.js # Candidate ranking
│   │       ├── feedback.service.js # Feedback generation
│   │       └── rag.service.js     # RAG vector store
│   └── uploads/                   # Temporary file storage
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.js          # Root layout
│       │   ├── page.js            # Landing page
│       │   ├── globals.css        # Design system
│       │   ├── login/page.js      # Login
│       │   ├── register/page.js   # Registration
│       │   └── dashboard/page.js  # Main dashboard + results
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── ResumeUploader.js
│       │   ├── ScoreCard.js
│       │   ├── SectionScore.js
│       │   ├── RankingTable.js
│       │   └── FeedbackPanel.js
│       └── lib/
│           ├── api.js             # API client
│           └── auth.js            # Auth context
│
├── sample/
│   └── sample_output.json         # Example API response
└── README.md
```

---

## 🔌 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with credentials |
| GET | `/api/auth/me` | Get current user (requires auth) |

### Resumes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | Upload resume files (multipart) |
| POST | `/api/resumes/analyze` | Analyze resumes against JD |
| GET | `/api/resumes` | List user's resumes |
| GET | `/api/resumes/:id` | Get specific resume |
| POST | `/api/resumes/rag-search` | RAG-based resume search |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create job description |
| GET | `/api/jobs` | List job descriptions |
| GET | `/api/jobs/:id` | Get specific job |
| DELETE | `/api/jobs/:id` | Delete job description |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Registration successful",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Analyze:**
```json
POST /api/resumes/analyze
Authorization: Bearer <token>
{
  "resumeIds": ["resume-id-1", "resume-id-2"],
  "jobDescription": "We are looking for a Senior React Developer..."
}
```

See `sample/sample_output.json` for a complete response example.

---

## 🏗 Architecture

### Analysis Pipeline
1. **Upload** → Files saved to disk via Multer
2. **Parse** → PDF/DOCX → raw text (pdf-parse / mammoth)
3. **Extract** → Gemini AI → structured JSON (name, skills, experience, etc.)
4. **Embed** → text-embedding-004 → vector embeddings
5. **Score** → Section-wise scoring (Skills 40%, Experience 35%, Education 25%)
6. **Compare** → AI-powered JD comparison with detailed analysis
7. **Feedback** → AI-generated strengths, improvements, suggestions
8. **Rank** → Sort candidates by overall score with tier badges
9. **Cache** → Results cached by content hash for 10 minutes

### Scoring Methodology
- **Blended scoring**: 60% AI analysis + 40% embedding similarity
- **Weights**: Skills (40%), Experience (35%), Education (25%)
- **Tiers**: Excellent (80+), Good (60-79), Fair (40-59), Poor (<40)

---

## ⚠️ Assumptions & Limitations

1. **API Key Required**: Requires a valid Google Gemini API key
2. **Text-Based Only**: Cannot parse image-based/scanned PDFs (no OCR)
3. **In-Memory RAG**: Vector store is in-memory, resets on server restart
4. **Rate Limits**: Subject to Gemini API rate limits (especially with multiple resumes)
5. **SQLite**: Single-file database, not suitable for high-concurrency production
6. **File Size**: Maximum 10MB per file, 10 files per upload
7. **No OCR**: Scanned PDFs will not be parsed correctly
8. **English Only**: Optimized for English-language resumes

---

## 📝 License

MIT License
