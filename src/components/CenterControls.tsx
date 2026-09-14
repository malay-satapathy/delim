import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, ArrowLeftRight, Trash2, Zap, ChevronDown, Check } from 'lucide-react';
import { DelimOptions } from '../types';

interface CenterControlsProps {
  options: DelimOptions;
  onOptionsChange: (newOptions: Partial<DelimOptions>) => void;
  onConvertToDelimited: () => void;
  onConvertToColumn: () => void;
  onSwap: () => void;
  onClear: () => void;
  liveMode: boolean;
  onToggleLiveMode: () => void;
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

export const CenterControls: React.FC<CenterControlsProps> = ({
  options,
  onOptionsChange,
  onConvertToDelimited,
  onConvertToColumn,
  onSwap,
  onClear,
  liveMode,
  onToggleLiveMode,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentDelimLabel =
    DELIMITER_SHORTCUTS.find((d) => d.value === options.delimiter)?.label ||
    (options.delimiter === '' ? 'Empty' : `Custom: "${options.delimiter}"`);

  return (
    <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-4 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      {/* Left section: Delimiter Selector */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Delimiter:</span>
        <div className="relative flex-1 md:w-48" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
          >
            <span className="truncate font-mono">{currentDelimLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {DELIMITER_SHORTCUTS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onOptionsChange({ delimiter: item.value });
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span className="font-mono">{item.label}</span>
                  {options.delimiter === item.value && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-700 my-1 pt-1 px-3">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Custom Delimiter</span>
                <input
                  type="text"
                  placeholder="Enter custom delimiter..."
                  value={options.delimiter}
                  onChange={(e) => onOptionsChange({ delimiter: e.target.value })}
                  className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center section: Action Buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-center flex-wrap">
        <button
          onClick={onConvertToDelimited}
          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-500/25 transition-all"
        >
          <span>Convert</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onConvertToColumn}
          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Reverse</span>
        </button>

        <button
          onClick={onSwap}
          title="Swap Column and Delimited Content"
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <button
          onClick={onClear}
          title="Clear both workspaces"
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200/60 dark:border-red-900/40 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right section: Live Auto-Convert Toggle */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <button
          onClick={onToggleLiveMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            liveMode
              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${liveMode ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
          <span>Live Convert:</span>
          <span className="font-semibold">{liveMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};
