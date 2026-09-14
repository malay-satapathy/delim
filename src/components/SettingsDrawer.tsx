import React from 'react';
import { Sliders, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { DelimOptions, QuoteStyle, SortOrder, CaseTransform } from '../types';
import { DEFAULT_OPTIONS } from '../lib/engine';

interface SettingsDrawerProps {
  options: DelimOptions;
  onChange: (updated: Partial<DelimOptions>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  options,
  onChange,
  isOpen,
  onToggleOpen,
}) => {
  // Count how many options differ from default
  const activeCustomCount = Object.keys(DEFAULT_OPTIONS).reduce((acc, key) => {
    const k = key as keyof DelimOptions;
    return options[k] !== DEFAULT_OPTIONS[k] ? acc + 1 : acc;
  }, 0);

  const handleResetSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(DEFAULT_OPTIONS);
  };

  return (
    <div className="w-full bg-white dark:bg-obsidian-900 border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
      {/* Drawer Toggle Header */}
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-obsidian-850/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Converter Settings & Customization
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
              Configure quotes, deduplication, tags, batching, and sorting
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeCustomCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {activeCustomCount} active
              </span>
              <button
                onClick={handleResetSettings}
                title="Reset settings to defaults"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expandable Body */}
      {isOpen && (
        <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1: Clean-Up & Explode */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Input & Clean-up
              </h3>

              {/* Tidy Up */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tidy Up</label>
                  <span className="text-[11px] text-slate-400">Remove output newlines</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => onChange({ tidyUp: true })}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      options.tidyUp
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Yes (Inline)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ tidyUp: false })}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      !options.tidyUp
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    No (Keep Newlines)
                  </button>
                </div>
              </div>

              {/* Deduplicate (Attack the Clones) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Attack The Clones
                  </label>
                  <span className="text-[11px] text-slate-400">Remove duplicate items</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => onChange({ deduplicate: true })}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      options.deduplicate
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Yes (Unique Only)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ deduplicate: false })}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      !options.deduplicate
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    No (Preserve All)
                  </button>
                </div>
              </div>

              {/* Explode (Input separator) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Explode</label>
                  <span className="text-[11px] text-slate-400">Split input by</span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-center">
                  {[
                    { label: 'Newlines', val: '\n' },
                    { label: 'Spaces', val: ' ' },
                    { label: 'Commas', val: ',' },
                    { label: 'Semicolons', val: ';' },
                  ].map((exp) => (
                    <button
                      key={exp.val}
                      type="button"
                      onClick={() => onChange({ explode: exp.val, isExplodeRegex: false })}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all truncate px-1 ${
                        options.explode === exp.val
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trim & Empty Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.trimWhitespace}
                    onChange={(e) => onChange({ trimWhitespace: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Trim Whitespace</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={options.skipEmpty}
                    onChange={(e) => onChange({ skipEmpty: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Skip Empty Lines</span>
                </label>
              </div>
            </div>

            {/* Column 2: Quotes & Tags */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Quotes & Tags
              </h3>

              {/* Quotes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quotes</label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-center">
                  {[
                    { label: 'None', val: 'none' as QuoteStyle },
                    { label: "'Single'", val: 'single' as QuoteStyle },
                    { label: '"Double"', val: 'double' as QuoteStyle },
                    { label: '`Backtick`', val: 'backtick' as QuoteStyle },
                  ].map((q) => (
                    <button
                      key={q.val}
                      type="button"
                      onClick={() => onChange({ quotes: q.val })}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all truncate px-1 ${
                        options.quotes === q.val
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Tags */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Item Tags</label>
                  <span className="text-[11px] text-slate-400">e.g. &lt;li&gt; &lt;/li&gt;</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Open tag (e.g. <li>)"
                      value={options.itemTagOpen}
                      onChange={(e) => onChange({ itemTagOpen: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Close tag (e.g. </li>)"
                      value={options.itemTagClose}
                      onChange={(e) => onChange({ itemTagClose: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Global Prefix & Suffix */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Enclose Output
                  </label>
                  <span className="text-[11px] text-slate-400">e.g. [ ... ]</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Prefix (e.g. '(' or '[')"
                      value={options.globalPrefix}
                      onChange={(e) => onChange({ globalPrefix: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Suffix (e.g. ')' or ']')"
                      value={options.globalSuffix}
                      onChange={(e) => onChange({ globalSuffix: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Interval & Sort */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Batching & Order
              </h3>

              {/* Interval Chunking */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Interval</label>
                  <span className="text-[11px] text-slate-400">Break line every X items</span>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="0 (Disabled)"
                  value={options.interval === 0 ? '' : options.interval}
                  onChange={(e) => onChange({ interval: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Interval Wrap */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Interval Wrap Tags
                  </label>
                  <span className="text-[11px] text-slate-400">e.g. &lt;ul&gt; &lt;/ul&gt;</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Batch Open (e.g. <ul>)"
                    value={options.intervalWrapOpen}
                    onChange={(e) => onChange({ intervalWrapOpen: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Batch Close (e.g. </ul>)"
                    value={options.intervalWrapClose}
                    onChange={(e) => onChange({ intervalWrapClose: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sorting & Case */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sort</label>
                  <select
                    value={options.sort}
                    onChange={(e) => onChange({ sort: e.target.value as SortOrder })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="none">Original Order</option>
                    <option value="asc">Alphabetical (A-Z)</option>
                    <option value="desc">Alphabetical (Z-A)</option>
                    <option value="numeric-asc">Numeric (1-9)</option>
                    <option value="numeric-desc">Numeric (9-1)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Case</label>
                  <select
                    value={options.caseTransform}
                    onChange={(e) => onChange({ caseTransform: e.target.value as CaseTransform })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="none">Original Case</option>
                    <option value="upper">UPPERCASE</option>
                    <option value="lower">lowercase</option>
                    <option value="title">Title Case</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
