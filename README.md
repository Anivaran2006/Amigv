# ExamAlert AI — AI-Powered Competitive Exam Notification Assistant

> **"Never Miss an Exam Deadline."**

ExamAlert AI is a production-quality notification platform for students preparing for competitive and entrance exams such as **JEE Main, JEE Advanced, NEET UG, GATE, CAT, SSC CGL, UPSC Civil Services, and CUET UG**.

The platform continuously monitors **official exam websites**, detects authentic updates via **content-hash change detection**, uses AI to classify notices and extract deadlines, and sends personalized alerts to subscribed students through **Telegram and Email**.

---

## 🌟 Core Features

1. **Strict Official-Source Prioritization**:
   - Zero hallucination guarantee: ExamAlert AI never fabricates or guesses exam dates, eligibility criteria, or fees.
   - Every notification and timeline stage includes a direct link to the verified official portal (NTA, IIT, IIM, SSC, UPSC).

2. **Automated Background Web Monitoring**:
   - Modular scraper architecture (`BaseScraper` with `NTAScraper`, `GATEScraper`, `CATScraper`, `SSCScraper`).
   - Configurable check intervals using `APScheduler`.

3. **Content-Hash Change Detection**:
   - Normalizes text and generates SHA-256 content hashes.
   - Prevents duplicate alerts and only triggers AI analysis when genuine changes occur.

4. **AI Notice Analysis**:
   - Categorizes updates (`REGISTRATION_OPEN`, `APPLICATION_CORRECTION`, `ADMIT_CARD`, `EXAM_DATE`, `ANSWER_KEY`, `RESULT`, `COUNSELLING`, `IMPORTANT_NOTICE`).
   - Extracts structured JSON: dates, actions, fees, importance rating.

5. **Multi-Channel Personalized Alerts**:
   - **Telegram Bot API**: Instant mobile push broadcast with markdown formatting.
   - **Responsive HTML Email**: Professional bulletins for welcome, subscription confirmation, exam updates, and deadline reminders.

6. **Automatic Deadline Countdown & Reminders**:
   - Automated 7-day, 3-day, and 1-day urgency reminders for registered deadlines.

7. **Student Dashboard & AI Exam Timeline**:
   - At-a-glance metrics: Subscribed Exams, Active Deadlines, Recent Alerts.
   - Visual timeline mapping stages: Registration Open $\rightarrow$ Deadline $\rightarrow$ Correction $\rightarrow$ Admit Card $\rightarrow$ Exam $\rightarrow$ Result (clearly labeled *Officially Announced* vs *Not Announced Yet*).

8. **"What Should I Do?" AI Assistant**:
   - In-app chatbot answering student queries strictly using stored official notices and deadlines.

9. **🧪 Hackathon Demo Simulator Mode**:
   - Allows judges and evaluators to trigger simulated official notices (JEE Main Registration, GATE Correction, CAT Admit Card, SSC CGL Schedule).
   - Visualizes the full 5-step pipeline execution in real time: Scraper $\rightarrow$ Change Detection $\rightarrow$ AI Extraction $\rightarrow$ Duplicate Verification $\rightarrow$ Telegram & Email Alert $\rightarrow$ Dashboard Live Sync!

---

## 🏗️ Architecture & Technology Stack

```
ExamAlert AI
├── backend/ (Python 3.14 + FastAPI + SQLAlchemy)
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/ (User, Exam, Subscription, Source, Notice, Deadline, NotificationLog)
│   │   ├── schemas/ (Pydantic models)
│   │   ├── routers/ (auth, exams, subscriptions, deadlines, notifications, ai_assistant, demo)
│   │   ├── services/
│   │   │   ├── scraper_service.py (BaseScraper + NTAScraper, GATEScraper, CATScraper, SSCScraper)
│   │   │   ├── change_detector.py (SHA-256 content hash engine)
│   │   │   ├── ai_analyzer.py (Dual OpenAI & deterministic zero-hallucination parser)
│   │   │   ├── telegram_service.py (Telegram Bot API wrapper)
│   │   │   ├── email_service.py (HTML email templates generator)
│   │   │   ├── scheduler.py (APScheduler background monitoring)
│   │   │   └── seed_data.py (Seed data with real competitive exams)
│   │   └── ...
│   ├── requirements.txt
│   └── .env.example
├── frontend/ (React 18 + Vite + Tailwind CSS + Lucide Icons)
│   ├── src/
│   │   ├── components/ (Navbar, ExamTimeline, AIAssistantDrawer, DemoSimulatorModal, NotificationModal)
│   │   ├── pages/ (LandingPage, DashboardPage, ExamCataloguePage, ExamDetailPage, NotificationsPage, SettingsPage, AuthModal)
│   │   ├── services/ (api.ts)
│   │   └── types/ (index.ts)
│   └── package.json
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### 1. Backend Setup

```bash
cd backend

# (Optional) Create virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will start at `http://127.0.0.1:8000`.
- Swagger API Docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## ⚡ Hackathon Judging Demo Guide

1. Open `http://localhost:5173` in your browser.
2. Click **Get Started Free** or **Log In** $\rightarrow$ Click **"⚡ 1-Click Demo Login (Anivaran Sharma)"**.
3. You will enter the **Student Dashboard** preloaded with active subscriptions to JEE Main, GATE, and CAT.
4. Click the prominent orange button **"🧪 Simulate Exam Update"** in the top navigation or dashboard hero.
5. Select a preset (e.g. *JEE Main Session 1 Online Application Form Live* or *GATE Correction Window*).
6. Click **"Execute Live Monitoring Pipeline"** and watch the real-time 5-stage progress visualizer:
   - Scraper detects website update
   - Content hash differs
   - AI classifies event & extracts registration dates without hallucination
   - Duplicate prevention check succeeds
   - Telegram & Email alerts are dispatched!
7. Close the modal: notice the new active deadline, updated exam cards, and the real-time alert in the notifications feed!
8. Click on any alert to open the **Telegram Message Preview** or **HTML Email Preview**.
9. Click **"Ask AI Assistant"** to test the "What Should I Do?" chatbot with questions like *"When is my JEE deadline?"* or *"What documents do I need?"*.
