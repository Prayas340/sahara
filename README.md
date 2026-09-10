# Sahara Companion — Elderly Memory Care Platform

**Sahara** is an AI-enhanced elderly memory care and caregiver companion web application designed to support seniors experiencing mild cognitive impairment or dementia, while providing family members and caregivers with real-time health monitoring, routine adherence, cognitive trend analytics, and emergency alerts.

---

## 🌟 Core Features

### 1. Elder Companion Experience
- **1-Minute Timed Mind Game (Familiar Treasures Memory Match)**:
  - 60-second active countdown timer with visual progress bar and color alerts.
  - Fixed **+50 points** per completed game session, sequentially accumulating up to 250 points max.
  - Strict **Daily Cap of 5 Sessions** per calendar date (`YYYY-MM-DD`).
  - Timeout grace handling: incomplete games award 0 points and record timeout status, reducing cognitive score %.
- **Daily Rhythm & Medication Schedule**: Large, accessible tactile UI to review and mark daily medication doses as taken or pending.
- **Emergency SOS & Family Calling**: One-tap emergency dispatch with automated SMS/email alerts and instant contact modal.
- **Voice Synthesis & Multi-Language Support**: High-contrast, tactile UI with bilingual / localized voice guidance (English, Hindi, Bengali).

### 2. Caregiver Intelligence Portal
- **Live Real-Time Firestore Synchronization**: Real-time listeners on `elders/{elderId}/dailyLogs/{YYYY-MM-DD}` for instant updates without page refresh.
- **Patient Game Score & Cognitive Analytics**:
  - Today's points and completed session count badges.
  - Rolling 7-day cumulative total points across daily logs.
  - 7-Day Cognitive Performance Analytics bar chart (scaled to 250 max).
  - Detailed Recent Game Sessions & Score Logs audit trail (session #, time remaining, recall %, points, status).
- **Medication Adherence Tracking**: Real-time adherence rate percentage and full medication timeline.
- **Routine Management**: Ability to add, modify, toggle, and delete daily reminders and medication alerts.
- **Emergency Dispatch History**: Detailed logs of emergency broadcasts, location data, and family contacts.

---

## 🏗️ Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + React 19
- **Alternative SPA Bundle**: Vanilla JS Modular Views (`src/views/*` with `vite.config.js`)
- **Styling**: Tailwind CSS + Custom Tactile Design System (`src/styles/design-tokens.css`, `globals.css`)
- **Database & Cloud Storage**:
  - **Firebase Firestore**: Real-time client listeners and server-side admin persistence.
  - **Firebase Auth / Admin SDK**: Cross-device caregiver-elder profile synchronization.
  - **Local Persistence**: Hybrid fallback via `serverDb.js` and browser `localStorage`.
- **APIs**: Next.js Serverless Route Handlers (`src/app/api/*`)
- **Notifications**: Web3Forms Email & Browser Notifications

---

## 📁 Quick Directory Structure

```
sahara/
├── src/
│   ├── app/                      # Next.js App Router (Primary Web Application)
│   │   ├── api/                  # Serverless API routes (auth, game-scores, reminders, sos, contacts)
│   │   ├── caregiver-dashboard/  # Caregiver portal with Tab navigation & analytics
│   │   ├── caregiver-login/      # Caregiver authentication & elder profile linking
│   │   ├── contacts/             # Elder emergency contacts page
│   │   ├── elder-dashboard/      # Main elder companion tablet UI
│   │   ├── memory-game/          # 1-minute timed memory match game
│   │   ├── layout.jsx            # Root layout with fonts, meta, and dev cleanup
│   │   └── page.jsx              # Landing / onboarding gateway
│   ├── components/               # Shared UI modals, navbar, toast, and sidebars
│   ├── lib/                      # Firebase Client, Firebase Admin, and Server DB adapter
│   ├── services/                 # authService, dataStore (state), supabase/cloud sync
│   ├── styles/                   # Design tokens and global CSS
│   ├── utils/                    # Speech synthesis, i18n, toast, geoData
│   └── views/                    # Vanilla SPA views (mirrors Next.js pages)
├── ARCHITECTURE.md               # Complete architectural specifications and data schemas
├── package.json                  # Dependencies and scripts
└── next.config.mjs               # Next.js build configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.18.0
- npm or yarn

### 2. Environment Configuration
Create a `.env` (or `.env.local`) file in the root directory:
```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAh1QO_gsGLOmMFFHROIck4BF8Krv8kJAk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sahara-63072.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sahara-63072
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sahara-63072.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=887187131198
NEXT_PUBLIC_FIREBASE_APP_ID=1:887187131198:web:3f46345f06153ea1cbba6f

# Firebase Admin Service Account
FIREBASE_PROJECT_ID=sahara-63072
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sahara-63072.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=c05188fc7b424829ff83fb48462c8a955c480402
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Installation & Running Locally
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start
```
Visit `http://localhost:3000` to interact with the application.

---

## 📖 Complete Architecture Guide
For full details on data models, Firestore paths, authentication lifecycle, and synchronization rules, see [ARCHITECTURE.md](./ARCHITECTURE.md).
