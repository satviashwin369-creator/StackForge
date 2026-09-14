# StackForge Frontend 🖥️

> **Modern Cloud-Native Internal Developer Platform (IDP) Web UI**  
> Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, and Recharts.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack / Webpack build modes)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/postcss`
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) with `persist` middleware for session tokens
- **Data Visualization:** [Recharts](https://recharts.org/) for CPU, RAM, Disk, and pipeline analytics
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Component Primitives:** Radix UI / Shadcn UI

---

## 📁 Directory Structure

```text
frontend/
├── app/
│   ├── (auth)/                  # Public authentication routes
│   │   ├── login/page.tsx       # User login page
│   │   ├── signup/page.tsx      # User registration page
│   │   └── layout.tsx           # Auth centered layout
│   ├── dashboard/               # Protected dashboard routes
│   │   ├── page.tsx             # Main dashboard (KPIs, activity, recent runs)
│   │   ├── projects/            # Project catalog & management
│   │   │   ├── page.tsx         # Projects list & creation modal
│   │   │   └── [id]/page.tsx    # Single project view with pipeline & deployments
│   │   ├── deployments/         # Global deployment history & stage viewer
│   │   ├── infrastructure/      # Server health, cluster utilization & SLA metrics
│   │   ├── logs/                # Real-time WebSocket log stream console
│   │   ├── settings/            # User settings & platform preferences
│   │   └── layout.tsx           # Persistent dashboard sidebar & navigation shell
│   ├── globals.css              # Global styles, Tailwind v4 imports, theme tokens
│   ├── layout.tsx               # Root application layout & theme provider
│   └── page.tsx                 # Public landing page with hero & feature showcase
├── components/
│   ├── auth/                    # Auth form components & validators
│   ├── dashboard/               # Metric charts, log viewers, server cards, pipelines
│   ├── landing/                 # Landing page sections (hero, features, testimonials)
│   ├── layout/                  # Navigation bar, sidebar, theme toggles, shells
│   ├── providers/               # Theme & auth context providers
│   └── ui/                      # Reusable UI primitives (buttons, modals, badges, inputs)
├── hooks/
│   ├── use-live-logs.ts         # WebSocket log streaming with polling fallback
│   ├── use-async-data.ts        # Declarative async data fetching hook
│   └── use-polling.ts           # Configurable interval polling hook
├── lib/
│   ├── api/                     # Typed API client services for backend routes
│   ├── types/                   # TypeScript interfaces (User, Project, Deployment, Log)
│   └── navigation.ts            # Sidebar routes & navigation hierarchy
└── stores/
    └── auth-store.ts            # Zustand persistent store for JWT & user session
```

---

## 🚀 Key Frontend Features

### 1. Persistent Authentication & Route Guards
- Full JWT integration with `/api/v1/auth/login` and `/api/v1/auth/register`.
- Client-side route guarding redirecting unauthenticated users to `/login`.
- Hydration and session restoration across hard page reloads using Zustand `localStorage` persistence.

### 2. Multi-Stage Pipeline Visualizer
- Dynamic pipeline status display representing 6 delivery stages:
  `Source → Build → Test → Security Scan → Deploy → Verify`
- Live state updates for in-flight and completed runs.

### 3. Real-Time Streaming Log Console
- Interactive log viewer (`/dashboard/logs`) connecting to `/api/v1/ws/logs/{deployment_id}`.
- ANSI color highlighting, service-level filtering, search filtering, and automatic scrolling.
- Resilient polling fallback if WebSocket connectivity fails.

### 4. Infrastructure & Telemetry Visuals
- `/dashboard/infrastructure` displays real-time server health cards.
- Timeseries charts for 24h CPU utilization, Memory usage, and Disk consumption.
- Uptime SLA percentage bar charts for active instances.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` or use `.env.example`:
```env
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:8000/api/v1
BACKEND_INTERNAL_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🐳 Docker Deployment

The frontend container is built using a multi-stage Dockerfile:
- Builds Next.js application in standalone/optimized mode.
- Internal rewrite routes proxy `/api/v1/*` requests directly to `http://backend:8000`.
