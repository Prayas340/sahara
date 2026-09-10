# Sahara Companion Architecture & System Blueprint

> **CRITICAL REFERENCE DOCUMENT**  
> This document defines the authoritative architecture, data schemas, synchronization rules, and project conventions for the Sahara Companion platform. Any AI agent or developer modifying this repository MUST strictly follow the specifications outlined here to prevent hallucinations or regression.

---

## 1. Dual-Architecture Overview

The codebase maintains a dual-structure architecture:
1. **Primary Production Framework**: **Next.js 15 (App Router)** located in `src/app/` using React 19 JSX components and Serverless Route Handlers in `src/app/api/`. This is the application executed by `npm run dev` / `npm run build` and deployed to production.
2. **Vanilla Modular Views**: Located in `src/views/` and `src/main.js` paired with `vite.config.js`. These standalone views mirror the Next.js routes.
3. **Synchronization Rule**: When making logic, styling, or scoring updates, ensure both `src/app/*` (Next.js) and `src/views/*` (SPA) remain aligned.

---

## 2. Full Directory & File Structure

```
sahara/
├── src/
│   ├── app/                                # NEXT.JS APP ROUTER
│   │   ├── api/                            # Serverless API endpoints
│   │   │   ├── auth/
│   │   │   │   ├── caregiver-login/route.js# Caregiver auth & password verification
│   │   │   │   ├── elder-check/route.js    # Verifies elder phone/identifier
│   │   │   │   ├── elder-save/route.js     # Saves elder profile to cloud/local store
│   │   │   │   └── sync/route.js           # Bidirectional sync between caregiver & elder
│   │   │   ├── contacts/route.js           # GET, POST emergency contacts
│   │   │   ├── game-scores/route.js        # GET, POST, DELETE game sessions & analytics
│   │   │   ├── reminders/route.js          # GET, POST, PATCH, DELETE medicines & reminders
│   │   │   ├── report/route.js             # Generates cognitive/wellness care report
│   │   │   └── sos/route.js                # Emergency broadcast dispatch
│   │   ├── caregiver-dashboard/page.jsx    # Caregiver portal (Overview, Game Score, Routine, Contacts)
│   │   ├── caregiver-login/page.jsx        # Caregiver authentication & profile link
│   │   ├── contacts/page.jsx               # Elder emergency contacts page
│   │   ├── elder-dashboard/page.jsx        # Main elder dashboard tablet screen
│   │   ├── memory-game/page.jsx            # 1-minute timed memory match game
│   │   ├── globals.css                     # Tailwind utilities, Google Fonts & theme tokens
│   │   ├── layout.jsx                      # Root layout wrapper with fonts & DevBadgeRemover
│   │   ├── not-found.jsx                   # Custom 404 page
│   │   └── page.jsx                        # Entry landing page / role selector
│   │
│   ├── components/                         # SHARED REACT / DOM COMPONENTS
│   │   ├── AddReminderModal.jsx            # Add new reminder modal (React)
│   │   ├── CaregiverSidebar.jsx            # Desktop sidebar for caregiver portal
│   │   ├── ContactModal.jsx                # Elder contact details / calling modal
│   │   ├── DevBadgeRemover.jsx             # Cleans up dev badges in production
│   │   ├── Navbar.jsx / Navbar.js          # Universal navigation bar (Next.js & Vanilla)
│   │   ├── SendSafeMessageModal.jsx        # Quick check-in safe message modal
│   │   ├── SupabaseConfigModal.jsx         # Cloud database config fallback modal
│   │   └── Toast.jsx                       # Toast notification system
│   │
│   ├── lib/                                # INFRASTRUCTURE & BACKEND CLIENTS
│   │   ├── firebaseClient.js               # Firebase client SDK initialization & Firestore instance
│   │   ├── firebaseAdmin.js                # Firebase Admin SDK with Google Identity Toolkit minting
│   │   └── serverDb.js                     # Hybrid server persistence adapter with JSON/Firestore
│   │
│   ├── services/                           # FRONTEND SERVICES & STATE MANAGEMENT
│   │   ├── authService.js                  # User session management, role handling, sync
│   │   ├── dataStore.js                    # Reactive frontend store, game analytics, medicines
│   │   └── supabase.js                     # Auxiliary cloud sync interface
│   │
│   ├── styles/                             # STYLE DEFINITIONS
│   │   ├── design-tokens.css               # Color tokens (emerald palette), shadows, border radii
│   │   └── main.css                        # Global CSS classes
│   │
│   ├── utils/                              # UTILITIES & HELPERS
│   │   ├── geoData.js                      # Location and Indian geography datasets
│   │   ├── i18n.js                         # Multilingual translations (English, Hindi, Bengali)
│   │   ├── speech.js                       # Web Speech API synthesis wrapper
│   │   └── toast.js                        # Imperative toast trigger function
│   │
│   └── views/                              # MODULAR VANILLA SPA VIEWS (Mirrors Next.js)
│       ├── AddReminderModal.js
│       ├── CaregiverContacts.js
│       ├── CaregiverDashboard.js
│       ├── CaregiverLogin.js
│       ├── ElderDashboard.js
│       ├── MemoryMatchGame.js
│       ├── OtpVerification.js
│       ├── UserDetailsSetup.js
│       └── WelcomePhoneLogin.js
│
├── .env / .env.local                       # Environment secrets (Project IDs, keys)
├── next.config.mjs                         # Next.js configuration
├── tailwind.config.js                      # Tailwind CSS design system tokens
└── package.json                            # Scripts, Next 15, React 19, Firebase SDK
```

---

## 3. Data Schema & Persistence Model

### A. Firestore Data Architecture
The authoritative Firestore database schema is strictly scoped by user / elder ID:

1. **Elder Document**: `elders/{elderId}`
   ```json
   {
     "id": "9876543210",
     "name": "Kamala Sen",
     "honorific": "Kamala ji",
     "age": 74,
     "phone": "9876543210",
     "caregiverEmail": "caregiver@sahara.care",
     "city": "Kolkata",
     "state": "West Bengal",
     "status": "Mild Cognitive Support Mode",
     "lastActive": "2026-09-10T12:00:00Z"
   }
   ```

2. **Daily Game & Cognitive Logs**: `elders/{elderId}/dailyLogs/{YYYY-MM-DD}`
   - Document ID: Local calendar date string (e.g., `2026-09-10`)
   - Schema:
     ```json
     {
       "date": "2026-09-10",
       "todaySessions": 3,
       "todayScore": 150,
       "lastPlayedAt": "ServerTimestamp",
       "sessionsHistory": [
         {
           "sessionNumber": 1,
           "pointsEarned": 50,
           "completedAt": "2026-09-10T09:15:00Z",
           "remainingTimeSeconds": 24,
           "accuracy": 100,
           "status": "completed"
         },
         {
           "sessionNumber": 2,
           "pointsEarned": 50,
           "completedAt": "2026-09-10T11:30:00Z",
           "remainingTimeSeconds": 18,
           "accuracy": 100,
           "status": "completed"
         },
         {
           "sessionNumber": 3,
           "pointsEarned": 50,
           "completedAt": "2026-09-10T14:45:00Z",
           "remainingTimeSeconds": 31,
           "accuracy": 100,
           "status": "completed"
         }
       ]
     }
     ```

3. **Caregiver Document**: `caregivers/{cleanEmail}`
   ```json
   {
     "email": "caregiver@sahara.care",
     "name": "Ananya Sen",
     "elderId": "9876543210",
     "linkedElder": { ... }
   }
   ```

---

## 4. Mind Game Rules & Scoring Algorithms

1. **60-Second Active Countdown**:
   - Timer starts when the round begins.
   - UI shows real-time progress meter and transitions colors:
     - `timeLeft > 20s`: Emerald (#006e1c)
     - `10s < timeLeft <= 20s`: Amber (#d97706)
     - `timeLeft <= 10s`: Red (#dc2626)
   - If timer expires before matching 3 pairs:
     - Awards **0 points**.
     - Records session in `sessionsHistory` with `status: 'timed_out'`, `pointsEarned: 0`, and accuracy % based on matched pairs.
     - Automatically lowers the Caregiver Portal's `Cognitive Score %`.

2. **Fixed +50 Points**:
   - Each completed game round awards exactly **50 points**.
   - Daily score accumulates: 50 $\rightarrow$ 100 $\rightarrow$ 150 $\rightarrow$ 200 $\rightarrow$ 250 max.
   - **Never default or use arbitrary scores** (e.g. 225, 275, 280).

3. **Daily Cap (Max 5 Sessions Per Day)**:
   - Evaluated by `todaySessions` in `elders/{elderId}/dailyLogs/{YYYY-MM-DD}`.
   - If `todaySessions >= 5`:
     - Disable the game start button on Elder Dashboard and Memory Game page.
     - Display exact banner text:  
       `"Daily limit reached (5/5 sessions completed today). Rest well!"`.

4. **Caregiver Portal Analytics Calculations**:
   - **Today's Score**: `todayScore` from live Firestore snapshot (`{score} Points`).
   - **Today's Sessions**: `todaySessions` from live Firestore snapshot (`{sessions} Sessions`).
   - **7-Day Rolling Cumulative Total**: Sum of `todayScore` from today and previous 6 days (`elders/{elderId}/dailyLogs/{dStr}`).
   - **Cognitive Score %**: Average accuracy percentage calculated across all entries in `sessionsHistory`.
   - **7-Day Chart Scale**: Max scale is 250 points (`(score / 250) * 100`).
     - `score >= 200`: High Score (4-5 Sessions)
     - `score > 0`: Moderate (1-3 Sessions)
     - `score === 0`: 0p / No Sessions

---

## 5. Authentication & Sync Workflow

1. **Elder Authentication**:
   - Uses mobile phone number or unique identifier.
   - State persisted in `localStorage` under `sahara_active_user` with `{ role: 'elder', ... }`.
2. **Caregiver Authentication**:
   - Email and password sign-in.
   - On login, queries `api/auth/sync` to fetch and link the elder profile.
   - State persisted under `sahara_active_user` with `{ role: 'caregiver', linkedElder: { ... } }`.
3. **Cross-Device Sync (`authService.syncCaregiverElderData`)**:
   - Resolves `linkedElder` by querying Firestore `caregivers/{cleanEmail}` $\rightarrow$ retrieves `elderId` $\rightarrow$ reads `elders/{elderId}`.

---

## 6. Development & Build Guidelines

- **Always verify builds**: Run `npm run build` after structural changes to ensure zero broken JSX tags or syntax errors.
- **Maintain Design System**:
  - Primary Dark Green: `#032109` / `#006e1c`
  - Primary Brand Green: `#0d631b`
  - Light Background: `#ebffe7`
  - Card Fill: `#d9fdd6` / `#ffffff`
  - Border: `#cdf2cb`
- **Never expose secrets**: Keep API keys and private keys in `.env` or Firebase configuration files.
