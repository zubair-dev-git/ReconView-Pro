import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { ColumnMapping, RawRow } from '../types';
import {
  autoDetectMapping,
  DEFAULT_COLUMN_MAPPING,
  mapRecordsToRawRows,
  parseCSVText,
  parseExcelBuffer,
} from '../utils/parser';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: RawRow[], mode: 'replace' | 'append') => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState<string>('');
  
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRecords, setRawRecords] = useState<Record<string, unknown>[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(DEFAULT_COLUMN_MAPPING);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);

    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const parsed = parseExcelBuffer(buffer);
        if (parsed.records.length === 0) {
          setErrorMsg('No data rows found in the uploaded Excel spreadsheet.');
          return;
        }
        setHeaders(parsed.headers);
        setRawRecords(parsed.records);
        setColumnMapping(autoDetectMapping(parsed.headers));
      } else {
        const text = await file.text();
        const parsed = parseCSVText(text);
        if (parsed.records.length === 0) {
          setErrorMsg('No data rows found in the uploaded file.');
          return;
        }
        setHeaders(parsed.headers);
        setRawRecords(parsed.records);
        setColumnMapping(autoDetectMapping(parsed.headers));
      }
    } catch (err: unknown) {
      console.error('File parsing error:', err);
      setErrorMsg('Failed to parse file. Please verify the format (.xlsx, .xls, .csv).');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    setErrorMsg(null);
    if (!pasteText.trim()) {
      setErrorMsg('Please paste table data from Excel or Google Sheets.');
      return;
    }

    try {
      const parsed = parseCSVText(pasteText);
      if (parsed.records.length === 0) {
        setErrorMsg('Could not parse any rows from the pasted text.');
        return;
      }
      setFileName('Pasted Data');
      setHeaders(parsed.headers);
      setRawRecords(parsed.records);
      setColumnMapping(autoDetectMapping(parsed.headers));
    } catch (err) {
      setErrorMsg('Error parsing pasted data. Make sure first line contains headers.');
    }
  };

  const handleConfirmImport = () => {
    if (rawRecords.length === 0) {
      setErrorMsg('No records to import.');
      return;
    }
    const processedRows = mapRecordsToRawRows(rawRecords, columnMapping);
    if (processedRows.length === 0) {
      setErrorMsg('No valid rows produced with current column mapping.');
      return;
    }

    onImport(processedRows, importMode);
    onClose();
    resetState();
  };

  const resetState = () => {
    setHeaders([]);
    setRawRecords([]);
    setPasteText('');
    setFileName('');
    setErrorMsg(null);
  };

  const hasData = rawRecords.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center text-white">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Upload &amp; Extract Data
              </h3>
              <p className="text-xs text-slate-500">
                Expected columns: SL, PO, Item, Challan #, Text, Quantity, Unit, Unit Price, Amount
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              resetState();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!hasData ? (
            <div>
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'file'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Upload Spreadsheet (.xlsx, .xls, .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'paste'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Copied Table</span>
                </button>
              </div>

              {activeTab === 'file' ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-slate-900">
                    Drag and drop your Excel or CSV file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Supports .xlsx, .xls, .csv, or .tsv files
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Browse File</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.tsv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Copy columns from your Excel / Google Sheets spreadsheet and paste below (with header row):
                  </p>
                  <textarea
                    rows={7}
                    placeholder="SL&#9;PO&#9;Item&#9;Challan #&#9;Text&#9;Quantity&#9;Unit&#9;Unit Price&#9;Amount&#10;1&#9;PO-2024-01&#9;ITM-01&#9;CH-88210&#9;Steel Angles&#9;120&#9;PCS&#9;45.50&#9;5460.00"
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handlePasteSubmit}
                      className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-xs"
                    >
                      Process Pasted Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900">
                    {fileName} ({rawRecords.length} records parsed)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="text-xs text-blue-700 hover:underline font-semibold"
                >
                  Choose Different File
                </button>
              </div>

              {/* Column Mapping Step */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Verify Column Mapping
                  </span>
                  <span className="text-xs text-slate-500">
                    Matches your file headers to system fields
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  {/* PO */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      PO <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={columnMapping.po}
                      onChange={e => setColumnMapping({ ...columnMapping, po: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`po-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Challan # */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Challan # <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={columnMapping.challan}
                      onChange={e => setColumnMapping({ ...columnMapping, challan: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`ch-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Text */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Text (Description) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={columnMapping.text}
                      onChange={e => setColumnMapping({ ...columnMapping, text: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`txt-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Unit (UOM) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={columnMapping.unit}
                      onChange={e => setColumnMapping({ ...columnMapping, unit: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`unit-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Quantity <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={columnMapping.quantity}
                      onChange={e => setColumnMapping({ ...columnMapping, quantity: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`qty-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Unit Price
                    </label>
                    <select
                      value={columnMapping.unitPrice}
                      onChange={e => setColumnMapping({ ...columnMapping, unitPrice: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`price-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Amount
                    </label>
                    <select
                      value={columnMapping.amount}
                      onChange={e => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`amt-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* SL */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      SL (Serial No)
                    </label>
                    <select
                      value={columnMapping.sl}
                      onChange={e => setColumnMapping({ ...columnMapping, sl: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`sl-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Item */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Item (Item Code)
                    </label>
                    <select
                      value={columnMapping.item}
                      onChange={e => setColumnMapping({ ...columnMapping, item: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    >
                      <option value="">-- Select Header --</option>
                      {headers.map((h, idx) => (
                        <option key={`item-hdr-${h}-${idx}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Import Mode */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <span className="font-semibold text-slate-900">Import Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Replace existing dataset</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Append to existing dataset</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              resetState();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            Cancel
          </button>
          {hasData && (
            <button
              id="confirm-import-btn"
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-xs"
            >
              Import &amp; Extract Data ({rawRecords.length} Rows)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
