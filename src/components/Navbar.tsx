import React from 'react';
import { ShieldCheck, Moon, Sun, Github, RotateCcw, Split } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onResetAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, onToggleTheme, onResetAll }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-obsidian-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-mono font-bold text-lg">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">delim</h1>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Modern, private list & delimiter transformation
            </p>
          </div>
        </div>

        {/* Center Privacy Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>100% In-Browser</span>
          <span className="text-emerald-300 dark:text-emerald-700">•</span>
          <span>No Data Stored</span>
          <span className="text-emerald-300 dark:text-emerald-700">•</span>
          <span>Zero Ads</span>
        </div>

        {/* Right Actions: Theme Toggle, Reset, GitHub */}
        <div className="flex items-center gap-2">
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
