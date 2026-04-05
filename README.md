# ⌨️ TypeCraft — Real-time Multiplayer Typing Speed App

A full-stack, production-ready typing speed Application. Built with Next.js 14, Node.js/Express, Socket.io, and MongoDB.

---

## 🚀 Features

- **Typing Test** — WPM/accuracy tracking, real-time error highlighting, 15/30/60/120s modes
- **Real-time Multiplayer** — Create/join rooms via 6-char code, live race progress, leaderboard
- **Guest Mode** — No signup required; full feature access as guest
- **User Accounts** — Optional JWT auth, stats history persisted in MongoDB
- **GSAP Animations** — Smooth hero entrance, countdown, and result animations
- **Dark-first UI** — Minimal, clean, monospace-accented design
- **Optimized Input** — Hidden input with direct state updates — zero visible lag

---

## 📁 Project Structure

```
typecraft/
├── frontend/    # Next.js 14 (TypeScript + Tailwind + GSAP)
└── backend/     # Node.js + Express + Socket.io + MongoDB
```

---

## ⚙️ Local Development Setup

### Prerequisites

- Node.js >= 18
- MongoDB (local or MongoDB Atlas URI)
- npm or yarn

---

### 1. Clone & Install

```bash
git clone https://github.com/Syl3r27/TypeCraft.git
cd typecraft

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

---

### 2. Environment Variables

**Backend** — copy and fill in:
```bash
cd backend
cp .env.example .env
```

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/typeblaze
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend** — copy and fill in:
```bash
cd frontend
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

### 3. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 🏗️ Build for Production

### Backend
```bash
cd backend
npm run build      # Compiles TypeScript → dist/
npm start          # Runs compiled server
```

### Frontend
```bash
cd frontend
npm run build      # Next.js production build
npm start          # Serves production build
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | GSAP 3 |
| State management | Zustand |
| Real-time | Socket.io client |
| Backend | Node.js + Express |
| Real-time server | Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Language | TypeScript (full-stack) |

---

## 🤝 Contributing

This project welcomes **open source contributions**! Feel free to:
- Report bugs and suggest features via issues
- Submit pull requests for improvements, bug fixes, or features
- Fork the repo and experiment

However, **deployment and production hosting** are managed solely by the project maintainer.

---

## 📄 License

**Code License:** MIT — Anyone can use, modify, and contribute.

**Deployment:** Restricted to project maintainer only. Contributions welcome, but production deployment rights are reserved.
