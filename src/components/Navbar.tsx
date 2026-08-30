import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckSquare,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Layers,
  Palette,
  Printer,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { ExtractedRow, ThemeId } from '../types';
import { groupExtractedByChallan } from '../utils/aggregator';
import {
  exportChallanAuditToExcel,
  exportExtractedToExcel,
  exportToCSV,
} from '../utils/exporter';
import { THEMES } from '../utils/theme';

interface NavbarProps {
  rawRowCount: number;
  extractedRows: ExtractedRow[];
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onClearData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  rawRowCount,
  extractedRows,
  currentTheme,
  onSelectTheme,
  onOpenUpload,
  onLoadSample,
  onClearData,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleExportExcel = () => {
    exportExtractedToExcel(extractedRows);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportToCSV(extractedRows);
    setShowExportMenu(false);
  };

  const handleExportChallanAudit = () => {
    const groups = groupExtractedByChallan(extractedRows);
    exportChallanAuditToExcel(groups);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
    setShowExportMenu(false);
  };

  const verifiedCount = extractedRows.filter(r => r.isChecked).length;
  const activeThemeDef = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <header
      id="app-header"
      className="h-16 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-30 shadow-sm transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-header-bg)',
        borderBottom: '1px solid var(--theme-header-border)',
        color: '#ffffff',
      }}
    >
      {/* App Identity */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0 transition-colors duration-200"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <Layers className="w-4.5 h-4.5" />
        </div>
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
          ReconView Pro
        </h1>
      </div>

      {/* Action Controls & Data Status */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium">
        {rawRowCount > 0 ? (
          <div className="hidden lg:flex items-center gap-2 text-slate-300 text-xs">
            <span>Data Source:</span>
            <span
              className="font-medium px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
              }}
            >
              {rawRowCount} Records ({verifiedCount}/{extractedRows.length} Reconciled)
            </span>
          </div>
        ) : (
          <span className="hidden lg:inline text-slate-400 text-xs">No dataset loaded</span>
        )}

        {/* Theme Switcher Button & Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            id="btn-theme-switcher"
            type="button"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded border transition-colors shadow-xs"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            }}
            title="Switch Visual Theme"
          >
            <Palette className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
            <span className="hidden sm:inline">{activeThemeDef.name}</span>
            <div className="flex items-center gap-1 ml-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/40"
                style={{ backgroundColor: activeThemeDef.primaryColor }}
              />
              <ChevronDown className="w-3 h-3 text-white/70" />
            </div>
          </button>

          {showThemeMenu && (
            <div
              id="theme-dropdown-menu"
              className="absolute right-0 mt-2 w-72 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Visual Themes</span>
                  <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    5 Professional Schemes
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select a tailored theme for your auditing and reconciliation workflow.
                </p>
              </div>

              <div className="space-y-1 px-1.5">
                {THEMES.map(theme => {
                  const isSelected = theme.id === currentTheme;
                  return (
                    <button
                      key={theme.id}
                      id={`theme-option-${theme.id}`}
                      type="button"
                      onClick={() => {
                        onSelectTheme(theme.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-start justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-slate-100 text-slate-900 font-semibold ring-1 ring-slate-300'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {/* Swatch preview dots */}
                        <div className="flex items-center gap-0.5 mt-0.5 flex-shrink-0">
                          {theme.swatches.map((color, idx) => (
                            <span
                              key={idx}
                              className="w-2.5 h-4 rounded-xs border border-black/10 shadow-2xs"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {theme.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {theme.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
                            {theme.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Load Sample Data button */}
        <button
          id="btn-load-sample"
          type="button"
          onClick={onLoadSample}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.16)',
            color: '#ffffff',
          }}
          title="Load realistic sample data"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Sample Dataset</span>
        </button>

        {/* Upload Data Button */}
        <button
          id="btn-open-upload"
          type="button"
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-white rounded text-xs sm:text-sm font-medium transition-all shadow-sm"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Dataset</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            id="btn-export-menu"
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={extractedRows.length === 0}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border rounded transition-colors ${
              extractedRows.length === 0
                ? 'opacity-40 cursor-not-allowed border-white/10 text-white/40'
                : 'border-white/20 text-white hover:bg-white/10'
            }`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-white/70" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={handleExportExcel}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-900">Extracted Table (.xlsx)</div>
                  <div className="text-[10px] text-slate-400">Aggregated with computed sums</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportChallanAudit}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900">Challan Audit Report (.xlsx)</div>
                  <div className="text-[10px] text-slate-400">Organized by delivery notes</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-800">Export CSV Data</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-600"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print Table</span>
              </button>
            </div>
          )}
        </div>

        {rawRowCount > 0 && (
          <button
            id="btn-clear-all-data"
            type="button"
            onClick={onClearData}
            title="Clear all dataset records"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-rose-200 hover:text-white bg-rose-950/40 hover:bg-rose-900/80 border border-rose-800/60 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Clear</span>
          </button>
        )}
      </div>
    </header>
  );
};

