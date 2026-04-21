# MyNorthStarGuide

### 🌐 Live App: [https://my-north-star-guide-app-c0311.web.app](https://my-north-star-guide-app-c0311.web.app)

An AI-powered personal life intelligence platform that helps you track habits, set goals, and gain insights into your well-being — guided by your own North Star.

---

## Features

| Module | Description |
|---|---|
| **Daily Check-In** | Log your mood, energy, and daily reflections |
| **Habits Tracker** | Build and maintain habit streaks with visual progress |
| **AI Predictions** | Future Self Engine powered by Claude AI — get personalized insights based on your patterns |
| **Goals & Milestones** | Set meaningful goals and track progress toward them |
| **Vision Board Studio** | Create a visual representation of your aspirations |
| **Coping Strategy Center** | Access and personalize coping strategies for challenging moments |
| **Insights & Analytics** | Visualize trends, correlations, and your North Star Score over time |

---

## Authentication

The landing page at `https://my-north-star-guide-app-c0311.web.app` serves as the sign-in page. No separate login URL is needed.

**Supported sign-in methods:**
- Email and password
- Google (one-click sign-in)

**User flows:**
- **New users** — create an account, then complete a short onboarding to personalise the experience
- **Returning users** — sign in and go straight to the home dashboard

All user data is tied to their account and synced to the cloud via Firestore, so it's accessible from any device.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS v3, Framer Motion
- **Charts:** Recharts
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Auth:** Firebase Authentication (Email/Password + Google)
- **Database:** Cloud Firestore — data synced per user account
- **Routing:** React Router v7

---

## Getting Started

### Prerequisites

- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/settings/api-keys)
- A [Firebase project](https://console.firebase.google.com) with Authentication and Firestore enabled

### Installation

```bash
git clone https://github.com/rtolpin/MyNorthStarGuideApp.git
cd MyNorthStarGuideApp
npm install
```

### Environment Variables

Create a `.env` file in the root of the project (see `.env.example` for the full list):

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get your Firebase config from **Firebase Console → Project Settings → Your apps → Web app**.

### Firebase Setup

1. Enable **Authentication** → Sign-in method → Email/Password and Google
2. Enable **Firestore Database** → Create database (Production mode)

### Run Locally

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## Deployment

This app is deployed to **Firebase Hosting** via GitHub Actions. Every push to `master` automatically builds and deploys to:

**[https://my-north-star-guide-app-c0311.web.app](https://my-north-star-guide-app-c0311.web.app)**

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `FIREBASE_TOKEN` | Firebase CI token (run `firebase login:ci` locally to generate) |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key used during the build |
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## Privacy & Security

- All user data is stored in **Cloud Firestore**, scoped to the authenticated user's account
- Firestore security rules ensure users can only read and write their own data
- AI prompt requests are sent to the Anthropic API — no other data leaves your account

---

## License

MIT
