import * as XLSX from 'xlsx';
import { ChallanGroup, ExtractedRow, RawRow } from '../types';

export function exportExtractedToExcel(extractedRows: ExtractedRow[], fileName = 'Extracted_Challan_PO_Data.xlsx') {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Extracted Summary
  const summaryData = extractedRows.map((row, idx) => ({
    'SL #': idx + 1,
    'PO': row.po,
    'Unit': row.unit,
    'Challan #': row.challan,
    'Text': row.text,
    'Sum of Unit Price': row.sumUnitPrice,
    'Sum of Quantity': row.sumQuantity,
    'Sum of Amount': row.sumAmount,
    'Raw Items Count': row.rawRowCount,
    'Verification Status': row.isChecked ? 'VERIFIED (Checked)' : 'PENDING',
  }));

  // Add Totals row
  const totalUnitPrice = extractedRows.reduce((acc, r) => acc + r.sumUnitPrice, 0);
  const totalQty = extractedRows.reduce((acc, r) => acc + r.sumQuantity, 0);
  const totalAmt = extractedRows.reduce((acc, r) => acc + r.sumAmount, 0);

  summaryData.push({
    'SL #': 'TOTAL' as unknown as number,
    'PO': '',
    'Unit': '',
    'Challan #': '',
    'Text': `Total ${extractedRows.length} Groups`,
    'Sum of Unit Price': Number(totalUnitPrice.toFixed(2)),
    'Sum of Quantity': Number(totalQty.toFixed(2)),
    'Sum of Amount': Number(totalAmt.toFixed(2)),
    'Raw Items Count': extractedRows.reduce((acc, r) => acc + r.rawRowCount, 0),
    'Verification Status': `${extractedRows.filter(r => r.isChecked).length}/${extractedRows.length} Verified`,
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Extracted Summary');

  XLSX.writeFile(wb, fileName);
}

export function exportChallanAuditToExcel(challanGroups: ChallanGroup[], fileName = 'Challan_Wise_Audit_Report.xlsx') {
  const wb = XLSX.utils.book_new();

  const auditData: Record<string, unknown>[] = [];
  challanGroups.forEach(group => {
    group.extractedRows.forEach(row => {
      auditData.push({
        'Challan #': group.challan,
        'PO': row.po,
        'Unit': row.unit,
        'Text (Description)': row.text,
        'Sum of Unit Price': row.sumUnitPrice,
        'Sum of Quantity': row.sumQuantity,
        'Sum of Amount': row.sumAmount,
        'Raw Items Count': row.rawRowCount,
        'Challan Status': group.isFullyChecked ? 'ALL CHECKED' : `${group.checkedRowCount}/${group.extractedRowCount} Checked`,
        'Line Status': row.isChecked ? 'VERIFIED' : 'PENDING',
      });
    });
  });

  const wsAudit = XLSX.utils.json_to_sheet(auditData);
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Challan Audit');

  XLSX.writeFile(wb, fileName);
}

export function exportRawRowsToExcel(rawRows: RawRow[], fileName = 'Raw_Uploaded_Data.xlsx') {
  const wb = XLSX.utils.book_new();
  const data = rawRows.map(r => ({
    'SL': r.sl,
    'PO': r.po,
    'Item': r.item,
    'Challan #': r.challan,
    'Text': r.text,
    'Quantity': r.quantity,
    'Unit': r.unit,
    'Unit Price': r.unitPrice,
    'Amount': r.amount,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Raw Data');
  XLSX.writeFile(wb, fileName);
}

export function exportToCSV(extractedRows: ExtractedRow[], fileName = 'Extracted_Data.csv') {
  const headers = ['PO', 'Unit', 'Challan #', 'Text', 'Sum of Unit Price', 'Sum of Quantity', 'Sum of Amount', 'Status'];
  const rows = extractedRows.map(r => [
    `"${r.po.replace(/"/g, '""')}"`,
    `"${r.unit.replace(/"/g, '""')}"`,
    `"${r.challan.replace(/"/g, '""')}"`,
    `"${r.text.replace(/"/g, '""')}"`,
    r.sumUnitPrice,
    r.sumQuantity,
    r.sumAmount,
    r.isChecked ? 'Verified' : 'Pending',
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
