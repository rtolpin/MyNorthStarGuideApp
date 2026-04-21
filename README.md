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

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS v3, Framer Motion
- **Charts:** Recharts
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Storage:** IndexedDB (via `idb`) — all data stored locally in your browser
- **Routing:** React Router v7

---

## Getting Started

### Prerequisites

- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/settings/api-keys)

### Installation

```bash
git clone https://github.com/rtolpin/MyNorthStarGuideApp.git
cd MyNorthStarGuideApp
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

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

---

## Privacy

All user data is stored **locally in your browser** using IndexedDB. Nothing is sent to any server except AI prompt requests to the Anthropic API.

---

## License

MIT
