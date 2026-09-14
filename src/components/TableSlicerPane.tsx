import React, { useState, useMemo } from 'react';
import {
  Table,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Columns3,
  ArrowRight,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from 'lucide-react';
import { detectTable, extractColumnFromTable, columnToDelimited } from '../lib/engine';
import { QuoteStyle } from '../types';

interface TableSlicerPaneProps {
  initialData?: string;
  onSendToDelim?: (extracted: string) => void;
}

const SAMPLE_SPREADSHEET = `ID\tCustomer Name\tEmail\tCountry\tPlan
1001\tAlice Johnson\talice@datadog.com\tUnited States\tEnterprise
1002\tBob Smith\tbob@uber.com\tUnited Kingdom\tPro
1003\tCharlie Brown\tcharlie@spotify.com\tSweden\tFree
1004\tDiana Prince\tdiana@amazon.com\tUnited States\tEnterprise
1005\tEvan Wright\tevan@stripe.com\tIreland\tPro`;

export const TableSlicerPane: React.FC<TableSlicerPaneProps> = ({
  initialData = '',
  onSendToDelim,
}) => {
  const [rawText, setRawText] = useState(initialData || SAMPLE_SPREADSHEET);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(2); // Default to Email
  const [skipHeader, setSkipHeader] = useState<boolean>(true);
  const [outputDelim, setOutputDelim] = useState<string>(', ');
  const [outputQuotes, setOutputQuotes] = useState<QuoteStyle>('single');
  const [deduplicate, setDeduplicate] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-detect table structure
  const tableInfo = useMemo(() => {
    return detectTable(rawText);
  }, [rawText]);

  // Extract selected column
  const extractedList = useMemo(() => {
    if (!tableInfo.isTable) return [];
    return extractColumnFromTable(rawText, selectedColumnIndex, skipHeader, tableInfo.delimiter);
  }, [rawText, selectedColumnIndex, skipHeader, tableInfo]);

  // Format extracted column with options
  const formattedOutput = useMemo(() => {
    if (extractedList.length === 0) return '';
    const asNewlines = extractedList.join('\n');
    return columnToDelimited(asNewlines, {
      delimiter: outputDelim,
      quotes: outputQuotes,
      deduplicate,
      trimWhitespace: true,
      skipEmpty: true,
    });
  }, [extractedList, outputDelim, outputQuotes, deduplicate]);

  const handleCopy = async () => {
    if (!formattedOutput) return;
    await navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!formattedOutput) return;
    const blob = new Blob([formattedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const colName = tableInfo.headers[selectedColumnIndex] || `col-${selectedColumnIndex + 1}`;
    link.download = `extracted-${colName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setRawText(SAMPLE_SPREADSHEET);
    setSelectedColumnIndex(2);
  };

  return (
    <div className="space-y-3.5">
      {/* Configuration & Slicer Status Bar */}
      <div className="bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Table Detection Status */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {tableInfo.isTable
                    ? `Table Detected (${tableInfo.columnCount} Columns, ${tableInfo.totalRows} Rows)`
                    : 'Paste Tabular / Spreadsheet Data'}
                </span>
                {tableInfo.isTable && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {tableInfo.delimiterName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pasted Excel, TSV, CSV, or pipe-separated tables are parsed automatically
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {!rawText && (
              <button
                type="button"
                onClick={loadSample}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-obsidian-800 select-none"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Sample Table</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setRawText('')}
              disabled={!rawText}
              title="Clear table data"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Slicer Column Selector Strip */}
        {tableInfo.isTable && (
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none flex items-center gap-1">
                <Columns3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Select Column to Extract:</span>
              </span>

              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSkipHeader(!skipHeader)}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 select-none"
                >
                  {skipHeader ? (
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Skip Header Row</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeduplicate(!deduplicate)}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 select-none"
                >
                  {deduplicate ? (
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Deduplicate</span>
                </button>
              </div>
            </div>

            {/* Column Pill Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {tableInfo.headers.map((header, idx) => {
                const isSelected = selectedColumnIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColumnIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-50 dark:bg-obsidian-850 border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-mono">
                      {idx + 1}
                    </span>
                    <span>{header}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Output Delimiter & Quotes Format Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Format Extracted Column:</span>
            <select
              value={outputDelim}
              onChange={(e) => setOutputDelim(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value=", ">Comma + Space (, )</option>
              <option value=",">Comma (,)</option>
              <option value="\n">Newlines (\n)</option>
              <option value="; ">Semicolon (; )</option>
              <option value="|">Pipe (|)</option>
            </select>

            <select
              value={outputQuotes}
              onChange={(e) => setOutputQuotes(e.target.value as QuoteStyle)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="single">Single Quotes ('x')</option>
              <option value="double">Double Quotes ("x")</option>
              <option value="none">No Quotes</option>
              <option value="backtick">Backticks (`x`)</option>
            </select>
          </div>

          {onSendToDelim && formattedOutput && (
            <button
              type="button"
              onClick={() => onSendToDelim(extractedList.join('\n'))}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors select-none"
            >
              <span>Send Column to Delimiter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Workspaces: Raw Table vs Sliced Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Raw Table Input & Visual Grid */}
        <div className="flex flex-col h-[560px] xl:h-[calc(100vh-320px)] min-h-[480px] bg-white dark:bg-obsidian-900 border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-obsidian-850/60 border-b border-slate-200/80 dark:border-white/[0.06]">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-indigo-500" />
                <span>Raw Table Data</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Paste spreadsheet or CSV text
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {tableInfo.totalRows} rows
            </span>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste tabular spreadsheet rows here..."
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none leading-relaxed whitespace-pre overflow-auto"
          />

          {/* Table Preview Drawer */}
          {tableInfo.isTable && tableInfo.rows.length > 0 && (
            <div className="border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-obsidian-950/40 p-2 overflow-x-auto max-h-36 shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Data Preview ({tableInfo.columnCount} columns):
              </div>
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/[0.08]">
                    {tableInfo.headers.map((h, i) => (
                      <th
                        key={i}
                        className={`p-1 font-semibold truncate ${
                          selectedColumnIndex === i
                            ? 'text-indigo-600 dark:text-indigo-400 underline decoration-2 underline-offset-2'
                            : 'text-slate-500'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableInfo.rows.slice(0, 3).map((r, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100 dark:border-white/[0.04]">
                      {r.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-1 truncate max-w-[120px] ${
                            selectedColumnIndex === cIdx
                              ? 'font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sliced Column Output */}
        <div className="flex flex-col h-[560px] xl:h-[calc(100vh-320px)] min-h-[480px] bg-white dark:bg-obsidian-900 border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-obsidian-850/60 border-b border-slate-200/80 dark:border-white/[0.06]">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Columns3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  Extracted Column:{' '}
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {tableInfo.headers[selectedColumnIndex] || `Col ${selectedColumnIndex + 1}`}
                  </span>
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Formatted with delimiter and quotes
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!formattedOutput}
                title="Download Extracted Column"
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!formattedOutput}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Column'}</span>
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={formattedOutput}
            placeholder="Select a column to slice above..."
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none leading-relaxed whitespace-pre overflow-auto"
          />

          <div className="flex items-center justify-between px-4 py-2 bg-slate-50/60 dark:bg-obsidian-850/50 border-t border-slate-200/80 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400 select-none">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {extractedList.length} items extracted
            </span>
            <span>{formattedOutput.length.toLocaleString()} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
};
