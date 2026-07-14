<div align="center">
  <img src="./public/logo.png" width="80" alt="BayanIpon Logo" />
  <h1>BayanIpon - Admin Web Dashboard</h1>
  <p><strong>Protocol Control Center & Analytics</strong></p>
  <br />
  <a href="https://csmp-web.vercel.app/">
    <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deployed on Vercel" />
  </a>
</div>

---

## 📖 Overview

The Admin Web Dashboard is the operational control center for the **BayanIpon** protocol. Designed for community managers, protocol administrators, and auditors, it provides a comprehensive bird's-eye view of the platform's health, user demographics, and financial metrics.

## ✨ Core Features

- **Protocol Analytics (TVL & Metrics):** 
  Real-time aggregation of the Total Value Locked (TVL) in the Paluwagan pools, active participant counts, contribution streaks, and platform default rates.
- **Risk & Treasury Management:** 
  Monitors the liquidity pools used for the micro-lending protocol. Admins can view accrued interest and manage platform parameters like minimum required on-chain credit scores.
- **KYC & User Management:** 
  Provides an interface for reviewing user identity documents, approving local community organizers, and addressing flagged accounts.
- **Audit Trails:** 
  Displays transparent logs that combine off-chain database events with immutable on-chain Soroban transactions, ensuring complete traceability for dispute resolution.

## 🛠️ Tech Stack

- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Backend Connection:** Interfaces with the BayanIpon Node.js Backend API and directly queries Soroban RPC when necessary.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (if required for the backend API connection):
   ```env
   PUBLIC_API_URL=http://localhost:3000/api
   ```

### Running the Dashboard

Start the Astro development server:
```bash
npm run dev
```

Build the static/SSR site for production deployment:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---
*Built for the Stellar Blockchain Hackathon - Local Finance & Real World Access Track.*
