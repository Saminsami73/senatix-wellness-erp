import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Customer, Employee, Payroll } from '@/types/erp';

/**
 * Generate and download professional Printable PDF Invoice
 */
export function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF();

  // Company Header
  doc.setFillColor(8, 7, 16); // #080710 dark header bar
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SENATIX WELLNESS', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129); // emerald
  doc.text('MEDICINE & HEALTHCARE DISTRIBUTION ERP', 14, 21);

  doc.setTextColor(200, 200, 200);
  doc.text('Head Office: Dhaka, Bangladesh | Hotline: +880 1700-000000', 14, 27);

  // Invoice Title & Ref
  doc.setTextColor(245, 158, 11); // Gold
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MEMO / CHALLAN', 150, 15);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Invoice: ${invoice.invoice_ref}`, 150, 21);
  doc.text(`Date: ${invoice.date_only}`, 150, 27);

  // Customer & Representative Info Box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 30, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO (PHARMACY):', 18, 45);
  doc.text('SALES OFFICER:', 110, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Customer: ${invoice.customer_name || 'Direct Customer'}`, 18, 52);
  doc.text(`Phone: ${invoice.customer_phone || 'N/A'}`, 18, 58);
  doc.text(`Address: ${invoice.customer_address || 'Direct'}`, 18, 64);

  doc.text(`Officer: ${invoice.employee_name || 'N/A'} (ID: ${invoice.emp_id})`, 110, 52);
  doc.text(`Stock Source: ${invoice.stock_source === 'Employee_Stock' ? 'Field Van Stock' : 'Warehouse Direct'}`, 110, 58);
  doc.text(`Order Status: ${invoice.order_status}`, 110, 64);

  // Line Items Table
  const tableRows = (invoice.items || []).map((item, idx) => [
    idx + 1,
    item.product_name,
    item.batch_no,
    item.qty,
    item.bonus_qty > 0 ? `+${item.bonus_qty}` : '-',
    `Tk ${item.unit_price.toFixed(2)}`,
    item.discount_percent > 0 ? `${item.discount_percent}%` : '-',
    `Tk ${item.total_price.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 74,
    head: [['#', 'Medicine Item', 'Batch', 'Qty', 'Bonus', 'TP Price', 'Disc', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 59, 68], // #053B44 Senatix brand teal
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 62 },
      2: { cellWidth: 26 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 14, halign: 'center' },
      7: { cellWidth: 22, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 140;

  // Financial Summary Box
  const summaryX = 120;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(summaryX, finalY + 4, 76, 46, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  doc.text('Sub Total:', summaryX + 4, finalY + 12);
  doc.text(`Tk ${invoice.sub_total.toFixed(2)}`, 190, finalY + 12, { align: 'right' });

  doc.text(`Discount (${invoice.discount_percent}%):`, summaryX + 4, finalY + 18);
  doc.text(`- Tk ${invoice.discount_amount.toFixed(2)}`, 190, finalY + 18, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Net Payable:', summaryX + 4, finalY + 25);
  doc.text(`Tk ${invoice.net_payable.toFixed(2)}`, 190, finalY + 25, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129); // green
  doc.text(`Paid (${invoice.payment_method}):`, summaryX + 4, finalY + 32);
  doc.text(`Tk ${invoice.paid_amount.toFixed(2)}`, 190, finalY + 32, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38); // red for due
  doc.text('Current Invoice Due:', summaryX + 4, finalY + 42);
  doc.text(`Tk ${invoice.due_amount.toFixed(2)}`, 190, finalY + 42, { align: 'right' });

  // Signatures
  const signY = finalY + 68;
  doc.setDrawColor(180, 180, 180);
  doc.line(18, signY, 68, signY);
  doc.line(80, signY, 130, signY);
  doc.line(142, signY, 192, signY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Customer Signature & Seal', 22, signY + 5);
  doc.text('Delivery Officer Signature', 86, signY + 5);
  doc.text('Authorized Signature (Senatix)', 146, signY + 5);

  // Footer note
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text('Goods received in good condition. Expired/damaged items subject to company return policy.', 14, 285);
  doc.text('Powered by Senatix Wellness Distribution ERP', 150, 285);

  doc.save(`${invoice.invoice_ref}.pdf`);
}

/**
 * Generate Delivery Challan / Packing Slip PDF
 */
export function generateDeliveryChallanPDF(invoice: Invoice) {
  const doc = new jsPDF();

  doc.setFillColor(8, 7, 16);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SENATIX WELLNESS - DELIVERY CHALLAN', 14, 14);

  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text(`CHALLAN REF: CHL-${invoice.invoice_ref.replace('INV-', '')} | Date: ${invoice.date_only}`, 14, 22);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Deliver To: ${invoice.customer_name || 'N/A'}`, 14, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`Address: ${invoice.customer_address || 'Direct'}`, 14, 44);
  doc.text(`Phone: ${invoice.customer_phone || 'N/A'}`, 14, 50);

  const tableRows = (invoice.items || []).map((item, idx) => [
    idx + 1,
    item.product_name,
    item.batch_no,
    item.qty,
    item.bonus_qty > 0 ? `+${item.bonus_qty}` : '-',
    'Box Checked [   ]',
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['#', 'Item Name', 'Batch', 'Billed Qty', 'Bonus Qty', 'Warehouse Inspection']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 59, 68],
      textColor: 255,
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 130;
  doc.setFontSize(9);
  doc.text('Store Keeper Signature: __________________', 14, finalY + 30);
  doc.text('Delivered By (Van/Staff): __________________', 80, finalY + 30);
  doc.text('Receiver Shop Seal: __________________', 145, finalY + 30);

  doc.save(`Challan_${invoice.invoice_ref}.pdf`);
}

/**
 * Generate Customer / Pharmacy Statement PDF
 */
export function generatePharmacyStatementPDF(customer: Customer, invoices: Invoice[]) {
  const doc = new jsPDF();

  doc.setFillColor(8, 7, 16);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SENATIX WELLNESS - PHARMACY STATEMENT', 14, 14);

  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11);
  doc.text(`STATEMENT AS OF: ${new Date().toISOString().split('T')[0]}`, 14, 22);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Pharmacy: ${customer.shop_name} (Code: ${customer.customer_code})`, 14, 38);
  doc.text(`Owner: ${customer.owner_name || 'N/A'} | Phone: ${customer.phone}`, 14, 44);
  doc.text(`Credit Limit: Tk ${customer.credit_limit.toLocaleString()} | Current Total Due: Tk ${customer.current_due_balance.toLocaleString()}`, 14, 50);

  const rows = invoices.map((inv) => [
    inv.date_only,
    inv.invoice_ref,
    `Tk ${inv.net_payable.toFixed(2)}`,
    `Tk ${inv.paid_amount.toFixed(2)}`,
    `Tk ${inv.due_amount.toFixed(2)}`,
    inv.payment_status,
  ]);

  autoTable(doc, {
    startY: 56,
    head: [['Date', 'Invoice Ref', 'Net Billed', 'Paid', 'Current Due', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 59, 68],
      textColor: 255,
    },
  });

  doc.save(`Statement_${customer.customer_code}.pdf`);
}

/**
 * Generate Monthly Payslip PDF
 */
export function generatePayslipPDF(payroll: Payroll, employee: Employee) {
  const doc = new jsPDF();

  doc.setFillColor(8, 7, 16);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SENATIX WELLNESS - SALARY PAYSLIP', 14, 15);

  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text(`Salary Month: ${payroll.salary_month} | Status: ${payroll.payment_status}`, 14, 23);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Employee Name: ${employee.name} (${employee.emp_id})`, 14, 40);
  doc.text(`Designation: ${employee.designation} | Phone: ${employee.phone}`, 14, 46);

  const salaryDetails = [
    ['Base Monthly Salary', `Tk ${payroll.base_salary.toFixed(2)}`],
    ['Total Daily TA/DA Earned', `+ Tk ${payroll.total_ta_da_earned.toFixed(2)}`],
    ['Sales Commission Bonus', `+ Tk ${payroll.sales_commission_earned.toFixed(2)}`],
    ['Festival / Performance Bonus', `+ Tk ${payroll.festival_or_extra_bonus.toFixed(2)}`],
    ['Salary Advance Deducted', `- Tk ${payroll.advance_salary_deducted.toFixed(2)}`],
    ['Net Salary Payable', `Tk ${payroll.net_salary_payable.toFixed(2)}`],
  ];

  autoTable(doc, {
    startY: 54,
    head: [['Salary Head', 'Amount']],
    body: salaryDetails,
    theme: 'striped',
    headStyles: {
      fillColor: [5, 59, 68],
      textColor: 255,
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 130;
  doc.setFontSize(9);
  doc.text('Employee Signature: __________________', 20, finalY + 40);
  doc.text('Managing Director / Executor Signature: __________________', 110, finalY + 40);

  doc.save(`Payslip_${payroll.salary_month}_${employee.emp_id}.pdf`);
}
