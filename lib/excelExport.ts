import * as XLSX from 'xlsx';

/**
 * Senatix Wellness 1-Click Multi-Sheet Company Backup Engine
 * Exports all 18 tables into a single organized .xlsx workbook.
 */
export function exportFullCompanyBackup(databaseData: Record<string, any[]>) {
  const wb = XLSX.utils.book_new();

  const tableOrder = [
    'invoices',
    'sales',
    'products',
    'product_batches',
    'customers',
    'employees',
    'markets',
    'suppliers',
    'purchases',
    'purchase_items',
    'emp_stock',
    'stock_transfers',
    'sales_returns',
    'damaged_expired_stock',
    'ledger',
    'expenses',
    'attendance',
    'payroll',
  ];

  tableOrder.forEach((tableName) => {
    const rows = databaseData[tableName] || [];
    // Clean rows (remove internal complex objects if any)
    const sanitizedRows = rows.map((row) => {
      const clean: Record<string, any> = {};
      Object.entries(row).forEach(([key, val]) => {
        if (typeof val === 'object' && val !== null) {
          clean[key] = JSON.stringify(val);
        } else {
          clean[key] = val;
        }
      });
      return clean;
    });

    const ws = XLSX.utils.json_to_sheet(sanitizedRows.length > 0 ? sanitizedRows : [{ Info: 'No records found' }]);
    XLSX.utils.book_append_sheet(wb, ws, tableName.slice(0, 31)); // Excel max sheet name is 31 chars
  });

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `Senatix_Backup_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export any single table or array of records to Excel
 */
export function exportSingleTableToExcel(data: any[], fileName: string, sheetName: string = 'Data') {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data.length > 0 ? data : [{ Info: 'No data' }]);
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
