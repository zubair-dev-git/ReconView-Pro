import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ColumnMapping, RawRow } from '../types';

export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  sl: 'SL',
  po: 'PO',
  item: 'Item',
  challan: 'Challan #',
  text: 'Text',
  quantity: 'Quantity',
  unit: 'Unit',
  unitPrice: 'Unit Price',
  amount: 'Amount',
};

// Normalize header string for fuzzy matching
export function normalizeKey(key: string): string {
  return (key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Clean number parser
export function parseNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim().replace(/,/g, '').replace(/[$₹৳€£]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

// Auto-detect header mappings
export function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    sl: '',
    po: '',
    item: '',
    challan: '',
    text: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    amount: '',
  };

  const normHeaders = headers.map(h => ({ raw: h, norm: normalizeKey(h) }));

  for (const { raw, norm } of normHeaders) {
    if (!mapping.sl && (norm === 'sl' || norm === 'sno' || norm === 'serialno' || norm === 'sno.' || norm === 'srno' || norm === 'no')) {
      mapping.sl = raw;
    } else if (!mapping.po && (norm === 'po' || norm === 'pono' || norm === 'ponumber' || norm === 'purchaseorder' || norm === 'orderno')) {
      mapping.po = raw;
    } else if (!mapping.item && (norm === 'item' || norm === 'itemcode' || norm === 'itemno' || norm === 'material' || norm === 'partno' || norm === 'itemname')) {
      mapping.item = raw;
    } else if (!mapping.challan && (norm.includes('challan') || norm.includes('deliverynote') || norm.includes('dcno') || norm.includes('invoiceno') || norm === 'invoice' || norm === 'dc')) {
      mapping.challan = raw;
    } else if (!mapping.text && (norm === 'text' || norm === 'description' || norm === 'itemdescription' || norm === 'remarks' || norm === 'itemtext' || norm === 'details' || norm === 'specification')) {
      mapping.text = raw;
    } else if (!mapping.unitPrice && (norm === 'unitprice' || norm === 'rate' || norm === 'unitrate' || norm === 'price' || norm === 'priceperunit' || norm === 'cost')) {
      mapping.unitPrice = raw;
    } else if (!mapping.quantity && (norm === 'quantity' || norm === 'qty' || norm === 'qnty' || norm === 'count' || norm === 'quantities')) {
      mapping.quantity = raw;
    } else if (!mapping.unit && (norm === 'unit' || norm === 'uom' || norm === 'unitofmeasure' || norm === 'units')) {
      mapping.unit = raw;
    } else if (!mapping.amount && (norm === 'amount' || norm === 'totalamount' || norm === 'total' || norm === 'amt' || norm === 'linetotal' || norm === 'totalprice' || norm === 'value')) {
      mapping.amount = raw;
    }
  }

  // Fallback defaults if exact header match existed
  headers.forEach(h => {
    const norm = normalizeKey(h);
    if (!mapping.sl && norm === 'sl') mapping.sl = h;
    if (!mapping.po && norm === 'po') mapping.po = h;
    if (!mapping.item && norm === 'item') mapping.item = h;
    if (!mapping.challan && norm.includes('challan')) mapping.challan = h;
    if (!mapping.text && norm === 'text') mapping.text = h;
    if (!mapping.quantity && norm === 'quantity') mapping.quantity = h;
    if (!mapping.unit && norm === 'unit') mapping.unit = h;
    if (!mapping.unitPrice && norm.includes('unitprice')) mapping.unitPrice = h;
    if (!mapping.amount && norm === 'amount') mapping.amount = h;
  });

  return mapping;
}

// Convert parsed records using mapping
export function mapRecordsToRawRows(records: Record<string, unknown>[], mapping: ColumnMapping): RawRow[] {
  return records
    .filter(rec => {
      // Must have at least some meaningful value
      return Object.values(rec).some(v => v !== null && v !== undefined && String(v).trim() !== '');
    })
    .map((rec, idx) => {
      const slVal = mapping.sl ? rec[mapping.sl] : idx + 1;
      const poVal = mapping.po ? String(rec[mapping.po] || '').trim() : '';
      const itemVal = mapping.item ? String(rec[mapping.item] || '').trim() : '';
      const challanVal = mapping.challan ? String(rec[mapping.challan] || '').trim() : '';
      const textVal = mapping.text ? String(rec[mapping.text] || '').trim() : '';
      const unitVal = mapping.unit ? String(rec[mapping.unit] || '').trim().toUpperCase() : 'PCS';
      const quantityVal = mapping.quantity ? parseNumber(rec[mapping.quantity]) : 0;
      const unitPriceVal = mapping.unitPrice ? parseNumber(rec[mapping.unitPrice]) : 0;
      
      let amountVal = mapping.amount ? parseNumber(rec[mapping.amount]) : 0;
      if (amountVal === 0 && quantityVal > 0 && unitPriceVal > 0) {
        amountVal = +(quantityVal * unitPriceVal).toFixed(2);
      }

      return {
        id: `raw-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
        sl: slVal ? String(slVal) : idx + 1,
        po: poVal || 'N/A',
        item: itemVal || 'N/A',
        challan: challanVal || 'N/A',
        text: textVal || '-',
        quantity: quantityVal,
        unit: unitVal || 'PCS',
        unitPrice: unitPriceVal,
        amount: amountVal,
        isChecked: false,
      };
    });
}

// Parse CSV/TSV File or Raw Text
export function parseCSVText(csvContent: string): { headers: string[]; records: Record<string, unknown>[] } {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  const seen = new Map<string, number>();
  const headers = (result.meta.fields || []).map((h, idx) => {
    const raw = (h || '').trim() || `Column_${idx + 1}`;
    const count = seen.get(raw) || 0;
    seen.set(raw, count + 1);
    return count > 0 ? `${raw}_${count + 1}` : raw;
  });

  const records = result.data as Record<string, unknown>[];
  return { headers, records };
}

// Parse Excel Buffer / ArrayBuffer
export function parseExcelBuffer(buffer: ArrayBuffer): { headers: string[]; records: Record<string, unknown>[] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawJson = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
  });

  if (!rawJson || rawJson.length === 0) {
    return { headers: [], records: [] };
  }

  // Find header row (first non-empty array)
  let headerIndex = 0;
  for (let i = 0; i < rawJson.length; i++) {
    const row = rawJson[i];
    if (Array.isArray(row) && row.some(cell => String(cell || '').trim().length > 0)) {
      headerIndex = i;
      break;
    }
  }

  const seenHeaders = new Map<string, number>();
  const rawHeaders = (rawJson[headerIndex] || []).map((h, i) => {
    const raw = String(h || '').trim() || `Column_${i + 1}`;
    const count = seenHeaders.get(raw) || 0;
    seenHeaders.set(raw, count + 1);
    return count > 0 ? `${raw}_${count + 1}` : raw;
  });

  const records: Record<string, unknown>[] = [];
  for (let i = headerIndex + 1; i < rawJson.length; i++) {
    const row = rawJson[i];
    if (!Array.isArray(row)) continue;
    
    const record: Record<string, unknown> = {};
    let hasData = false;
    
    rawHeaders.forEach((header, colIdx) => {
      const val = row[colIdx];
      record[header] = val;
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        hasData = true;
      }
    });

    if (hasData) {
      records.push(record);
    }
  }

  return { headers: rawHeaders, records };
}
