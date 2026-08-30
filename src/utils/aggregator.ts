import { ChallanGroup, ExtractedRow, FilterState, RawRow } from '../types';

export function makeGroupKey(po: string, challan: string, unit: string, text: string): string {
  const normPo = (po || '').trim().toUpperCase();
  const normChallan = (challan || '').trim().toUpperCase();
  const normUnit = (unit || '').trim().toUpperCase();
  const normText = (text || '').trim().toLowerCase();
  return `${normPo}___${normChallan}___${normUnit}___${normText}`;
}

export function aggregateRawRows(rawRows: RawRow[], checkedRowIds: Set<string>): ExtractedRow[] {
  const map = new Map<string, {
    po: string;
    unit: string;
    challan: string;
    text: string;
    sumUnitPrice: number;
    sumQuantity: number;
    sumAmount: number;
    rawRowIds: string[];
    rawRows: RawRow[];
  }>();

  rawRows.forEach(row => {
    const key = makeGroupKey(row.po, row.challan, row.unit, row.text);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        po: row.po || 'N/A',
        unit: (row.unit || 'PCS').toUpperCase(),
        challan: row.challan || 'N/A',
        text: row.text || '-',
        sumUnitPrice: Number(row.unitPrice || 0),
        sumQuantity: Number(row.quantity || 0),
        sumAmount: Number(row.amount || 0),
        rawRowIds: [row.id],
        rawRows: [row],
      });
    } else {
      existing.sumUnitPrice += Number(row.unitPrice || 0);
      existing.sumQuantity += Number(row.quantity || 0);
      existing.sumAmount += Number(row.amount || 0);
      existing.rawRowIds.push(row.id);
      existing.rawRows.push(row);
    }
  });

  const extracted: ExtractedRow[] = [];

  map.forEach((value, key) => {
    const isChecked = checkedRowIds.has(key);
    extracted.push({
      id: key,
      po: value.po,
      unit: value.unit,
      challan: value.challan,
      text: value.text,
      sumUnitPrice: Number(value.sumUnitPrice.toFixed(2)),
      sumQuantity: Number(value.sumQuantity.toFixed(2)),
      sumAmount: Number(value.sumAmount.toFixed(2)),
      rawRowCount: value.rawRows.length,
      rawRowIds: value.rawRowIds,
      rawRows: value.rawRows,
      isChecked,
    });
  });

  // Sort by Challan, then PO, then Text
  return extracted.sort((a, b) => {
    if (a.challan !== b.challan) return a.challan.localeCompare(b.challan, undefined, { numeric: true });
    if (a.po !== b.po) return a.po.localeCompare(b.po, undefined, { numeric: true });
    return a.text.localeCompare(b.text);
  });
}

// Group extracted rows by Challan for Challan-wise inspection view
export function groupExtractedByChallan(extractedRows: ExtractedRow[]): ChallanGroup[] {
  const map = new Map<string, ExtractedRow[]>();

  extractedRows.forEach(row => {
    const list = map.get(row.challan) || [];
    list.push(row);
    map.set(row.challan, list);
  });

  const challanGroups: ChallanGroup[] = [];

  map.forEach((rows, challan) => {
    const poSet = new Set<string>();
    const unitSet = new Set<string>();
    let totalQty = 0;
    let totalAmt = 0;
    let totalUnitPrice = 0;
    let checkedCount = 0;

    rows.forEach(r => {
      poSet.add(r.po);
      unitSet.add(r.unit);
      totalQty += r.sumQuantity;
      totalAmt += r.sumAmount;
      totalUnitPrice += r.sumUnitPrice;
      if (r.isChecked) checkedCount++;
    });

    challanGroups.push({
      challan,
      poList: Array.from(poSet),
      units: Array.from(unitSet),
      totalQuantity: Number(totalQty.toFixed(2)),
      totalAmount: Number(totalAmt.toFixed(2)),
      totalUnitPriceSum: Number(totalUnitPrice.toFixed(2)),
      extractedRowCount: rows.length,
      checkedRowCount: checkedCount,
      isFullyChecked: checkedCount === rows.length && rows.length > 0,
      extractedRows: rows,
    });
  });

  return challanGroups.sort((a, b) => a.challan.localeCompare(b.challan, undefined, { numeric: true }));
}

// Filter extracted rows based on criteria
export function filterExtractedRows(rows: ExtractedRow[], filters: FilterState): ExtractedRow[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return rows.filter(row => {
    // 1. Text / Global search
    if (query) {
      const matchSearch =
        row.po.toLowerCase().includes(query) ||
        row.challan.toLowerCase().includes(query) ||
        row.text.toLowerCase().includes(query) ||
        row.unit.toLowerCase().includes(query) ||
        row.sumAmount.toString().includes(query) ||
        row.sumQuantity.toString().includes(query) ||
        row.rawRows.some(r => r.item.toLowerCase().includes(query));

      if (!matchSearch) return false;
    }

    // 2. PO Filter
    if (filters.selectedPOs.length > 0 && !filters.selectedPOs.includes(row.po)) {
      return false;
    }

    // 3. Challan Filter
    if (filters.selectedChallans.length > 0 && !filters.selectedChallans.includes(row.challan)) {
      return false;
    }

    // 4. Unit Filter
    if (filters.selectedUnits.length > 0 && !filters.selectedUnits.includes(row.unit)) {
      return false;
    }

    // 5. Verification / Strikethrough Status
    if (filters.verificationStatus === 'verified' && !row.isChecked) return false;
    if (filters.verificationStatus === 'pending' && row.isChecked) return false;

    // 6. Quantity Range
    if (filters.minQuantity !== '' && row.sumQuantity < Number(filters.minQuantity)) return false;
    if (filters.maxQuantity !== '' && row.sumQuantity > Number(filters.maxQuantity)) return false;

    // 7. Amount Range
    if (filters.minAmount !== '' && row.sumAmount < Number(filters.minAmount)) return false;
    if (filters.maxAmount !== '' && row.sumAmount > Number(filters.maxAmount)) return false;

    return true;
  });
}
