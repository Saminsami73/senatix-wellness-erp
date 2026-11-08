# Senatix Wellness ERP: Deployment and user guide

This guide explains how to deploy Senatix Wellness ERP to a free cloud database on Supabase and host it for free on Vercel. It also includes daily operating instructions in both English and Bangla for non-technical owners and staff.

---

## 1. Free host and database summary

You will use two services:

1. **Supabase (Database)**: Provides a free managed PostgreSQL database. It stores medicines, employee in-hand stocks, sales invoices, ledger records, expenses, doctors, and payroll.
2. **Vercel (Website Host)**: Provides free hosting for Next.js web applications with automatic SSL (https), global distribution, and continuous deployment from GitHub.

Both services have generous free tiers that cost $0 per month.

---

## 2. Part 1: Set up Supabase database

Follow these steps to create your database:

### Step 1: Create an account and new project
1. Open [https://supabase.com](https://supabase.com) in your browser.
2. Click **Start your project** and sign up using your email or GitHub account.
3. On the dashboard, click **New project**.
4. Choose an organization (or create one named "Senatix").
5. Enter a project name, for example: `senatix-erp`.
6. Enter a strong database password (store this password in a safe place).
7. Select the region closest to you, such as **Singapore (ap-southeast-1)**.
8. Click **Create new project**. Supabase will set up your database in about 1 to 2 minutes.

### Step 2: Run the SQL schema script
1. Once the project is ready, click **SQL Editor** in the left sidebar (the icon looks like a terminal with `>_`).
2. Click **New query** in the top center.
3. Open the file `database/supabase_schema.sql` from your project folder.
4. Copy the entire contents of `database/supabase_schema.sql`.
5. Paste it into the Supabase SQL Editor text box.
6. Click the green **Run** button (or press `Ctrl + Enter`).
7. You will see `Success. No rows returned`. All tables, initial medicine stocks, employees, batches, and security policies are now created in your database.

### Step 3: Copy your API credentials
1. Click the **Project Settings** gear icon at the bottom of the left sidebar.
2. Under the Configuration menu, click **API**.
3. Locate two values on this page:
   - **Project URL**: Starts with `https://` and ends with `.supabase.co`.
   - **Project API Keys**: Look for the key labeled `anon` `public`.
4. Keep this browser tab open. You will paste these two values into Vercel.

---

## 3. Part 2: Push your code to GitHub

If your code is not yet on GitHub, run these commands in your project terminal:

```bash
git init
git add .
git commit -m "Production release of Senatix Wellness ERP"
git branch -M main
```

Next, open [https://github.com](https://github.com) and create a new repository:
1. Name it `senatix-wellness-erp`.
2. Choose **Private** (recommended for company data).
3. Click **Create repository**.
4. Copy the two commands shown on GitHub under "push an existing repository", which look like:

```bash
git remote add origin https://github.com/YOUR_USERNAME/senatix-wellness-erp.git
git push -u origin main
```

Your code is now stored on GitHub.

---

## 4. Part 3: Deploy to Vercel

Follow these steps to put the website live on the internet:

### Step 1: Connect your GitHub account
1. Open [https://vercel.com](https://vercel.com) and sign up with your GitHub account.
2. On your Vercel overview dashboard, click **Add New...** and choose **Project**.
3. Under "Import Git Repository", find `senatix-wellness-erp` and click **Import**.

### Step 2: Add your Supabase environment variables
1. In the project setup screen, leave Framework Preset as **Next.js** and Root Directory as `./`.
2. Expand the **Environment Variables** section.
3. Add the two variables you copied from Supabase:

   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`  
     **Value**: `https://your-project-id.supabase.co`

   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     **Value**: `your-anon-public-key-here`

4. Click **Add** for each variable.

### Step 3: Click Deploy
1. Click the blue **Deploy** button.
2. Vercel will build your application in approximately 1 minute.
3. When finished, you will see congratulations and a live production link, such as:  
   `https://senatix-wellness-erp.vercel.app`

Any team member or sales officer can now open this link on their mobile phone, tablet, or desktop computer.

---

## 5. Part 4: Test and verify the live database

To verify that your live site connects to Supabase:

1. Open your live Vercel URL.
2. Log in with ID `ADM-01` and PIN `1234`.
3. Go to **Expenses** (`/dashboard/expenses`).
4. Click **+ Add Expense**, enter an amount (such as 100 Tk for office snacks), and save.
5. Now open your Supabase project in your browser, click **Table Editor** on the left menu, and click the **expenses** table.
6. You will see the new row you just entered on the website appear in your PostgreSQL database.

---

## 6. Part 5: Beginner walkthrough and operating instructions (English)

### Accounts and access
- **Super Admin (Owner)**: ID `ADM-01`, PIN `1234`
- **Managing Director**: ID `EXE-01`, PIN `1234`
- **Store In-charge**: ID `STR-01`, PIN `1234`
- **Accountant**: ID `ACC-01`, PIN `1234`
- **Sales Officer (Mirpur)**: ID `EMP-001`, PIN `1234`
- **Sales Officer (Dhanmondi)**: ID `EMP-002`, PIN `1234`
- **Delivery Staff**: ID `DEL-01`, PIN `1234`

### Daily operating routine
1. **Receiving new factory stock**: Go to **Stock & Storage** > **Factory Stock Receipt**. Choose the factory, enter the challan number, batch number, and expiry date. Click Save. The boxes enter the central godown.
2. **Giving stock to employees**: Go to **Staff & Stock** > **Hand Over Stock**. Select the sales officer and input the quantity. The medicines move from godown stock to that employee. If an employee keeps medicine boxes with them without selling, the system counts it under that employee as in-hand unsold stock.
3. **Selling medicines and printing bills**: Go to **Make Bill**. Pick the selling employee, tap medicines, enter discount if any, and type the cash received. Click Save & Print. The system creates a customer invoice and delivery challan.
4. **Mobile field app for officers**: Sales officers open the site on their phones, tap **Field App**, and log in with their employee ID. They see their in-hand stock and can record sales and cash collections directly in the field.
5. **Depositing cash at office**: When the officer returns, open **Staff & Stock** and click **Accept Cash** to record money deposited into the office. Click **Return Stock** to return any unsold boxes back to the godown.
6. **Doctors and gifts**: Go to **Doctors**. Add doctors with their chamber location and assigned sales officer. Log sample medicines or promotional gifts using **Log Gift**.
7. **Weekly Excel backup**: Go to **Reports & Backup**. Click **Download 18-Sheet Excel Backup**. Save this spreadsheet to your computer or flash drive once every week.

---

## 7. Part 6: সহজ পরিচালন সহায়িকা (বাংলা)

### লগইন আইডি ও পিন নম্বর
- **মালিক / সুপার এডমিন**: আইডি `ADM-01`, পিন `1234`
- **ম্যানেজিং ডিরেক্টর**: আইডি `EXE-01`, পিন `1234`
- **স্টোর ইনচার্জ (গোডাউন)**: আইডি `STR-01`, পিন `1234`
- **হিসাবরক্ষক (ফাইন্যান্স)**: আইডি `ACC-01`, পিন `1234`
- **সেলস অফিসার (তানভীর)**: আইডি `EMP-001`, পিন `1234`
- **সেলস অফিসার (সাকিব)**: আইডি `EMP-002`, পিন `1234`
- **ডেলিভারি স্টাফ (রুবেল)**: আইডি `DEL-01`, পিন `1234`

### প্রতিদিনের কাজের ৫টি সহজ ধাপ
1. **ফ্যাক্টরি থেকে নতুন ওষুধ গ্রহণ**: গোডাউনে ওষুধ আসলে 'গুদাম ও ওষুধের স্টক' মেনুতে যান। 'ফ্যাক্টরি থেকে নতুন ওষুধ গ্রহণ' বাটনে ক্লিক করে সাপ্লায়ার, ফ্যাক্টরি চালান নম্বর, ব্যাচ নম্বর ও মেয়াদের তারিখ লিখে সেভ করুন। ওষুধ কেন্দ্রীয় গুদামে যুক্ত হবে।
2. **কর্মীদের ওষুধ বুঝিয়ে দেওয়া**: 'কর্মী ও অবিক্রীত স্টক' মেনুতে গিয়ে 'ওষুধ বরাদ্দ দিন' বাটনে চাপুন। যে সেলস অফিসার ওষুধ নিচ্ছেন তাকে সিলেক্ট করে বক্সের সংখ্যা লিখুন। কোনো কর্মী যদি ওষুধ বিক্রি না করে নিজের কাছে রেখে দেয়, তবে তা তার নামে অবিক্রীত স্টক হিসেবে নির্ভুলভাবে জমা থাকবে।
3. **চালান ও বিক্রয় বিল তৈরি**: 'নতুন চালান তৈরি' মেনুতে যান। কোন কর্মী বিক্রি করছেন তা নির্বাচন করুন এবং ওষুধের নাম ট্যাপ করুন। ক্রেতার নাম ও নগদ টাকার পরিমাণ লিখে 'বিল সেভ করুন' চাপলে সাথে সাথে পূর্ণাঙ্গ ইনভয়েস ও ডেলিভারি চালান তৈরি হবে।
4. **মোবাইল ফোনে ফিল্ড সেলস অ্যাপ**: সেলস অফিসাররা তাদের নিজস্ব স্মার্টফোনে ওয়েবসাইট খুলে 'ফিল্ড অ্যাপ' এ লগইন করবেন। তারা দেখতে পাবেন তাদের কাছে কত বক্স ওষুধ মজুত আছে এবং যেকোনো দোকানে সরাসরি বিক্রির চালান কাটতে পারবেন।
5. **অফিসে নগদ টাকা জমা ও স্টক ফেরত**: দিনশেষে মাঠ থেকে কর্মী অফিসে টাকা নিয়ে আসলে 'কর্মী ও স্টক' মেনুতে 'নগদ কালেকশন গ্রহণ' এ ক্লিক করে জমা টাকা এন্ট্রি দিন। আর অবিক্রীত ওষুধ ফেরত দিতে চাইলে 'ওষুধ ফেরত গ্রহণ' এ ক্লিক করে গুদামে ফিরিয়ে নিন।
6. **১-ক্লিক সম্পূর্ণ এক্সেল ব্যাকআপ**: 'রিপোর্ট ও ব্যাকআপ' মেনুতে গিয়ে 'এক্সেল ব্যাকআপ ডাউনলোড' বাটনে চাপ দিলে ১৮টি শিটসহ সম্পূর্ণ কোম্পানির ডাটা আপনার কম্পিউটারে এক্সেল ফাইলে সেভ হয়ে যাবে। প্রতি সপ্তাহে অন্তত একবার এই ব্যাকআপ ফাইল ডাউনলোড করে নিরাপদ স্থানে রাখুন।

