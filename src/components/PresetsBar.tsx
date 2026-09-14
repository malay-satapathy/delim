import React from 'react';
import { PRESETS } from '../lib/presets';
import { Preset, DelimOptions } from '../types';
import { Sparkles } from 'lucide-react';

interface PresetsBarProps {
  onSelectPreset: (preset: Preset) => void;
  currentOptions: DelimOptions;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({ onSelectPreset }) => {
  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1 pr-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Presets:</span>
        </div>

        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            title={preset.description}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm"
          >
            {preset.badge && (
              <span className="px-1 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                {preset.badge}
              </span>
            )}
            <span>{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
