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
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Trash2,
  Zap,
} from 'lucide-react';
import { DelimOptions, Preset, CaseTransform } from '../types';
import { PRESETS } from '../lib/presets';
import { DEFAULT_OPTIONS } from '../lib/engine';

interface StudioToolbarProps {
  options: DelimOptions;
  onOptionsChange: (newOptions: Partial<DelimOptions>) => void;
  onSelectPreset: (preset: Preset) => void;
  onExtract: (type: 'numbers' | 'emails' | 'urls' | 'uuids' | 'excel') => void;
  onReverseLines: () => void;
  onShuffleLines: () => void;
  onConvertToDelimited: () => void;
  onConvertToColumn: () => void;
  onSwap: () => void;
  onClear: () => void;
  liveMode: boolean;
  onToggleLiveMode: () => void;
  onToggleSettings: () => void;
  settingsOpen: boolean;
}

const DELIMITER_SHORTCUTS = [
  { label: 'Comma (,)', value: ',' },
  { label: 'Comma + Space (, )', value: ', ' },
  { label: 'Semicolon (;)', value: ';' },
  { label: 'Pipe (|)', value: '|' },
  { label: 'Space', value: ' ' },
  { label: 'Tab (\\t)', value: '\t' },
  { label: 'New Line (\\n)', value: '\n' },
];

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  options,
  onOptionsChange,
  onSelectPreset,
  onExtract,
  onReverseLines,
  onShuffleLines,
  onConvertToDelimited,
  onConvertToColumn,
  onSwap,
  onClear,
  liveMode,
  onToggleLiveMode,
  onToggleSettings,
  settingsOpen,
}) => {
  const [delimDropdownOpen, setDelimDropdownOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);
  const [extractMenuOpen, setExtractMenuOpen] = useState(false);

  const delimRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const caseRef = useRef<HTMLDivElement>(null);
  const extractRef = useRef<HTMLDivElement>(null);

  const toggleDelim = () => {
    setDelimDropdownOpen((prev) => !prev);
    setSortMenuOpen(false);
    setCaseMenuOpen(false);
    setExtractMenuOpen(false);
  };

  const toggleSort = () => {
    setSortMenuOpen((prev) => !prev);
    setDelimDropdownOpen(false);
    setCaseMenuOpen(false);
    setExtractMenuOpen(false);
  };

  const toggleCase = () => {
    setCaseMenuOpen((prev) => !prev);
    setDelimDropdownOpen(false);
    setSortMenuOpen(false);
    setExtractMenuOpen(false);
  };

  const toggleExtract = () => {
    setExtractMenuOpen((prev) => !prev);
    setDelimDropdownOpen(false);
    setSortMenuOpen(false);
    setCaseMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (delimRef.current && !delimRef.current.contains(event.target as Node)) {
        setDelimDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
      if (caseRef.current && !caseRef.current.contains(event.target as Node)) {
        setCaseMenuOpen(false);
      }
      if (extractRef.current && !extractRef.current.contains(event.target as Node)) {
        setExtractMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDelimDropdownOpen(false);
        setSortMenuOpen(false);
        setCaseMenuOpen(false);
        setExtractMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeCustomCount = Object.keys(DEFAULT_OPTIONS).reduce((acc, key) => {
    const k = key as keyof DelimOptions;
    return options[k] !== DEFAULT_OPTIONS[k] ? acc + 1 : acc;
  }, 0);

  const isPresetActive = (preset: Preset) => {
    if (preset.options.delimiter !== undefined && preset.options.delimiter !== options.delimiter) {
      if (preset.id === 'csv-plain' && (options.delimiter === ',' || options.delimiter === ', ')) {
        // match
      } else {
        return false;
      }
    }
    if (preset.options.quotes !== undefined && preset.options.quotes !== options.quotes) return false;
    if (preset.options.globalPrefix !== undefined && preset.options.globalPrefix !== options.globalPrefix) return false;
    if (preset.options.interval !== undefined && preset.options.interval !== options.interval) return false;
    if (preset.options.itemTagOpen !== undefined && preset.options.itemTagOpen !== options.itemTagOpen) return false;
    return true;
  };

  const currentDelimLabel =
    DELIMITER_SHORTCUTS.find((d) => d.value === options.delimiter)?.label ||
    (options.delimiter === '' ? 'Empty' : `Custom: "${options.delimiter}"`);

  return (
    <div className="relative z-30 w-full bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-3 space-y-3">
      {/* Row 1: Presets Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
        <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1 pr-1.5 shrink-0 select-none">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Presets:</span>
        </div>

        <div className="flex items-center gap-1.5 min-w-max">
          {PRESETS.map((preset) => {
            const active = isPresetActive(preset);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                title={preset.description}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 ${
                  active
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-300 font-semibold shadow-sm ring-1 ring-indigo-500/20'
                    : 'bg-slate-50/80 dark:bg-obsidian-850 border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {preset.badge && (
                  <span
                    className={`px-1 py-0.2 text-[9px] font-mono font-bold rounded ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200/80 dark:bg-obsidian-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {preset.badge}
                  </span>
                )}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Controls, Clean-up Chips, Actions, and Delimiter */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Group: Quick Clean-up Chips & Tools */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Deduplicate */}
          <button
            type="button"
            onClick={() => onOptionsChange({ deduplicate: !options.deduplicate })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              options.deduplicate
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'bg-white dark:bg-obsidian-850 border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
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

          {/* Trim */}
          <button
            type="button"
            onClick={() => onOptionsChange({ trimWhitespace: !options.trimWhitespace })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              options.trimWhitespace
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'bg-white dark:bg-obsidian-850 border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
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

          {/* Skip Blanks */}
          <button
            type="button"
            onClick={() => onOptionsChange({ skipEmpty: !options.skipEmpty })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              options.skipEmpty
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'bg-white dark:bg-obsidian-850 border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
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

          {/* Inline */}
          <button
            type="button"
            onClick={() => onOptionsChange({ tidyUp: !options.tidyUp })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              options.tidyUp
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'bg-white dark:bg-obsidian-850 border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
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

          <span className="text-slate-300 dark:text-slate-700 px-0.5 hidden sm:inline">•</span>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={toggleSort}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                options.sort !== 'none' || sortMenuOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-obsidian-850 border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
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
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-obsidian-850 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    onOptionsChange({ sort: 'none' });
                    setSortMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <span>Original Order</span>
                  {options.sort === 'none' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOptionsChange({ sort: 'asc' });
                    setSortMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <span>Alphabetical (A → Z)</span>
                  {options.sort === 'asc' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOptionsChange({ sort: 'desc' });
                    setSortMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <span>Alphabetical (Z → A)</span>
                  {options.sort === 'desc' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOptionsChange({ sort: 'numeric-asc' });
                    setSortMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <span>Numeric (1 → 9)</span>
                  {options.sort === 'numeric-asc' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
                <div className="border-t border-slate-100 dark:border-white/[0.06] my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onReverseLines();
                      setSortMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Reverse Upside Down</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onShuffleLines();
                      setSortMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Random Shuffle</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Case Dropdown */}
          <div className="relative" ref={caseRef}>
            <button
              type="button"
              onClick={toggleCase}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                options.caseTransform !== 'none' || caseMenuOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-obsidian-850 border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
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
              <div className="absolute top-full left-0 mt-1.5 w-40 bg-white dark:bg-obsidian-850 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {[
                  { label: 'Original Case', val: 'none' },
                  { label: 'UPPERCASE', val: 'upper' },
                  { label: 'lowercase', val: 'lower' },
                  { label: 'Title Case', val: 'title' },
                ].map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => {
                      onOptionsChange({ caseTransform: c.val as CaseTransform });
                      setCaseMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                  >
                    <span>{c.label}</span>
                    {options.caseTransform === c.val && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-slate-300 dark:text-slate-700 px-0.5 hidden sm:inline">•</span>

          {/* Extract Patterns Dropdown */}
          <div className="relative" ref={extractRef}>
            <button
              type="button"
              onClick={toggleExtract}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                extractMenuOpen
                  ? 'bg-indigo-100 dark:bg-indigo-950 border-indigo-400 dark:border-indigo-600 text-indigo-800 dark:text-indigo-200 shadow-sm'
                  : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Extract Patterns</span>
              <ChevronDown className="w-3 h-3 text-indigo-400 ml-0.5" />
            </button>

            {extractMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-56 bg-white dark:bg-obsidian-850 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Extract from Column text
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onExtract('numbers');
                    setExtractMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <Hash className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Extract Numbers (IDs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExtract('emails');
                    setExtractMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Extract Email Addresses</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExtract('urls');
                    setExtractMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <Link className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Extract URLs / Links</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExtract('uuids');
                    setExtractMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Extract UUIDs</span>
                </button>
                <div className="border-t border-slate-100 dark:border-white/[0.06] my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onExtract('excel');
                      setExtractMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                  >
                    <Table className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Clean Excel Pasted Quotes</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Group: Delimiter Selector, Actions, Live switch, Advanced */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Delimiter Selector */}
          <div className="relative" ref={delimRef}>
            <button
              type="button"
              onClick={toggleDelim}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
            >
              <span className="text-slate-400 text-[11px]">Delim:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{currentDelimLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {delimDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-52 bg-white dark:bg-obsidian-850 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {DELIMITER_SHORTCUTS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onOptionsChange({ delimiter: item.value });
                      setDelimDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span className="font-mono">{item.label}</span>
                    {options.delimiter === item.value && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-white/[0.06] my-1 pt-1 px-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Custom Delimiter</span>
                  <input
                    type="text"
                    placeholder="e.g. ' AND ' or ' | '"
                    value={options.delimiter}
                    onChange={(e) => onOptionsChange({ delimiter: e.target.value })}
                    className="w-full px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onConvertToDelimited}
              title="Convert Column to Delimited (Cmd/Ctrl + Enter)"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-500/25 transition-all"
            >
              <span>Convert</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[9px] font-mono opacity-80 pl-0.5">⌘↵</span>
            </button>

            <button
              type="button"
              onClick={onConvertToColumn}
              title="Reverse Delimited to Column (Cmd/Ctrl + Shift + Enter)"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.06] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reverse</span>
            </button>

            <button
              type="button"
              onClick={onSwap}
              title="Swap Left & Right content"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-obsidian-850 rounded-xl border border-slate-200/80 dark:border-white/[0.06] transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClear}
              title="Clear both editors (Cmd/Ctrl + K)"
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200/60 dark:border-red-900/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live Switch */}
          <button
            type="button"
            onClick={onToggleLiveMode}
            title="Toggle real-time auto-conversion"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              liveMode
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-50 dark:bg-obsidian-850 border-slate-200 dark:border-white/[0.06] text-slate-400'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${liveMode ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Live:</span>
            <span className="font-semibold">{liveMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Advanced Drawer Button */}
          <button
            type="button"
            onClick={onToggleSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
              settingsOpen
                ? 'bg-slate-200 dark:bg-obsidian-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                : 'bg-white dark:bg-obsidian-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.06] hover:border-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Advanced</span>
            {activeCustomCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                {activeCustomCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
