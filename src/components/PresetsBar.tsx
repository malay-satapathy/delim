import React from 'react';
import { PRESETS } from '../lib/presets';
import { Preset, DelimOptions } from '../types';
import { Sparkles } from 'lucide-react';

interface PresetsBarProps {
  onSelectPreset: (preset: Preset) => void;
  currentOptions: DelimOptions;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({ onSelectPreset, currentOptions }) => {
  const isPresetActive = (preset: Preset) => {
    if (preset.options.delimiter !== undefined && preset.options.delimiter !== currentOptions.delimiter) {
      if (preset.id === 'csv-plain' && (currentOptions.delimiter === ',' || currentOptions.delimiter === ', ')) {
        // match
      } else {
        return false;
      }
    }
    if (preset.options.quotes !== undefined && preset.options.quotes !== currentOptions.quotes) return false;
    if (preset.options.globalPrefix !== undefined && preset.options.globalPrefix !== currentOptions.globalPrefix) return false;
    if (preset.options.interval !== undefined && preset.options.interval !== currentOptions.interval) return false;
    if (preset.options.itemTagOpen !== undefined && preset.options.itemTagOpen !== currentOptions.itemTagOpen) return false;
    return true;
  };

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-1.5 min-w-max">
        <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1 pr-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Presets:</span>
        </div>

        {PRESETS.map((preset) => {
          const active = isPresetActive(preset);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              title={preset.description}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${
                active
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm ring-1 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {preset.badge && (
                <span
                  className={`px-1 py-0.2 text-[9px] font-mono font-bold rounded ${
                    active
                      ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
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
  );
};
