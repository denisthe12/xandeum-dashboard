# ⚡ Xandeum pNode Explorer

> The most advanced analytics platform for the Xandeum storage network.

**Live Demo:** [https://xandeum-nodes-dashboard.vercel.app/](https://xandeum-nodes-dashboard.vercel.app/)

![Dashboard Preview](https://i.ibb.co.com/4H0gs8K/Xandeum-p-Node-Explorer-12-25-2025-11-26-PM.png)
![Dashboard Preview](https://i.ibb.co.com/PG5Xzs1W/Xandeum-p-Node-Explorer-12-25-2025-11-29-PM.png) 


## 🚀 Tech Stack

Built with modern, production-ready technologies focusing on speed and developer experience.

- **Framework:** Next.js 14 (App Router, Server Components)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Styling:** Tailwind CSS + Lucide Icons
- **Charts:** Recharts
- **Maps:** React Leaflet (Dark Mode)
- **State:** React Context + LocalStorage
- **Deployment:** Vercel (Serverless Functions + Cron Jobs)

---

## 🛠️ How to Deploy

You can deploy your own instance of this explorer in minutes.

### 1. Clone the repository
```bash
git clone https://github.com/denisthe12/xandeum-dashboard.git
cd xandeum-explorer
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
# Database connection (PostgreSQL recommended for production)
DATABASE_URL="postgresql://user:password@host:port/db"

# Telegram Bot Token (for Alerts)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"

# Secret key for Cron Jobs protection
CRON_SECRET="my_super_secret_key"
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

**Note: To populate data locally, run the crawler manually:**
```bash
npm run crawler
```

---

## ✨ Key Features

This explorer goes beyond simple data display. It provides powerful tools for node operators and investors.

### 🔍 Advanced Discovery

- **Hybrid Crawler:** Combines Gossip Protocol discovery (for full network view) with direct RPC polling (for detailed metrics).
- **Self-Healing:** Automatically detects node status changes and updates metadata.
- **Deep Metrics:** Tracks Used vs Committed Storage, Block Height, and Network Traffic.

### 📊 Interactive Analytics

- **Live Network Map:** Neon-styled interactive map showing global node distribution.
- **Real-time Graphs:** Visualizing storage growth and resource usage over time.
- **ISP Decentralization:** Analysis of network providers to ensure decentralization health.

### 🛠️ Power User Tools

- **⌘K Command Palette:** Press `Ctrl+K` (or `Cmd+K`) anywhere to instantly search nodes or navigate pages.
- **Compare Tool:** Select up to 3 nodes to compare their performance side-by-side.
- **Live Activity Feed:** Real-time stream of network events (new nodes, updates, offline status).

### 🔔 Alert System

- **Telegram Integration:** Get instant notifications when your favorite node goes offline.
- **Watchlist: Track specific** nodes directly from the dashboard.
