import React from 'react';
import {
  Moon,
  Sun,
  Github,
  RotateCcw,
  Split,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Layers,
  Braces,
  Table,
} from 'lucide-react';
import { StudioMode } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onResetAll: () => void;
  isFullWidth: boolean;
  onToggleFullWidth: () => void;
  studioMode: StudioMode;
  onSelectMode: (mode: StudioMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  onResetAll,
  isFullWidth,
  onToggleFullWidth,
  studioMode,
  onSelectMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-obsidian-900/85 backdrop-blur-md transition-colors">
      <div
        className={`w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all duration-300 ${
          isFullWidth ? 'max-w-[98vw]' : 'max-w-7xl'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-mono font-bold text-lg">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">delim</h1>
              <span className="px-1.5 py-0.2 text-[9px] font-semibold tracking-wide uppercase rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                STUDIO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:block">
              Modern in-browser list & delimiter transformer
            </p>
          </div>
        </div>

        {/* Center: High-Discoverability Studio Mode Switcher */}
        <nav aria-label="Studio Mode Navigation" className="hidden md:flex items-center p-1 bg-slate-100/90 dark:bg-obsidian-950/90 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-inner-sm text-xs font-medium gap-1">
          {/* Delimiter */}
          <button
            type="button"
            onClick={() => onSelectMode('standard')}
            title="Standard Delimiter Mode (Press 1)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 select-none ${
              studioMode === 'standard'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-500/25 ring-1 ring-indigo-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-obsidian-850'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Delimiter</span>
            <span
              className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                studioMode === 'standard'
                  ? 'bg-indigo-700/80 text-white'
                  : 'bg-slate-200 dark:bg-obsidian-800 text-slate-500'
              }`}
            >
              1
            </span>
          </button>

          {/* Two-List Diff */}
          <button
            type="button"
            onClick={() => onSelectMode('diff')}
            title="Two-List Diff & Set Operations Mode (Press 2)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 select-none ${
              studioMode === 'diff'
                ? 'bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-obsidian-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Two-List Diff</span>
            <span
              className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                studioMode === 'diff'
                  ? 'bg-cyan-700/80 text-white'
                  : 'bg-slate-200 dark:bg-obsidian-800 text-slate-500'
              }`}
            >
              2
            </span>
          </button>

          {/* Template Engine */}
          <button
            type="button"
            onClick={() => onSelectMode('template')}
            title="Custom Template String Interpolation Engine (Press 3)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 select-none ${
              studioMode === 'template'
                ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-500/25 ring-1 ring-purple-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-obsidian-850'
            }`}
          >
            <Braces className="w-3.5 h-3.5" />
            <span>Template</span>
            <span
              className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                studioMode === 'template'
                  ? 'bg-purple-700/80 text-white'
                  : 'bg-slate-200 dark:bg-obsidian-800 text-slate-500'
              }`}
            >
              3
            </span>
          </button>

          {/* Table Slicer */}
          <button
            type="button"
            onClick={() => onSelectMode('slicer')}
            title="Spreadsheet TSV / CSV Multi-Column Slicer (Press 4)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 select-none ${
              studioMode === 'slicer'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-obsidian-850'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table Slicer</span>
            <span
              className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                studioMode === 'slicer'
                  ? 'bg-emerald-700/80 text-white'
                  : 'bg-slate-200 dark:bg-obsidian-800 text-slate-500'
              }`}
            >
              4
            </span>
          </button>
        </nav>

        {/* Right Actions: Full Width Toggle, Theme Toggle, Reset, GitHub */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFullWidth}
            title={isFullWidth ? 'Switch to Centered View' : 'Expand to Full Width'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-obsidian-850 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08]"
          >
            {isFullWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullWidth ? 'Compact' : 'Full Width'}</span>
          </button>

          <button
            onClick={onResetAll}
            title="Reset text and settings to defaults"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-obsidian-850 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-obsidian-850 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <a
            href="https://github.com/malay-satapathy/delim"
            target="_blank"
            rel="noopener noreferrer"
            title="View Source on GitHub"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 rounded-lg transition-colors border border-slate-200/60 dark:border-white/[0.08]"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
