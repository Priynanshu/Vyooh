# Vyooh — Full-Stack OTT Video Streaming Platform

A production-grade Netflix/Prime Video-style streaming platform built from scratch. Features end-to-end video pipeline (upload → transcode → adaptive stream), AI-powered recommendations, JWT authentication, and a custom HLS proxy for private storage.

> **Live Demo:** [vyooh.vercel.app](https://vyooh.vercel.app) &nbsp;|&nbsp; **Backend:** [vyooh-api.render.com](https://vyooh-api.render.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux Toolkit, TailwindCSS, Framer Motion, HLS.js |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Queue | BullMQ + Redis (Upstash) |
| Storage | Backblaze B2 (S3-compatible) |
| Video | FFmpeg (HLS transcoding — 480p, 720p) |
| AI | Google Gemini 2.0 Flash |
| Auth | JWT (httpOnly cookies, access + refresh token rotation) |
| DevOps | Docker |

---

## Architecture

```
Browser
  │
  ├── Upload flow
  │   Browser → Express (multipart) → Backblaze B2 (raw file)
  │         → BullMQ job queued → Worker: FFmpeg transcode
  │         → HLS segments (480p/720p) → B2 (processed/)
  │
  └── Playback flow
      Browser → Express proxy route → B2 (private HLS segments)
      hls.js parses m3u8 → adaptive quality switching
```

**Why this architecture:**
- Browser never hits B2 directly for playback (private bucket — all traffic proxied through Express)
- Transcoding runs in a separate worker process so API server stays responsive during heavy FFmpeg jobs
- BullMQ ensures jobs survive server restarts — no video gets lost mid-transcode

---

## Features

**User Side**
- Browse, search, and filter movies/web series by genre and type
- HLS adaptive streaming with manual quality switching (480p / 720p)
- AI-powered "For You" recommendations based on personal watch history (Gemini 2.0 Flash)
- Watch history with resume progress (auto-saved every 30 seconds)
- YouTube video embed support (admin adds YouTube link, users watch in built-in player)

**Admin Panel**
- Upload videos directly (multipart → B2 → FFmpeg transcoding pipeline)
- Add YouTube videos by URL (metadata auto-extracted via oEmbed)
- Real-time transcoding status polling
- Manage and delete content

**Auth**
- Register / Login with JWT
- httpOnly cookie-based access token (15 min) + refresh token (7 days)
- Auto token refresh via Axios interceptor (seamless for users)
- Role-based access control (admin / user)

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas URI
- FFmpeg installed (`ffmpeg -version` should work)
- Backblaze B2 account (free tier, no card)
- Upstash Redis account (free tier, no card)
- Google AI Studio API key (free, no card)

### 1. Clone & Install

```bash
git clone https://github.com/Priynanshu/vyooh.git
cd vyooh

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Variables

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/vyooh

# JWT
ACCESS_TOKEN_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Backblaze B2
B2_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_app_key
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005
B2_BUCKET_NAME=your_bucket_name

# Upstash Redis
REDIS_URL=rediss://default:xxxx@xxxx.upstash.io:6379

# Gemini AI
GEMINI_API_KEY=your_gemini_key

# Frontend
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Run

```bash
# Terminal 1 — API server
cd backend && npm run dev

# Terminal 2 — Transcoding worker (separate process)
cd backend && npm run worker

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173`

### 4. Docker (optional)

```bash
docker-compose up --build
```

---

## Project Structure

```
vyooh/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, S3 client
│   │   ├── controllers/     # auth, video, upload, watchHistory, recommendation
│   │   ├── middlewares/     # JWT auth, admin role check, error handler
│   │   ├── models/          # User, Video, WatchHistory
│   │   ├── queues/          # BullMQ transcode queue (producer)
│   │   ├── routes/          # Express route files
│   │   ├── services/        # storage (B2), scraper (YouTube), recommendation (Gemini)
│   │   └── workers/         # FFmpeg transcoding worker (consumer)
│   ├── server.js            # Express app entry
│   └── worker.js            # Worker process entry
│
└── frontend/
    └── src/
        ├── app/             # Redux store
        ├── components/      # Shared UI — Navbar, Footer, VideoPlayer
        ├── features/        # auth, video, watchHistory, recommendations, admin
        ├── pages/           # Home, Browse, Search, Watch, Profile, Admin
        └── services/        # Axios instance with interceptors
```

---

## Key Technical Decisions

**Private B2 bucket + Express proxy** — Videos never served from public URLs. Every HLS segment request goes through `/api/video/:id/hls/*` where the backend fetches from B2 and streams to the client. Prevents hotlinking and unauthorized access.

**Separate worker process** — FFmpeg transcoding is CPU-heavy. Running it in the main Express process would block the event loop. Worker runs as a completely separate Node.js process, communicating only through Redis (BullMQ). If the API server restarts, in-progress transcoding jobs resume automatically.

**HLS over MP4** — Could serve single MP4 files, but HLS allows quality switching mid-playback and more efficient buffering. Each video is split into 10-second segments — users start watching in seconds rather than waiting for the full file.

**Redis caching for recommendations** — Gemini API has rate limits. Recommendations are cached per-user for 30 minutes. Cache is invalidated when new videos are added to the platform.

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, set cookies |
| POST | `/api/auth/logout` | User | Clear cookies |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/video/videos` | User | List all videos (cached) |
| GET | `/api/video/:id` | User | Video detail |
| GET | `/api/video/:id/stream` | User | Get HLS master URL |
| GET | `/api/video/:id/hls/*` | User | HLS proxy (segments) |
| POST | `/api/upload/direct` | Admin | Upload video file |
| POST | `/api/upload/upload-ytvideo` | Admin | Add YouTube video |
| GET | `/api/video/:id/status` | User | Transcoding status |
| POST | `/api/watchistory/save` | User | Save watch progress |
| GET | `/api/watchistory/history` | User | Get watch history |
| GET | `/api/watchistory/continue` | User | Continue watching list |
| GET | `/api/recommendations` | User | AI recommendations |

---

## Screenshots

> Add screenshots here after deployment — home page, video player, admin upload panel, recommendations page.

---

## License

MIT