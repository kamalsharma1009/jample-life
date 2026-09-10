# Jample Life — Enterprise Direct Selling & MLM Platform

> **Rich World • Healthy World**  
> A full-stack, enterprise-grade Direct Selling (MLM) platform built with **React 18**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL + Realtime)**.

[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel%20Ready-black?logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🌟 Executive Summary & Key Capabilities

Jample Life is an end-to-end digital operating system for modern ayurvedic wellness direct selling companies:

1. **13-Level Dual-Engine Commission Calculation**:
   - Automated PV (Point Volume) and BV (Business Volume) tracking.
   - Dynamic 13-tier unilevel sponsor overrides, fast-track bonuses, and director leadership pools.
2. **Real-Time Genealogy Visualizer**:
   - Interactive tree view of binary sponsor downlines with drill-down node expansion.
   - Live left/right leg volume counters and active rank indicators.
3. **Automated Weekly Settlements**:
   - Weekly cycle closure engine (Monday 23:59 IST cut-off).
   - Dynamic cycle code calculation (`WXX-YYYY`).
   - TDS deduction (5% statutory Section 194H) and admin payout batch approvals.
4. **E-Commerce & Digital Replicated Store**:
   - AYUSH-certified wellness catalog with retail vs. distributor pricing (DP / MRP).
   - Replicated distributor referral links (`/register?ref=MEMBER_ID`) with auto-attribution.
5. **Realtime Live Synchronization**:
   - Live database subscriptions on navigation badges (`KYC Review`, `Notices`, `Unread Alerts`).
   - Modals rendered via React Portals with `z-[9999]` backdrop overlays.
6. **Regulatory Compliance & KYC**:
   - PAN card, Aadhaar, and cancelled bank cheque submission and verification workflows.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework & Build** | React 18.3, Vite 8.2 |
| **Styling & Icons** | Tailwind CSS 3.4, Lucide React Icons |
| **State Management** | Zustand (persistent auth & shopping cart storage) |
| **Validation & Forms**| React Hook Form, Zod schema validation |
| **Database & Auth** | Supabase (PostgreSQL 15, Row Level Security, Realtime WebSockets) |
| **Notifications** | Sonner (Interactive toast notifications) |
| **Deployment** | Vercel (Configured with `vercel.json` SPA client routing) |

---

## 📁 Repository Structure

```
Jample/
├── public/                  # Static assets (favicons, manifest, vector icons)
├── src/
│   ├── assets/              # Bundled image assets
│   ├── components/          # Reusable UI components
│   │   ├── admin/           # AdminHeader, AdminSidebar, Admin stats
│   │   ├── member/          # MemberHeader, MemberSidebar, wallet cards
│   │   ├── genealogy/       # Interactive Tree Nodes & downline charts
│   │   ├── auth/            # ProtectedRoute & AdminRoute guards
│   │   └── public/          # Landing navbar, footer, testimonials
│   ├── pages/
│   │   ├── admin/           # Backoffice control center (Members, Orders, Settlements, etc.)
│   │   ├── member/          # Distributor dashboard, Shop, Wallet, Payout, KYC, Team
│   │   ├── auth/            # High-converting RegisterPage & LoginPage
│   │   └── public/          # Landing page & Marketing showcase
│   ├── services/            # Supabase database operations (dbService.js, etc.)
│   ├── stores/              # Zustand stores (authStore.js, cartStore.js)
│   ├── lib/                 # Utilities, schemas, validations, Supabase client
│   ├── App.jsx              # Application router & layout structure
│   └── main.jsx             # Entry point
├── vercel.json              # Vercel Single Page Application rewrite rules
├── .env.example             # Environment configuration template
└── tailwind.config.js       # Design system tokens and brand gradients
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd Jample
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_APP_NAME=Jample Life
VITE_APP_URL=http://localhost:5174
```

### 4. Run Locally
```bash
npm run dev
```
Open your browser at `http://localhost:5174`.

---

## ☁️ Deploying to Vercel (Step-by-Step)

The project is fully pre-configured for zero-config Vercel deployments via [`vercel.json`](./vercel.json).

### Method A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete production-ready Jample Life platform"
   git push origin main
   ```
2. **Import into Vercel**:
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
   - Select your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Leave as `./` (or select `Jample` if inside a monorepo).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Add Environment Variables**:
   In Vercel's **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   - `VITE_APP_NAME` = `Jample Life`
   - `VITE_APP_URL` = `https://your-production-domain.vercel.app`
5. **Deploy**:
   Click **"Deploy"**. Your site will be live within ~60 seconds with SSL enabled.

### Method B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
# When prompted for production deploy:
vercel --prod
```

> [!NOTE]
> **SPA Client Routing**: The included `vercel.json` ensures that refreshing or directly opening sub-routes (such as `/admin/members`, `/shop`, `/kyc`, or `/register?ref=...`) will never return a `404: NOT_FOUND` error.

---

## 🔐 Authentication & Access Control

Jample Life supports enterprise Direct Selling (MLM) login standards:

1. **Distributor Login via Generated ID**:
   - Every distributor is assigned an official **Distributor ID** upon registration (e.g. `JL-2026-0201`).
   - Members sign in at `/login` using their **Generated Distributor ID** (or registered email) and password.
2. **Super Administrators**:
   - Administrative backoffice accounts (`/admin`) are accessed via their Admin ID (e.g. `JL-ADMIN-001`) or admin email.
   - Access is guarded by `<AdminRoute>` middleware, preventing unauthorized access to settlement engines, master genealogy, and compliance verification queues.
3. **Zero Plaintext Credentials in Public UI**:
   - In accordance with production security standards, no hardcoded demo auto-fill buttons or plain-text credentials are exposed in public UI or documentation.

---

## 🔒 Security & Git Ethics Guidelines

1. **Never Commit Secrets**:
   - `.env`, `.env.local`, and `.env.production` are strictly listed in [`.gitignore`](./.gitignore).
   - Only commit `.env.example` with sanitized placeholders.
2. **Service Role Keys**:
   - The Supabase `service_role` key must **never** be used in frontend client code. Only use the public `anon` key.
3. **Route Security**:
   - Admin routes are protected by `<AdminRoute>`, enforcing `profile.role === 'ADMIN'` before rendering control center pages.
   - Member routes require active session authentication via `<ProtectedRoute>`.
4. **Data Integrity**:
   - Direct database mutations use parameterized Supabase queries with strict client-side Zod validation.

---

## 📄 License & Compliance

© 2026 **Jample Life**. All rights reserved.  
Compliant with Ministry of Consumer Affairs Direct Selling Guidelines and statutory Section 194H TDS frameworks.
