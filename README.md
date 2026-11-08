# Senatix Wellness Distribution ERP

**Enterprise Pharmaceutical & Healthcare Distribution Management System**  
Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL (Free Tier Optimized)**.

---

## 🌟 Executive Summary

**Senatix Wellness ERP** is a centralized, high-performance web platform designed specifically for pharmaceutical distribution management. Engineered with an intuitive interface tailored for business owners and non-technical management personnel (including 50+ year old users), the system manages wholesale inventory, field sales custody, instant POS billing, automated due collections, doctor promotions, and financial ledgers.

---

## 🛡️ Core Operational Architecture

### 1. Administrative Security & Access Control
- **Strict Role-Based Portal**: Access is restricted strictly to executive management and administrative personnel (`Super Admin`, `Managing Director`, `Store In-charge`, `Accountant`). Field sales reps do not access the web application.
- **Master Authentication**: High-security credential verification with support for corporate emails, Admin IDs (`ADM-01`, `EXE-01`), and official passwords.
- **Zero Mock Data**: All operations, transactions, invoices, and inventories sync with live PostgreSQL tables in Supabase.

### 2. Employee Stock Custody & Cash Settlement Sequence
Field representatives operate in direct contact with management:
- **Medicine Custody Issuance**: Management issues medicine boxes directly from central warehouse batches to an employee (`transferStockToEmployee`).
- **Unsold Medicine Return to Godown (`ওষুধ গুদামে ফেরত জমা`)**: Unsold stock held by staff can be returned to central godown batches at any time with a single tap. Central inventory is restored immediately, and staff custody is zeroed out.
- **Field Cash Collection & Due Clearance (`ক্যাশ টাকা জমা ও বকেয়া নিষ্পত্তি`)**:
  - When field staff deposit collected cash or clear their dues, management clicks **"ক্যাশ গ্রহণ" (Collect Cash)**.
  - The system automatically debits staff liability, records a credit entry in the company cash ledger, and syncs to Supabase.
  - Generates an official, printable **"ক্যাশ জমা মানি রিসিট (Cash Deposit Voucher)"** with company letterhead, voucher reference, date, breakdown, and signature lines for both employee and management.

### 3. Free Realtime Notifications & Audio Feedback
- **Supabase Realtime WebSockets**: Listens for live PostgreSQL changes (`postgres_changes`) across invoices, payments, stock movements, and expenses.
- **Hardware-Synthesized Audio Chime**: Built using the browser Web Audio API (`AudioContext`) with two soothing sine frequencies (587Hz -> 880Hz). Requires zero external sound files, consumes 0 KB bandwidth, and runs completely free.
- **Live Toast & Notification Center**: Instant visual alerts appear on screen and are archived in the top navigation bell drawer with one-tap sound toggling.

### 4. Supabase Free Tier Longevity Optimization
The database schema and synchronization pipeline are engineered to run within the **Supabase Free Tier (500 MB DB, 1 GB Storage, 50k MAU, 5 GB Egress)** for years without incurring cloud costs:
- **Ultralight Row Footprint**: Standard relational rows average 200–500 bytes. At 50 invoices per day (~18,000 invoices/year), the database uses less than 15 MB in an entire year.
- **Storage Protector**: Client-side `<canvas>` image auto-compression converts photos to WebP at ~15 KB–30 KB. Base64 strings exceeding 50 KB are prevented from entering PostgreSQL columns, keeping table storage pristine.
- **Local Fallback Persistence**: `localStorage` caching ensures instant 60 FPS UI load times even on slow 3G mobile connections.

---

## 📦 System Modules

| Module | Route | Functionality |
| :--- | :--- | :--- |
| **Executive Dashboard** | `/dashboard` | Today's revenue, net profit, cash in hand, expiry warnings, sales analytics. |
| **POS Billing** | `/dashboard/billing` | 3-Step instant invoice generator, auto FEFO batch selection, bonus rules (10+1), instant PDF memo print. |
| **Warehouse Inventory** | `/dashboard/inventory` | 8 Senatix core products, factory GRN receipts, batch tracking, expiry monitoring, stock returns. |
| **Staff & Stock Custody** | `/dashboard/employees` | Staff directory, unsold stock return to godown, cash collection, money receipt voucher printing. |
| **Doctor Relations** | `/dashboard/doctors` | Doctor registry, prescription targets, marketing & promotional expense tracking, sample logs. |
| **Orders & Delivery** | `/dashboard/orders` | Delivery queue management (`Booked` → `Packed` → `Delivered`), delivery challan printing. |
| **Accounts & Ledger** | `/dashboard/ledger` | Double-entry cash/bank ledger, customer due collection, staff receipts, Excel export. |
| **Daily Expenses** | `/dashboard/expenses` | Office expenses, delivery van fuel, travel allowances, True Net Profit calculator. |
| **HR & Payroll** | `/dashboard/hr-payroll` | Attendance tracking, daily TA/DA accrual, commission rules, automated monthly payslip generator. |
| **Business Reports** | `/dashboard/reports` | Analytical summaries and 1-click full company 18-sheet Excel backup (`Senatix_Backup_*.xlsx`). |
| **User Walkthrough** | `/dashboard/guide` | Step-by-step user manual in simple Bengali and English for non-technical users. |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: TypeScript 5.x
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with full Dark & Light mode support
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL 15 + WebSockets)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Spreadsheet Engine**: [XLSX (SheetJS)](https://sheetjs.com/)

---

## 🚀 Deployment & Configuration

### 1. Environment Variables
Create a `.env.local` file in the root directory (or configure in Vercel Project Settings):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 2. Database Setup (Supabase)
1. Open your Supabase Dashboard → **SQL Editor**.
2. Run the SQL schema from [`database/supabase_schema.sql`](file:///e:/Senatix_Wellness_Web/database/supabase_schema.sql).
3. The schema creates all 13 relational tables, foreign key constraints, default admin profiles, and enables Row Level Security (RLS) with permissive read/write policies.

### 3. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Deployment (Vercel)
```bash
# Create production build
npm run build

# Start production server
npm run start
```
When deploying to Vercel:
1. Connect your GitHub repository to Vercel.
2. In **Environment Variables**, paste `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. Every push to `main` will trigger an automated zero-downtime production deployment.

---

## 📄 License & Confidentiality

Copyright © 2026 **Senatix Wellness**. All rights reserved.  
This software is proprietary and intended solely for official company operations.
