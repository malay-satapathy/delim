import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  ChevronDown,
  Sparkles,
  Sliders,
  Hash,
  Mail,
  Link as LinkIcon,
  Table,
  Fingerprint,
  Shuffle,
  ArrowUpDown,
  ArrowRight,
  ArrowLeftRight,
  Trash2,
  Zap,
  Binary,
  Quote,
  Filter,
} from 'lucide-react';
import { DelimOptions, Preset, CaseTransform, StudioMode } from '../types';
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
  onSelectMode?: (mode: StudioMode) => void;
  hasDuplicates?: boolean;
  hasNumbers?: boolean;
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

const QUOTE_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: "Single (')", value: 'single' },
  { label: 'Double (")', value: 'double' },
  { label: 'Backtick (`)', value: 'backtick' },
];

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  options,
  onOptionsChange,
  onSelectPreset,
  onExtract,
  onReverseLines,
  onShuffleLines,
  onConvertToDelimited,
  onSwap,
  onClear,
  liveMode,
  onToggleLiveMode,
  onToggleSettings,
  settingsOpen,
  hasDuplicates = false,
  hasNumbers = false,
}) => {
  const [presetsMenuOpen, setPresetsMenuOpen] = useState(false);
  const [delimDropdownOpen, setDelimDropdownOpen] = useState(false);
  const [quoteDropdownOpen, setQuoteDropdownOpen] = useState(false);
  const [dedupMenuOpen, setDedupMenuOpen] = useState(false);
  const [refineMenuOpen, setRefineMenuOpen] = useState(false);

  const presetsRef = useRef<HTMLDivElement>(null);
  const delimRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const dedupRef = useRef<HTMLDivElement>(null);
  const refineRef = useRef<HTMLDivElement>(null);

  const closeAll = () => {
    setPresetsMenuOpen(false);
    setDelimDropdownOpen(false);
    setQuoteDropdownOpen(false);
    setDedupMenuOpen(false);
    setRefineMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        (presetsRef.current && presetsRef.current.contains(target)) ||
        (delimRef.current && delimRef.current.contains(target)) ||
        (quoteRef.current && quoteRef.current.contains(target)) ||
        (dedupRef.current && dedupRef.current.contains(target)) ||
        (refineRef.current && refineRef.current.contains(target))
      ) {
        return;
      }
      closeAll();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAll();
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

  const activePreset = PRESETS.find((p) => isPresetActive(p));

  const currentDelimLabel =
    DELIMITER_SHORTCUTS.find((d) => d.value === options.delimiter)?.label ||
    (options.delimiter === '' ? 'Empty' : `"${options.delimiter}"`);

  const currentQuoteLabel =
    QUOTE_OPTIONS.find((q) => q.value === options.quotes)?.label ||
    (options.quotes === 'custom' ? 'Custom' : 'None');

  // Quick primary preset buttons
  const quickPresets = [
    { id: 'csv-plain', label: 'CSV' },
    { id: 'sql-in', label: 'SQL IN' },
    { id: 'json-array', label: 'JSON' },
    { id: 'pipe-separated', label: 'Pipe' },
  ];

  return (
    <div className="relative z-30 w-full bg-white/95 dark:bg-obsidian-900/95 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-xs dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] px-3 py-2 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left Section: Unified Format, Delimiter & Essentials */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Format Segmented Pill with "Presets ▾" */}
          <div
            ref={presetsRef}
            className="relative inline-flex items-center rounded-xl p-0.5 border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-obsidian-850 shadow-2xs"
          >
            {quickPresets.map((qp) => {
              const presetObj = PRESETS.find((p) => p.id === qp.id);
              const isActive = presetObj ? isPresetActive(presetObj) : false;
              return (
                <button
                  key={qp.id}
                  type="button"
                  onClick={() => presetObj && onSelectPreset(presetObj)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white dark:bg-obsidian-750 text-indigo-600 dark:text-indigo-300 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {qp.label}
                </button>
              );
            })}

            {/* Presets Dropdown Trigger */}
            <button
              type="button"
              onClick={() => {
                setPresetsMenuOpen(!presetsMenuOpen);
                setDelimDropdownOpen(false);
                setQuoteDropdownOpen(false);
                setDedupMenuOpen(false);
                setRefineMenuOpen(false);
              }}
              title="Browse all SQL, Python, JSON, and markup presets"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                activePreset && !quickPresets.some((qp) => qp.id === activePreset.id)
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : presetsMenuOpen
                  ? 'bg-white dark:bg-obsidian-750 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>
                {activePreset && !quickPresets.some((qp) => qp.id === activePreset.id)
                  ? activePreset.name.split(' ')[0]
                  : 'Presets'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Presets Categorized Dropdown */}
            {presetsMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-white dark:bg-obsidian-850 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[75vh] overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Database & SQL
                </div>
                {PRESETS.filter((p) => p.id.startsWith('sql')).map((preset) => {
                  const active = isPresetActive(preset);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        setPresetsMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-obsidian-700 text-slate-600 dark:text-slate-400">
                          {preset.badge}
                        </span>
                        <span>{preset.name}</span>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}

                <div className="border-t border-slate-100 dark:border-white/[0.06] my-1.5 pt-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Language Collections & Code
                </div>
                {PRESETS.filter((p) => p.id.startsWith('python') || p.id === 'json-array' || p.id === 'html-list').map(
                  (preset) => {
                    const active = isPresetActive(preset);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onSelectPreset(preset);
                          setPresetsMenuOpen(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-obsidian-700 text-slate-600 dark:text-slate-400">
                            {preset.badge}
                          </span>
                          <span>{preset.name}</span>
                        </div>
                        {active && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  }
                )}

                <div className="border-t border-slate-100 dark:border-white/[0.06] my-1.5 pt-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Delimited Formats
                </div>
                {PRESETS.filter(
                  (p) =>
                    p.id === 'csv-plain' ||
                    p.id === 'csv-quoted' ||
                    p.id === 'pipe-separated' ||
                    p.id === 'tsv'
                ).map((preset) => {
                  const active = isPresetActive(preset);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        setPresetsMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-obsidian-700 text-slate-600 dark:text-slate-400">
                          {preset.badge}
                        </span>
                        <span>{preset.name}</span>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delimiter Selector */}
          <div className="relative" ref={delimRef}>
            <button
              type="button"
              onClick={() => {
                setDelimDropdownOpen(!delimDropdownOpen);
                setPresetsMenuOpen(false);
                setQuoteDropdownOpen(false);
                setDedupMenuOpen(false);
                setRefineMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs transition-colors"
            >
              <span className="text-slate-400 text-[11px]">Delim:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{currentDelimLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {delimDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-obsidian-850 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {DELIMITER_SHORTCUTS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onOptionsChange({ delimiter: item.value });
                      setDelimDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span className="font-mono">{item.label}</span>
                    {options.delimiter === item.value && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-white/[0.06] my-1 pt-1.5 px-3">
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

          {/* Quotes Selector */}
          <div className="relative" ref={quoteRef}>
            <button
              type="button"
              onClick={() => {
                setQuoteDropdownOpen(!quoteDropdownOpen);
                setPresetsMenuOpen(false);
                setDelimDropdownOpen(false);
                setDedupMenuOpen(false);
                setRefineMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs transition-colors"
            >
              <Quote className="w-3 h-3 text-slate-400" />
              <span className="font-mono text-slate-700 dark:text-slate-300">{currentQuoteLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {quoteDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-44 bg-white dark:bg-obsidian-850 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {QUOTE_OPTIONS.map((q) => (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => {
                      onOptionsChange({ quotes: q.value as DelimOptions['quotes'] });
                      setQuoteDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors"
                  >
                    <span>{q.label}</span>
                    {options.quotes === q.value && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-0.5 hidden sm:block" />

          {/* Trim Toggle */}
          <button
            type="button"
            onClick={() => onOptionsChange({ trimWhitespace: !options.trimWhitespace })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-2xs ${
              options.trimWhitespace
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-obsidian-850 border-slate-200/90 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900'
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

          {/* Deduplicate (Contextual Sensory Expansion) */}
          <div className="relative" ref={dedupRef}>
            {hasDuplicates || options.deduplicate ? (
              <div className="inline-flex items-center rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-obsidian-850 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => onOptionsChange({ deduplicate: !options.deduplicate })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 font-medium transition-all ${
                    options.deduplicate
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                  <span>
                    {options.deduplicateStrategy === 'none'
                      ? 'Singletons'
                      : options.deduplicateStrategy === 'last'
                      ? 'Keep Last'
                      : 'Dedupe'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDedupMenuOpen(!dedupMenuOpen);
                    setPresetsMenuOpen(false);
                    setDelimDropdownOpen(false);
                    setQuoteDropdownOpen(false);
                    setRefineMenuOpen(false);
                  }}
                  title="Deduplication Strategy"
                  className="p-1.5 border-l border-slate-100 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-obsidian-800 text-slate-400"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOptionsChange({ deduplicate: true })}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-obsidian-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium transition-all shadow-2xs"
              >
                <div className="w-3.5 h-3.5 rounded flex items-center justify-center border border-slate-300 dark:border-slate-600 text-[10px]" />
                <span>Dedupe</span>
              </button>
            )}

            {dedupMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-60 bg-white dark:bg-obsidian-850 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Duplicate Strategy
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOptionsChange({ deduplicate: true, deduplicateStrategy: 'first' });
                    setDedupMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <div>
                    <span className="font-semibold block">Keep First (Default)</span>
                    <span className="text-[10px] text-slate-400">Keep first occurrence, drop repeats</span>
                  </div>
                  {options.deduplicateStrategy === 'first' && options.deduplicate && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOptionsChange({ deduplicate: true, deduplicateStrategy: 'last' });
                    setDedupMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <div>
                    <span className="font-semibold block">Keep Last</span>
                    <span className="text-[10px] text-slate-400">Keep only latest/last occurrence</span>
                  </div>
                  {options.deduplicateStrategy === 'last' && options.deduplicate && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOptionsChange({ deduplicate: true, deduplicateStrategy: 'none' });
                    setDedupMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200"
                >
                  <div>
                    <span className="font-semibold block">Strictly Singletons</span>
                    <span className="text-[10px] text-slate-400">Drop all duplicates entirely</span>
                  </div>
                  {options.deduplicateStrategy === 'none' && options.deduplicate && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sensory Zero-Padding: Promoted when numbers exist or pad width is set */}
          {(hasNumbers || (options.zeroPadWidth && options.zeroPadWidth > 0)) && (
            <div
              title="Zero-pad numbers to fixed width (pandas zfill)"
              className="flex items-center gap-1 px-2 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 animate-in fade-in zoom-in-95 duration-150 select-none shadow-2xs"
            >
              <Binary className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-medium">Pad 0s:</span>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="0"
                value={options.zeroPadWidth === 0 ? '' : options.zeroPadWidth}
                onChange={(e) => onOptionsChange({ zeroPadWidth: parseInt(e.target.value, 10) || 0 })}
                className="w-7 px-1 py-0.5 text-xs font-mono font-bold rounded bg-white dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center"
              />
            </div>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-0.5 hidden sm:block" />

          {/* Refine / Transform Popover Menu */}
          <div className="relative" ref={refineRef}>
            <button
              type="button"
              onClick={() => {
                setRefineMenuOpen(!refineMenuOpen);
                setPresetsMenuOpen(false);
                setDelimDropdownOpen(false);
                setQuoteDropdownOpen(false);
                setDedupMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-2xs ${
                options.caseTransform !== 'none' || options.sort !== 'none' || refineMenuOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'bg-white dark:bg-obsidian-850 border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Refine</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {refineMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-obsidian-850 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200 dark:border-white/[0.1] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Case Transform */}
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Case Transformation
                </div>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 dark:bg-obsidian-950 rounded-xl mb-2">
                  {[
                    { label: 'Original', val: 'none' },
                    { label: 'UPPER', val: 'upper' },
                    { label: 'lower', val: 'lower' },
                    { label: 'Title', val: 'title' },
                  ].map((c) => (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => onOptionsChange({ caseTransform: c.val as CaseTransform })}
                      className={`py-1 px-2 text-xs font-medium rounded-lg text-center transition-all ${
                        options.caseTransform === c.val
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Sorting */}
                <div className="border-t border-slate-100 dark:border-white/[0.06] pt-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sorting & Order
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onOptionsChange({ sort: options.sort === 'asc' ? 'none' : 'asc' })}
                    className="w-full px-2.5 py-1 text-xs text-left flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-slate-700 dark:text-slate-200"
                  >
                    <span>Ascending (A → Z)</span>
                    {options.sort === 'asc' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOptionsChange({ sort: options.sort === 'desc' ? 'none' : 'desc' })}
                    className="w-full px-2.5 py-1 text-xs text-left flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-slate-700 dark:text-slate-200"
                  >
                    <span>Descending (Z → A)</span>
                    {options.sort === 'desc' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onOptionsChange({ sort: options.sort === 'freq-desc' ? 'none' : 'freq-desc' })
                    }
                    className="w-full px-2.5 py-1 text-xs text-left flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-slate-700 dark:text-slate-200"
                  >
                    <span>Frequency (Most Common First)</span>
                    {options.sort === 'freq-desc' && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onReverseLines();
                        setRefineMenuOpen(false);
                      }}
                      className="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
                    >
                      <ArrowUpDown className="w-3 h-3 text-indigo-500" />
                      <span>Reverse</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onShuffleLines();
                        setRefineMenuOpen(false);
                      }}
                      className="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
                    >
                      <Shuffle className="w-3 h-3 text-indigo-500" />
                      <span>Shuffle</span>
                    </button>
                  </div>
                </div>

                {/* Extract Patterns */}
                <div className="border-t border-slate-100 dark:border-white/[0.06] mt-2 pt-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Extractors
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onExtract('numbers');
                      setRefineMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1 text-xs text-left flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-slate-700 dark:text-slate-200"
                  >
                    <Hash className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Extract Numbers / IDs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExtract('emails');
                      setRefineMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1 text-xs text-left flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-slate-700 dark:text-slate-200"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Extract Emails</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExtract('urls');
                      setRefineMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1 text-xs text-left flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-slate-700 dark:text-slate-200"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Extract URLs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExtract('uuids');
                      setRefineMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1 text-xs text-left flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-slate-700 dark:text-slate-200"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Extract UUIDs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExtract('excel');
                      setRefineMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1 text-xs text-left flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-slate-700 dark:text-slate-200"
                  >
                    <Table className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Clean Excel Pasted Quotes</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Serene Live State & Actions */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Live indicator (or Convert button when live mode is OFF) */}
          {liveMode ? (
            <button
              type="button"
              onClick={onToggleLiveMode}
              title="Real-time live conversion active (click to pause)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 transition-all hover:opacity-90 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[11px]">Live</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onConvertToDelimited}
                title="Convert Column to Delimited (Cmd/Ctrl + Enter)"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs transition-all"
              >
                <span>Convert</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono opacity-80 pl-0.5">⌘↵</span>
              </button>
              <button
                type="button"
                onClick={onToggleLiveMode}
                title="Enable live conversion"
                className="px-2 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-obsidian-850 text-slate-400 hover:text-slate-700"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Swap Button */}
          <button
            type="button"
            onClick={onSwap}
            title="Swap Left & Right content"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-850 rounded-xl border border-slate-200/90 dark:border-white/[0.08] transition-colors shadow-2xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={onClear}
            title="Clear both editors (Cmd/Ctrl + K)"
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-slate-200/90 dark:border-white/[0.08] hover:border-red-200 dark:hover:border-red-900/40 transition-colors shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Advanced Settings Drawer Trigger */}
          <button
            type="button"
            onClick={onToggleSettings}
            title="Open Advanced Settings Drawer"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-2xs ${
              settingsOpen
                ? 'bg-slate-200 dark:bg-obsidian-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                : 'bg-white dark:bg-obsidian-850 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Settings</span>
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
