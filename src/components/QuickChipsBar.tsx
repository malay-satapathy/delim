import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  ChevronDown,
  Sparkles,
  ArrowDownAZ,
  CaseSensitive,
  Sliders,
  Hash,
  Mail,
  Link,
  Table,
  Fingerprint,
  Shuffle,
  ArrowUpDown,
} from 'lucide-react';
import { DelimOptions, CaseTransform } from '../types';
import { DEFAULT_OPTIONS } from '../lib/engine';

interface QuickChipsBarProps {
  options: DelimOptions;
  onOptionsChange: (newOptions: Partial<DelimOptions>) => void;
  onExtract: (type: 'numbers' | 'emails' | 'urls' | 'uuids' | 'excel') => void;
  onReverseLines: () => void;
  onShuffleLines: () => void;
  onToggleSettings: () => void;
  settingsOpen: boolean;
}

export const QuickChipsBar: React.FC<QuickChipsBarProps> = ({
  options,
  onOptionsChange,
  onExtract,
  onReverseLines,
  onShuffleLines,
  onToggleSettings,
  settingsOpen,
}) => {
  const [extractMenuOpen, setExtractMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);

  const extractRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const caseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (extractRef.current && !extractRef.current.contains(event.target as Node)) {
        setExtractMenuOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
      if (caseRef.current && !caseRef.current.contains(event.target as Node)) {
        setCaseMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCustomCount = Object.keys(DEFAULT_OPTIONS).reduce((acc, key) => {
    const k = key as keyof DelimOptions;
    return options[k] !== DEFAULT_OPTIONS[k] ? acc + 1 : acc;
  }, 0);

  return (
    <div className="w-full flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
      <div className="flex items-center gap-1.5 min-w-max">
        {/* Toggle 1: Deduplicate */}
        <button
          onClick={() => onOptionsChange({ deduplicate: !options.deduplicate })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
            options.deduplicate
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
              options.deduplicate
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {options.deduplicate && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>Deduplicate</span>
        </button>

        {/* Toggle 2: Trim Whitespace */}
        <button
          onClick={() => onOptionsChange({ trimWhitespace: !options.trimWhitespace })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
            options.trimWhitespace
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
              options.trimWhitespace
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {options.trimWhitespace && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>Trim</span>
        </button>

        {/* Toggle 3: Skip Empty */}
        <button
          onClick={() => onOptionsChange({ skipEmpty: !options.skipEmpty })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
            options.skipEmpty
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
              options.skipEmpty
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {options.skipEmpty && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>Skip Blanks</span>
        </button>

        {/* Toggle 4: Inline (Tidy Up) */}
        <button
          onClick={() => onOptionsChange({ tidyUp: !options.tidyUp })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
            options.tidyUp
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
              options.tidyUp ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {options.tidyUp && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>Inline</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700 px-0.5">•</span>

        {/* Dropdown 1: Sort */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              options.sort !== 'none'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <ArrowDownAZ className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {options.sort === 'asc'
                ? 'A → Z'
                : options.sort === 'desc'
                ? 'Z → A'
                : options.sort === 'numeric-asc'
                ? '1 → 9'
                : options.sort === 'numeric-desc'
                ? '9 → 1'
                : 'Sort'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {sortMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
              <button
                onClick={() => {
                  onOptionsChange({ sort: 'none' });
                  setSortMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                Original Order
              </button>
              <button
                onClick={() => {
                  onOptionsChange({ sort: 'asc' });
                  setSortMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                Alphabetical (A → Z)
              </button>
              <button
                onClick={() => {
                  onOptionsChange({ sort: 'desc' });
                  setSortMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                Alphabetical (Z → A)
              </button>
              <button
                onClick={() => {
                  onOptionsChange({ sort: 'numeric-asc' });
                  setSortMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                Numeric (1 → 9)
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1 pt-1">
                <button
                  onClick={() => {
                    onReverseLines();
                    setSortMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Reverse Upside Down</span>
                </button>
                <button
                  onClick={() => {
                    onShuffleLines();
                    setSortMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Random Shuffle</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown 2: Case */}
        <div className="relative" ref={caseRef}>
          <button
            onClick={() => setCaseMenuOpen(!caseMenuOpen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              options.caseTransform !== 'none'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <CaseSensitive className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {options.caseTransform === 'upper'
                ? 'UPPER'
                : options.caseTransform === 'lower'
                ? 'lower'
                : options.caseTransform === 'title'
                ? 'Title'
                : 'Case'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {caseMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
              {[
                { label: 'Original Case', val: 'none' },
                { label: 'UPPERCASE', val: 'upper' },
                { label: 'lowercase', val: 'lower' },
                { label: 'Title Case', val: 'title' },
              ].map((c) => (
                <button
                  key={c.val}
                  onClick={() => {
                    onOptionsChange({ caseTransform: c.val as CaseTransform });
                    setCaseMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-slate-300 dark:text-slate-700 px-0.5">•</span>

        {/* Dropdown 3: Extract from Messy Text */}
        <div className="relative" ref={extractRef}>
          <button
            onClick={() => setExtractMenuOpen(!extractMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-semibold hover:bg-indigo-100/70 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Extract Patterns</span>
            <ChevronDown className="w-3 h-3 text-indigo-400 ml-0.5" />
          </button>

          {extractMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">Extract from input</div>
              <button
                onClick={() => {
                  onExtract('numbers');
                  setExtractMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
              >
                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                <span>Extract Numbers (IDs)</span>
              </button>
              <button
                onClick={() => {
                  onExtract('emails');
                  setExtractMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>Extract Email Addresses</span>
              </button>
              <button
                onClick={() => {
                  onExtract('urls');
                  setExtractMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
              >
                <Link className="w-3.5 h-3.5 text-indigo-500" />
                <span>Extract URLs / Links</span>
              </button>
              <button
                onClick={() => {
                  onExtract('uuids');
                  setExtractMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
              >
                <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                <span>Extract UUIDs</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1 pt-1">
                <button
                  onClick={() => {
                    onExtract('excel');
                    setExtractMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <Table className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Clean Excel Pasted Quotes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Drawer Button */}
      <div className="shrink-0">
        <button
          onClick={onToggleSettings}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
            settingsOpen
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Advanced</span>
          {activeCustomCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
              {activeCustomCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
