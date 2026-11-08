const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

// ----------------------------------------------------------------------------
// 1. GENERATE ENGLISH WALKTHROUGH PDF
// ----------------------------------------------------------------------------
function generateEnglishGuide() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [11, 12, 16]; // #0b0c10
  const accentColor = [222, 148, 137]; // #de9489
  const greenColor = [16, 185, 129];

  // PAGE 1: COVER & OVERVIEW
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SENATIX WELLNESS ERP', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(222, 148, 137);
  doc.text('Official User Walkthrough & Beginner Operating Manual', 14, 26);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.text('Version 2.0 | Medicine Distribution, Field Sales & Cloud Ledger', 14, 34);

  let y = 52;

  // SECTION 1: ABOUT THE SYSTEM
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('1. System overview and dual portals', 14, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const introText = 
    'Senatix Wellness ERP manages pharmaceutical distribution and sales. It separates complex ' +
    'back-office work from daily sales. The system has two distinct modes: \n\n' +
    '1. Head Office Portal: Used on desktop or laptop by the owner, managing director, accountant, and ' +
    'storekeeper to manage stock, factory orders, employee accounts, expenses, and payroll.\n' +
    '2. Field Sales Mobile App: A simplified mobile interface for sales officers (MPO) on the road. ' +
    'Officers check their in-hand stock, record instant deliveries to customers, and track daily cash collection.';
  const introLines = doc.splitTextToSize(introText, 182);
  doc.text(introLines, 14, y);
  y += introLines.length * 5 + 4;

  // SECTION 2: DEFAULT LOGIN CREDENTIALS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Login accounts and access', 14, y);
  y += 6;

  doc.autoTable({
    startY: y,
    theme: 'grid',
    head: [['Role', 'User ID', 'Default PIN', 'Access Area']],
    body: [
      ['Super Admin', 'ADM-01', '1234', 'Full company access and settings'],
      ['Managing Director', 'EXE-01', '1234', 'Executive reports and financials'],
      ['Store In-charge', 'STR-01', '1234', 'Godown inventory, factory GRN, batch dates'],
      ['Senior Accountant', 'ACC-01', '1234', 'Ledger, expenses, payroll settlement'],
      ['Field Officer (Mirpur)', 'EMP-001', '1234', 'Field mobile app, in-hand stock, direct bills'],
      ['Field Officer (Dhanmondi)', 'EMP-002', '1234', 'Field mobile app, in-hand stock, direct bills'],
      ['Delivery Staff', 'DEL-01', '1234', 'Delivery dispatch, van stock handovers'],
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // SECTION 3: CORE DAILY WORKFLOWS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('3. Step by step daily operating instructions', 14, y);
  y += 7;

  const workflows = [
    {
      title: 'Step 1: Receiving stock from factory (Godown Inward)',
      desc: 'Go to Inventory > Stock Receipt. Choose the supplier, enter the factory challan number, batch number, and expiry date. Click Save. The medicines immediately enter central godown inventory.',
    },
    {
      title: 'Step 2: Issuing stock to sales officers (In-Hand Stock)',
      desc: 'Go to Staff & Stock. Click Hand Over Stock. Choose the officer and select the medicine boxes. Handed-over boxes move from godown stock to that specific employee. If an employee keeps products without selling, the system tracks it as in-hand unsold stock.',
    },
    {
      title: 'Step 3: Creating instant sales invoices and delivery challans',
      desc: 'Go to Make Bill. Select the employee who is selling, pick the medicines, enter any discount, and enter the cash received. Click Save & Print. The system automatically creates a professional PDF invoice and delivery challan.',
    },
    {
      title: 'Step 4: Field sales on mobile phones (For officers on duty)',
      desc: 'Officers open the website on their phone, tap Field App, and log in with their ID (e.g. EMP-001). They can view unsold boxes in their bag, make bills on the spot, and record customer payments.',
    },
    {
      title: 'Step 5: Handing over cash and returning unsold stock',
      desc: 'When an officer returns to office, open Staff & Stock. Click Accept Cash to log money deposited into office cash. Click Return Stock to return unsold boxes back to central godown.',
    },
  ];

  workflows.forEach((wf) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(wf.title, 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(wf.desc, 182);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 4;
  });

  // PAGE 2: DOCTORS, EXPENSES, PAYROLL, BACKUP
  doc.addPage();
  y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('4. Doctors, promotions and monthly payroll', 14, y);
  y += 7;

  const advancedWorkflows = [
    {
      title: 'Doctors directory and prescription tracking',
      desc: 'Go to Doctors. Add doctors with their degrees, chamber address, and assigned sales officer. When sales officers visit with sample medicines or promotional gifts, log the item under Log Gift. Track monthly prescription counts per doctor.',
    },
    {
      title: 'Company expenses and true net profit',
      desc: 'Go to Expenses. Record daily expenses such as warehouse rent, electricity, delivery van fuel, and office tea. The dashboard automatically subtracts factory cost (DP) and expenses from total sales (TP) to show true net profit.',
    },
    {
      title: 'Attendance and monthly salary generation',
      desc: 'Go to Attendance & Payroll. Mark daily presence with one click to calculate daily TA/DA. At the end of the month, click Generate Monthly Payroll to produce salary slips with base salary, allowances, and deductions.',
    },
    {
      title: '1-Click complete Excel backup (18 sheets)',
      desc: 'Go to Reports & Backup. Click Download 18-Sheet Excel Backup. A comprehensive .xlsx file downloads immediately with full tables for inventory, sales, expenses, staff, and ledger.',
    },
  ];

  advancedWorkflows.forEach((wf) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(wf.title, 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(wf.desc, 182);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 4;
  });

  // SECTION 5: BEGINNER FAQ & BEST PRACTICES
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('5. Practical tips for non-technical owners', 14, y);
  y += 7;

  const tips = [
    'Always download the 18-sheet Excel backup once every week for your offline safety.',
    'Keep your Supabase database credentials safe and never share your admin PIN with field staff.',
    'Before issuing medicines to staff, make sure new factory batches have been saved under Stock Receipt.',
    'On mobile devices, tap the language button at the bottom of the sidebar to switch between Bangla and English at any time.',
  ];

  tips.forEach((tip, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const text = `${idx + 1}. ${tip}`;
    const lines = doc.splitTextToSize(text, 182);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 3;
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Senatix Wellness ERP - Official Walkthrough Manual - Page ${i} of ${pageCount}`, 14, 290);
    doc.text('Confidential - For Internal Operating Use Only', 140, 290);
  }

  const outPath = path.join(__dirname, '..', 'public', 'docs', 'Senatix_ERP_Walkthrough_Guide_English.pdf');
  fs.writeFileSync(outPath, Buffer.from(doc.output('arraybuffer')));
  console.log('Saved English Walkthrough PDF to:', outPath);
}

// ----------------------------------------------------------------------------
// 2. GENERATE BANGLA PRINTABLE HTML WALKTHROUGH
// ----------------------------------------------------------------------------
function generateBanglaGuideHTML() {
  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>সেনাটিক্স ওয়েলনেস ইআরপি - ব্যবহার নির্দেশিকা ও সহায়িকা</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
      padding: 24px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .header {
      border-bottom: 2px solid #de9489;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 26px;
      color: #0f172a;
      font-weight: 700;
    }

    .header p {
      color: #64748b;
      font-size: 14px;
      margin-top: 4px;
    }

    .print-btn {
      float: right;
      background: #0f172a;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }

    .print-btn:hover {
      background: #334155;
    }

    h2 {
      font-size: 18px;
      color: #0f172a;
      margin: 24px 0 12px;
      border-left: 4px solid #de9489;
      padding-left: 10px;
    }

    p, li {
      font-size: 14px;
      color: #334155;
      margin-bottom: 8px;
    }

    ol, ul {
      margin-left: 20px;
      margin-bottom: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #0f172a;
      color: white;
    }

    .card {
      background: #f1f5f9;
      border-left: 4px solid #10b981;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin: 14px 0;
      font-size: 13px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .print-btn {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <button class="print-btn" onclick="window.print()">🖨️ PDF প্রিন্ট করুন (Ctrl + P)</button>
    
    <div class="header">
      <h1>সেনাটিক্স ওয়েলনেস ইআরপি</h1>
      <p>কোম্পানি পরিচালনা, ওষুধ ডিস্ট্রিবিউশন ও বিক্রয় সহায়িকা (সহজ বাংলা গাইড)</p>
    </div>

    <h2>১. সিস্টেম পরিচিতি</h2>
    <p>সেনাটিক্স ওয়েলনেস ইআরপি ওষুধ প্রস্তুতকারক প্রতিষ্ঠান থেকে শুরু করে মাঠপর্যায়ের বিক্রয় পর্যন্ত সম্পূর্ণ কার্যক্রম হিসাব রাখার একটি সহজ ও আধুনিক সফটওয়্যার। সিস্টেমটিতে দুইটি প্রধান অংশ রয়েছে:</p>
    <ul>
      <li><strong>হেড অফিস ও পরিচালনা ড্যাশবোর্ড:</strong> কম্পিউটার বা ল্যাপটপে মালিক, ডিরেক্টর, স্টোরকিপার ও একাউন্ট্যান্ট এটি ব্যবহার করবেন। এখানে গোডাউন স্টক, কর্মচারীদের হিসাব, খরচ ও লাভ-ক্ষতি দেখা যায়।</li>
      <li><strong>মাঠপর্যায়ের ফিল্ড অ্যাপ:</strong> মাঠপর্যায়ের সেলস অফিসারদের (MPO) জন্য মোবাইলে ব্যবহারের উপযোগী সহজ পর্দা। এখানে নিজের কাছে থাকা ওষুধ দেখা, দোকানে ওষুধ বিক্রয় এবং নগদ টাকা কালেকশন এন্ট্রি দেওয়া যায়।</li>
    </ul>

    <h2>২. লগইন আইডি ও পিন নম্বর</h2>
    <table>
      <thead>
        <tr>
          <th>পদবী ও ব্যবহারকারী</th>
          <th>আইডি</th>
          <th>পিন নম্বর</th>
          <th>ব্যবহারের স্থান</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>সুপার এডমিন (মালিক)</td>
          <td>ADM-01</td>
          <td>1234</td>
          <td>হেড অফিস ড্যাশবোর্ড</td>
        </tr>
        <tr>
          <td>ম্যানেজিং ডিরেক্টর</td>
          <td>EXE-01</td>
          <td>1234</td>
          <td>হেড অফিস ও লাভ-ক্ষতি</td>
        </tr>
        <tr>
          <td>স্টোর ইনচার্জ (গোডাউন)</td>
          <td>STR-01</td>
          <td>1234</td>
          <td>গোডাউন ইনভেন্টরি ও ব্যাচ</td>
        </tr>
        <tr>
          <td>হিসাবরক্ষক (ফাইন্যান্স)</td>
          <td>ACC-01</td>
          <td>1234</td>
          <td>খাতা, খরচ ও বেতন</td>
        </tr>
        <tr>
          <td>সেলস অফিসার (তানভীর)</td>
          <td>EMP-001</td>
          <td>1234</td>
          <td>ফিল্ড মোবাইল অ্যাপ</td>
        </tr>
        <tr>
          <td>সেলস অফিসার (সাকিব)</td>
          <td>EMP-002</td>
          <td>1234</td>
          <td>ফিল্ড মোবাইল অ্যাপ</td>
        </tr>
        <tr>
          <td>ডেলিভারি স্টাফ (রুবেল)</td>
          <td>DEL-01</td>
          <td>1234</td>
          <td>ডেলিভারি ভ্যান রুট</td>
        </tr>
      </tbody>
    </table>

    <h2>৩. প্রতিদিনের কাজের সহজ ধাপ</h2>
    <ol>
      <li><strong>ধাপ ১ (ফ্যাক্টরি থেকে নতুন ওষুধ গ্রহণ):</strong> গোডাউনে ওষুধ আসলে 'ইনভেন্টরি' মেনুতে গিয়ে 'ফ্যাক্টরি থেকে নতুন ওষুধ গ্রহণ' বাটনে চাপুন। সাপ্লায়ার, ফ্যাক্টরি চালান নম্বর, ব্যাচ নম্বর ও মেয়াদের তারিখ লিখে সেভ করুন।</li>
      <li><strong>ধাপ ২ (কর্মীদের ওষুধ বুঝিয়ে দেওয়া):</strong> 'কর্মী ও অবিক্রীত স্টক' মেনুতে গিয়ে 'ওষুধ বরাদ্দ দিন' বাটনে চাপুন। নির্দিষ্ট কর্মীকে নির্বাচন করে বক্সের সংখ্যা দিন। এই ওষুধগুলো গোডাউন থেকে কর্মীর কাছে চলে যাবে। যদি কর্মী ওষুধ সাথে রাখে কিন্তু বিক্রি না করে, তবে তা 'অবিক্রীত স্টক' হিসেবে নির্ভুলভাবে জমা থাকবে।</li>
      <li><strong>ধাপ ৩ (চালান ও বিল তৈরি):</strong> 'নতুন চালান তৈরি' মেনুতে যান। কোন কর্মী বিক্রি করছেন তা সিলেক্ট করে ওষুধের নাম ট্যাপ করুন। ক্রেতার নাম ও নগদ জমার পরিমাণ লিখে 'বিল প্রিন্ট করুন' এ চাপ দিলে সাথে সাথে পরিষ্কার চালান ও ডেলিভারি রশিদ তৈরি হয়ে যাবে।</li>
      <li><strong>ধাপ ৪ (মোবাইলে ফিল্ড সেলস):</strong> সেলস অফিসাররা তাদের নিজস্ব স্মার্টফোনে ওয়েবসাইট খুলে 'ফিল্ড অ্যাপ' এ লগইন করবেন। তারা দেখতে পাবেন তাদের ব্যাগে কত বক্স ওষুধ অবিক্রীত আছে এবং দোকানে বিক্রির সাথে সাথে চালান কাটতে পারবেন।</li>
      <li><strong>ধাপ ৫ (অফিসে নগদ টাকা জমা):</strong> দিনশেষে মাঠ থেকে কর্মী অফিসে টাকা নিয়ে আসলে 'কর্মী ও স্টক' মেনুতে 'নগদ ক্যাশ গ্রহণ' এ ক্লিক করে জমা টাকা এন্ট্রি দিন।</li>
    </ol>

    <h2>৪. ডাক্তার ভিজিট, খরচ ও বেতন</h2>
    <ul>
      <li><strong>ডাক্তার খাতা:</strong> 'ডাক্তার ও চেম্বার' মেনুতে ডাক্তারদের নাম, চেম্বারের ঠিকানা ও প্রেসক্রাইব করা ওষুধের তালিকা রাখা যায়। ডাক্তারকে স্যাম্পল ঔষধ বা উপহার দিলে 'উপহার দিন' বাটনে ক্লিক করে খরচ রেকর্ড করা যায়।</li>
      <li><strong>কোম্পানি খরচ ও লাভ:</strong> 'দৈনিক খরচ ও লাভ' মেনুতে গিয়ে গোডাউন ভাড়া, ভ্যানের তেল খরচ, বিদ্যুৎ বিল বা কর্মীদের নাস্তার খরচ লিখে রাখুন। মোট বিক্রয় থেকে ফ্যাক্টরি কেনা দাম ও খরচ বাদ দিয়ে নিট লাভ হিসাব করা হবে।</li>
      <li><strong>হাজিরা ও বেতন:</strong> 'হাজিরা ও বেতন' মেনুতে ১-ক্লিকে প্রতিদিনের হাজিরা ও টিএ/ডিএ যুক্ত হয়। মাস শেষে স্বয়ংক্রিয়ভাবে পে-স্লিপ তৈরি হয়।</li>
      <li><strong>১-ক্লিক সম্পূর্ণ ব্যাকআপ:</strong> 'রিপোর্ট ও ব্যাকআপ' মেনুতে গিয়ে 'এক্সেল ব্যাকআপ ডাউনলোড' বাটনে চাপ দিলে ১৮টি শিটসহ সম্পূর্ণ কোম্পানির ডাটা আপনার কম্পিউটারে এক্সেল ফাইলে সেভ হয়ে যাবে।</li>
    </ul>

    <div class="card">
      <strong>পরামর্শ:</strong> প্রতি সপ্তাহে অন্তত একবার এক্সেল ব্যাকআপ ডাউনলোড করে পেনড্রাইভ বা কম্পিউটারে নিরাপদ রাখুন। এটি আপনার কোম্পানির সম্পূর্ণ ডাটা আজীবন সুরক্ষিত রাখবে।
    </div>
  </div>
</body>
</html>`;

  const outHtmlPath = path.join(__dirname, '..', 'public', 'docs', 'Senatix_ERP_Walkthrough_Guide_Bangla.html');
  fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
  console.log('Saved Bangla Walkthrough HTML/Printable to:', outHtmlPath);
}

generateEnglishGuide();
generateBanglaGuideHTML();

