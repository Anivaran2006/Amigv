# 🚀 Deployment Guide for ExamAlert AI

ExamAlert AI is configured to support **single-service fullstack deployment** (FastAPI serves both the API and the pre-built React landing page/dashboard) as well as **separated frontend/backend deployment**.

---

## 🌟 Option 1: Render.com (Recommended — Free & 1 Click)

With our multi-stage [Dockerfile](file:///c:/Users/aniv8/Desktop/NeverMissAI/Dockerfile) and [render.yaml](file:///c:/Users/aniv8/Desktop/NeverMissAI/render.yaml), you can deploy the entire platform (Frontend + Backend + SQLite + AI) as a **single web service** for free:

### Steps:
1. Push your project code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy ExamAlert AI"
   git push origin main
   ```
2. Log into [Render.com](https://render.com) (sign in with GitHub).
3. Click **"New +"** → **"Web Service"**.
4. Choose your `NeverMissAI` repository.
5. In the configuration:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: `Free`
6. (Optional) Add your environment variables:
   - `GEMINI_API_KEY` (for live Gemini zero-hallucination queries)
   - `TELEGRAM_BOT_TOKEN` (for Telegram notifications)
7. Click **"Create Web Service"**.
8. Render will build the React frontend, launch FastAPI, and give you a live HTTPS public URL:
   `https://examalert-ai.onrender.com`

---

## ⚡ Option 2: Vercel (Frontend) + Render / Railway (Backend)

If you prefer hosting the React frontend on Vercel:

### 1. Deploy the Backend on Render or Railway
- Deploy the `backend/` folder on [Render.com](https://render.com) or [Railway.app](https://railway.app).
- Set root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Copy your public backend URL (e.g. `https://examalert-api.onrender.com`).

### 2. Deploy Frontend on Vercel
- Import repository on [Vercel](https://vercel.com).
- Set root directory: `frontend`
- Add Environment Variable:
  - `VITE_API_URL` = `https://examalert-api.onrender.com/api`
- Click **Deploy**!

---

## 🐳 Option 3: Docker on VPS (DigitalOcean / AWS EC2 / Contabo)

Run the entire application in a single Docker container:

```bash
# 1. Build the unified production container
docker build -t examalert-ai .

# 2. Run the container
docker run -d -p 8000:8000 --name examalert examalert-ai

# 3. Access your live platform at:
http://<your-vps-ip>:8000
```

---

## ⚙️ Environment Variables Reference

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8000` | Port for the web service (automatically assigned on cloud providers) |
| `DATABASE_URL` | `sqlite:///./examalert.db` | SQLite database connection string |
| `JWT_SECRET` | *(auto-generated)* | Key for signing student auth JWT tokens |
| `GEMINI_API_KEY` | *(optional)* | Google Gemini API key for live AI assistant queries |
| `TELEGRAM_BOT_TOKEN` | *(optional)* | Official bot token for sending Telegram notifications |
| `MONITOR_INTERVAL_MINUTES` | `60` | Background scraper crawl frequency |
