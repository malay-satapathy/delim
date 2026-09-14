import React, { useRef, useState } from 'react';
import {
  Copy,
  Check,
  Upload,
  Download,
  Clipboard,
  Trash2,
  FileText,
  Sparkles,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { calculateStats, filterLines } from '../lib/engine';

interface EditorPaneProps {
  title: string;
  subtitle: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  delimiter?: string;
  isSource?: boolean;
  isPrimaryCopy?: boolean;
  onLoadSample?: () => void;
  onInspectDuplicates?: () => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  title,
  subtitle,
  value,
  onChange,
  placeholder,
  delimiter = '\n',
  isSource = false,
  isPrimaryCopy = false,
  onLoadSample,
  onInspectDuplicates,
}) => {
  const [copied, setCopied] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'keep' | 'drop'>('keep');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize line numbers gutter scrolling with textarea scrolling
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Compute line count for gutter
  const lineCount = Math.max(1, value.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Copy to clipboard with toast
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      onChange(clipText);
    } catch {
      textareaRef.current?.focus();
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // File download handler
  const handleDownload = () => {
    if (!value) return;
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isSource ? 'column-data.txt' : 'delimited-data.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content !== undefined) {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter application
  const applyFilter = () => {
    if (!filterQuery) return;
    const filtered = filterLines(value, filterQuery, filterMode);
    onChange(filtered);
    setFilterOpen(false);
    setFilterQuery('');
  };

  const stats = calculateStats(value, delimiter);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex flex-col h-[530px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50"
    >
      {/* Pane Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>{title}</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {isSource && onLoadSample && (
            <button
              onClick={onLoadSample}
              title="Load sample dataset"
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Sample</span>
            </button>
          )}

          {isSource && (
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              title="Filter lines by keyword"
              className={`p-1.5 rounded-lg transition-colors ${
                filterOpen
                  ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handlePaste}
            title="Paste from clipboard"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5" />
          </button>

          <label
            title="Upload .txt or .csv file"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.tsv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleDownload}
            disabled={!value}
            title="Download as text file"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button (Highlighted if primary) */}
          <button
            onClick={handleCopy}
            disabled={!value}
            title="Copy to clipboard (Cmd/Ctrl + C)"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              copied
                ? 'bg-emerald-600 text-white shadow-sm'
                : isPrimaryCopy
                ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-500/25 disabled:opacity-30 disabled:cursor-not-allowed'
                : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied! ✓' : isPrimaryCopy ? 'Copy Result' : 'Copy'}</span>
          </button>

          <button
            onClick={() => onChange('')}
            disabled={!value}
            title="Clear text"
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar (Collapsible) */}
      {filterOpen && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 animate-in fade-in slide-in-from-top-1 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <input
            type="text"
            placeholder="Filter lines containing..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
            className="flex-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900 shrink-0">
            <button
              onClick={() => setFilterMode('keep')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                filterMode === 'keep' ? 'bg-indigo-600 text-white' : 'text-slate-500'
              }`}
            >
              Keep
            </button>
            <button
              onClick={() => setFilterMode('drop')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                filterMode === 'drop' ? 'bg-indigo-600 text-white' : 'text-slate-500'
              }`}
            >
              Drop
            </button>
          </div>
          <button
            onClick={applyFilter}
            disabled={!filterQuery}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md disabled:opacity-40"
          >
            Filter
          </button>
          <button
            onClick={() => setFilterOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body with Gutter */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs sm:text-sm">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-11 sm:w-12 shrink-0 py-3 pr-2 text-right select-none bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800/80 text-slate-300 dark:text-slate-600 overflow-hidden leading-relaxed"
        >
          {lineNumbers.map((num) => (
            <div key={num} className="h-6 leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full h-full p-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none leading-relaxed leading-6 whitespace-pre overflow-auto"
        />
      </div>

      {/* Footer Stats Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50/50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>
            <strong className="font-semibold text-slate-700 dark:text-slate-300">{stats.lineCount}</strong> lines
          </span>
          <span>•</span>
          <span>
            <strong className="font-semibold text-slate-700 dark:text-slate-300">{stats.itemCount}</strong> items
          </span>
          <span>•</span>
          <span>
            <strong className="font-semibold text-slate-700 dark:text-slate-300">{stats.uniqueCount}</strong> unique
          </span>
          {stats.duplicateCount > 0 && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={onInspectDuplicates}
                title="Click to inspect duplicate frequencies"
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>{stats.duplicateCount} duplicates</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700">
                  Inspect
                </span>
              </button>
            </>
          )}
        </div>
        <div>
          <span>{stats.charCount.toLocaleString()} chars</span>
        </div>
      </div>
    </div>
  );
};
