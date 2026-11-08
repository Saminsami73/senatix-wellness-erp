# Senatix Wellness • Medicine & Healthcare Distribution ERP Web Application

A production-ready, 60 FPS Distribution & ERP Web Application built for **Senatix Wellness** using **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, and **Supabase (Free Tier)**.


## 🚀 Key Features Implemented

### 1. Brand Assets, Contrast Fix & 60 FPS Preloader
- **Logo Placement**: 3D metallic emerald-and-gold monogram logo (`public/brand/Senatix_Wellness_logo_transparent.png`).
- **Contrast Fix**: Dark petrol-teal wordmark (`public/brand/Senatix_text_transparent.png`) is encased in a frosted badge (`bg-emerald-50/95`) with CSS drop shadow for razor-sharp contrast in both dark and light environments.
- **Hardware-Accelerated Preloader (`components/ui/Preloader.tsx`)**: 60 FPS emerald-gold pulse animation that completes in `600ms` and never blocks the user for more than `0.8s`.

### 2. Exact Glassmorphic Login (`login.html` Adaptation)
- Deep obsidian background (`#080710`) with top-left blue orb and bottom-right orange-gold orb.
- Frosted glass card (`backdrop-blur-[12px]`, `border-2 border-white/10`).
- ID/Phone input with automatic `@senatix.local` suffixing.
- Show/Hide PIN toggle.
- 1-Click Bilingual Language Switcher (`🌐 বাংলা / English`).
- Office admin support modal for forgotten PINs.

### 3. Exact 3-Column Dashboard Shell (`UI_template/` Adaptation)
- **Left Sidebar (`w-64`)**:
  - Logged-in user profile box with circular photo and role badge (click to update photo or PIN).
  - 10 Navigation links with active count badges.
  - Bilingual pill switch with flag transitions.
  - Emergency hotline support card (`24/7 Online Support`).
- **Center Workspace**:
  - Top segmented tab bar (`[⚡ Make Instant Bill]`, `[📦 Receive Factory Stock]`, `[💰 Collect Baki]`, `[📋 Today's Attendance]`).
  - 5 Horizontal pastel metric cards (`Mint White`, `Soft Peach`, `Soft Coral`, `Soft Lavender`, `Soft Sage`).
  - Team & field staff circular avatar strip with colored status rings and interactive quick staff drawer.
  - Main interactive Recharts bar chart (`Today | 7 Days | 30 Days` toggles).
  - Bottom 3 KPI metric cards (`True Net Profit`, `Pending Orders`, `Target Completion`).
- **Right Sidebar (`w-72`)**:
  - Top 3 icon buttons (⚡ Quick POS Bill Modal, 🔔 Near-Expiry & Low-Stock Alerts, 💾 1-Click Company Full Excel Backup).
  - Live activity feed with gradient-bordered highlight card.
- **Mobile Ergonomics**:
  - Fixed bottom 5-tab bar (`Home`, `Make Bill`, `Stock`, `Money Book`, `More Menu`).
  - Slide-over drawers for left navigation and right activity feed.

### 4. Bilingual (English + বাংলা) System
- Instant zero-latency toggle with modes: `bn` (বাংলা), `en` (English), and `both` (বাংলা + English).
- Non-technical everyday terms (e.g. `বাকি খাতা`, `ফ্যাক্টরি কেনা দাম DP`, `ফার্মেসি বিক্রয় মূল্য TP`, `বোনাস বক্স ১০+১`, `হাজিরা ও বেতন`).

### 5. Client-Side WebP Image Auto-Compression (`lib/imageCompressor.ts`)
- Client-side `<canvas>` compression engine converts phone camera or PC photos to max `400x400px` WebP at `0.75` quality (`~15KB–30KB`).
- Zero layout shift (`SmartAvatar.tsx`) with initials or category icon fallbacks.

### 6. All 10 ERP Modules Implemented (`app/dashboard/*`)
1. `/dashboard`: Role-based executive overview.
2. `/dashboard/billing`: 3-Step visual POS wizard (split-screen on desktop, sticky drawer on mobile, FEFO auto-batching, bonus calculations, auto jsPDF memo print).
3. `/dashboard/orders`: Warehouse dispatch queue (`Order_Booked` -> `Packed_Ready` -> `Delivered_Final` + Delivery Challan PDF).
4. `/dashboard/inventory`: 4 Tabs (Master Catalog, Factory GRN inward, Batch/Expiry FEFO tracker, Returns & Quarantine).
5. `/dashboard/markets`: Markets/routes CRUD, pharmacy directory, 1-tap phone call button, Baki collection modal, pharmacy statement PDF.
6. `/dashboard/employees`: All 50+ staff, executors, managers, warehouse-to-staff stock transfer, cash handover to office.
7. `/dashboard/hr-payroll`: 1-Click daily attendance checklist (auto-credits daily TA/DA), monthly sales targets, automated monthly payroll generator + payslip PDF.
8. `/dashboard/ledger`: Unified money book for pharmacies, staff and suppliers with debit, credit, running balances and Excel export.
9. `/dashboard/expenses`: Daily company expenses and True Net Profit calculator (`Sales TP - Factory Cost DP - Expenses - Damaged Loss`).
10. `/dashboard/reports`: Analytics visualizations + 1-Click 18-Table Company Full Excel Backup (`Senatix_Backup_YYYY_MM_DD.xlsx`).

---

## 🗄️ Free Vercel & Supabase Deployment Instructions

For complete step-by-step instructions, see the beginner guide in [DEPLOYMENT_GUIDE.md](file:///e:/Senatix_Wellness_Web/DEPLOYMENT_GUIDE.md):

1. **Database (Supabase Free Tier)**:
   - Create a project on [Supabase](https://supabase.com).
   - Go to **SQL Editor**, paste [`database/supabase_schema.sql`](file:///e:/Senatix_Wellness_Web/database/supabase_schema.sql), and click **Run**.
   - Copy your **Project URL** and **anon public API key** from Project Settings > API.
2. **Hosting (Vercel Free Tier)**:
   - Import your GitHub repository into [Vercel](https://vercel.com).
   - Add environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Click **Deploy** to get your live `.vercel.app` production link.
3. **Walkthrough Manuals**:
   - In-app Guide: `/dashboard/guide`
   - Downloadable PDF: `/docs/Senatix_ERP_Walkthrough_Guide_English.pdf`
   - Printable Bangla Guide: `/docs/Senatix_ERP_Walkthrough_Guide_Bangla.html`
