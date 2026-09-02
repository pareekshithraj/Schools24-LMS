# Schools24 LMS — Intelligent Computer Science Learning Management System

> **A high-scale, modern LMS engineered for multi-school educational foundations.** Powered by WebRTC live masterclass broadcasting, in-browser Pyodide code sandboxes, precision targeted scheduling, and PostgreSQL telemetry.

---

## 🌟 Key Capabilities

1. **Targeted Class Scheduling Engine**:
   - Schedule live sessions targeted to **All Classes**, **Specific Grade & Section** (e.g. *Grade 9 Section A*), or **Individual 1-on-1 Students** with instant real-time Socket.io push notifications.
2. **Real-Time Live Masterclass Broadcast**:
   - WebRTC signaling mesh enabling 1 master trainer to broadcast simultaneously across 42 trust school labs with low-bandwidth resilience.
3. **In-Browser CodeLab Sandbox**:
   - Zero-setup Python, JavaScript, and HTML/CSS runtime with automated test assertions and instant pass/fail grading.
4. **Student & Teacher Directories**:
   - Searchable, cluster-isolated rosters with XP rankings, attendance rates, and educator ratings.
5. **Multi-Tenant Institute Data Isolation**:
   - Automatic tenant isolation per school node with cluster benchmark analytics.
6. **Schools24-Themed Modern Aesthetics**:
   - Dark `#000000` canvas with `#f59e0b` amber accents, interactive Studio Explorer, and cyber-terminal Developer Dashboard (`/dev`).

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Socket.io-client
- **Backend**: Node.js, Express, Socket.io WebRTC signaling gateway
- **Database**: Neon Serverless PostgreSQL (AWS AP-South) with connection pooling
- **Code Execution**: Pyodide WebAssembly + Piston Compiler API
- **Deployment**: Vercel (Frontend SPA) + Node Gateway

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Backend Server (Port 3001)
```bash
npm run server
```

### 3. Run Frontend Dev Server (Port 5173)
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Routes Overview

- `/` — Schools24-themed Landing Page & Interactive Studio Explorer
- `/login` — Secure Role-Based Authentication
- `/app` — LMS Application Dashboard (Student, Teacher, Principal, Parent, Trust Admin views)
- `/superadmin` — Foundation Multi-Tenant Governance & Provisioning
- `/dev` — Cyber-Terminal Developer Cockpit, Live API Runner & PostgreSQL Inspector

---

## 📄 License
MIT © 2026 Schools24 · VidyaSetu Foundation
