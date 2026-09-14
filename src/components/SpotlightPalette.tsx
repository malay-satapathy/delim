import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Sparkles,
  Sliders,
  Layers,
  Braces,
  Table,
  Check,
  X,
  Hash,
  Mail,
  ArrowUpDown,
  Shuffle,
} from 'lucide-react';
import { Preset, StudioMode, DelimOptions } from '../types';
import { PRESETS } from '../lib/presets';
import { columnToDelimited } from '../lib/engine';
import { parseNaturalLanguageIntent } from '../lib/intent';

interface SpotlightPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: Preset) => void;
  onSelectMode: (mode: StudioMode) => void;
  onOptionsChange: (options: Partial<DelimOptions>) => void;
  onExtract: (type: 'numbers' | 'emails' | 'urls' | 'uuids' | 'excel') => void;
  onReverseLines: () => void;
  onShuffleLines: () => void;
  columnText: string;
  onUpdateColumnText: (text: string) => void;
}

interface CommandItem {
  id: string;
  category: 'Conduit' | 'Presets' | 'Transforms' | 'Modes';
  title: string;
  badge?: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export const SpotlightPalette: React.FC<SpotlightPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onSelectMode,
  onOptionsChange,
  onExtract,
  onReverseLines,
  onShuffleLines,
  columnText,
  onUpdateColumnText,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Helper for 1-click clipboard conduit (Reads clipboard, formats, writes back)
  const executeClipboardConduit = async (presetId: string, label: string) => {
    try {
      const clipText = await navigator.clipboard.readText();
      const textToFormat = clipText || columnText;
      if (!textToFormat) return;

      const preset = PRESETS.find((p) => p.id === presetId);
      const formatted = columnToDelimited(textToFormat, preset ? preset.options : {});
      await navigator.clipboard.writeText(formatted);
      onUpdateColumnText(textToFormat);

      setToastMessage(`⚡ Formatted & Copied ${label} directly to clipboard!`);
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1200);
    } catch {
      onClose();
    }
  };

  // Build command list
  const allCommands: CommandItem[] = [
    // 1. Instant Clipboard Conduit
    {
      id: 'conduit-sql',
      category: 'Conduit',
      title: 'Paste & Copy SQL IN (...)',
      badge: '1-CLICK',
      description: 'Reads clipboard, formats as SQL IN clause, and replaces clipboard',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      action: () => executeClipboardConduit('sql-in', 'SQL IN'),
    },
    {
      id: 'conduit-json',
      category: 'Conduit',
      title: 'Paste & Copy JSON Array',
      badge: '1-CLICK',
      description: 'Reads clipboard, formats as JSON string array, and replaces clipboard',
      icon: <Zap className="w-4 h-4 text-emerald-500" />,
      action: () => executeClipboardConduit('json-array', 'JSON Array'),
    },
    {
      id: 'conduit-csv',
      category: 'Conduit',
      title: 'Paste & Copy Clean CSV',
      badge: '1-CLICK',
      description: 'Reads clipboard, formats as comma-separated values, and replaces clipboard',
      icon: <Zap className="w-4 h-4 text-blue-500" />,
      action: () => executeClipboardConduit('csv-plain', 'CSV'),
    },
    {
      id: 'conduit-py',
      category: 'Conduit',
      title: 'Paste & Copy Python List',
      badge: '1-CLICK',
      description: 'Reads clipboard, formats as Python list syntax, and replaces clipboard',
      icon: <Zap className="w-4 h-4 text-purple-500" />,
      action: () => executeClipboardConduit('python-list', 'Python List'),
    },

    // 2. Studio Modes
    {
      id: 'mode-standard',
      category: 'Modes',
      title: 'Standard Delimiter Workspace',
      badge: 'MODE 1',
      description: 'Two-pane column to delimited formatter',
      icon: <Sliders className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onSelectMode('standard');
        onClose();
      },
    },
    {
      id: 'mode-diff',
      category: 'Modes',
      title: 'Two-List Diff & Set Operations',
      badge: 'MODE 2',
      description: 'Compare lists with A - B, B - A, intersection, and union',
      icon: <Layers className="w-4 h-4 text-cyan-500" />,
      action: () => {
        onSelectMode('diff');
        onClose();
      },
    },
    {
      id: 'mode-template',
      category: 'Modes',
      title: 'Custom Template String Interpolation',
      badge: 'MODE 3',
      description: 'Interpolate tokens {item}, {index1}, {item_slug}, {item_escaped}',
      icon: <Braces className="w-4 h-4 text-purple-500" />,
      action: () => {
        onSelectMode('template');
        onClose();
      },
    },
    {
      id: 'mode-slicer',
      category: 'Modes',
      title: 'Tabular TSV / CSV Column Slicer',
      badge: 'MODE 4',
      description: 'Auto-detect spreadsheets and isolate any column',
      icon: <Table className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onSelectMode('slicer');
        onClose();
      },
    },

    // 3. Cleaners & Transforms
    {
      id: 'clean-excel',
      category: 'Transforms',
      title: 'Clean Excel Pasted Quotes & Tabs',
      badge: 'FIX',
      description: 'Strips spreadsheet tabs and double-quotes (""text"")',
      icon: <Table className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onExtract('excel');
        onClose();
      },
    },
    {
      id: 'dedupe-first',
      category: 'Transforms',
      title: 'Deduplicate (Keep First)',
      description: 'Remove repeating items, keeping first appearance',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onOptionsChange({ deduplicate: true, deduplicateStrategy: 'first' });
        onClose();
      },
    },
    {
      id: 'dedupe-none',
      category: 'Transforms',
      title: 'Deduplicate (Strictly Singletons Only)',
      badge: 'PANDAS',
      description: 'Drop all repeating values entirely (keep=False)',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onOptionsChange({ deduplicate: true, deduplicateStrategy: 'none' });
        onClose();
      },
    },
    {
      id: 'sort-freq',
      category: 'Transforms',
      title: 'Sort by Frequency (s.value_counts)',
      badge: 'PANDAS',
      description: 'Order items with most frequent occurrences first',
      icon: <ArrowUpDown className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onOptionsChange({ sort: 'freq-desc' });
        onClose();
      },
    },
    {
      id: 'reverse-lines',
      category: 'Transforms',
      title: 'Reverse Line Order',
      description: 'Flip lines upside down',
      icon: <ArrowUpDown className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onReverseLines();
        onClose();
      },
    },
    {
      id: 'shuffle-lines',
      category: 'Transforms',
      title: 'Random Shuffle Lines',
      description: 'Randomize list line order',
      icon: <Shuffle className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onShuffleLines();
        onClose();
      },
    },
    {
      id: 'extract-numbers',
      category: 'Transforms',
      title: 'Extract Numbers / IDs',
      description: 'Pull all numeric IDs and quantities from text',
      icon: <Hash className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onExtract('numbers');
        onClose();
      },
    },
    {
      id: 'extract-emails',
      category: 'Transforms',
      title: 'Extract Emails',
      description: 'Filter and isolate all valid email addresses',
      icon: <Mail className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onExtract('emails');
        onClose();
      },
    },

    // 4. All Presets
    ...PRESETS.map((preset) => ({
      id: `preset-${preset.id}`,
      category: 'Presets' as const,
      title: preset.name,
      badge: preset.badge,
      description: preset.description,
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onSelectPreset(preset);
        onClose();
      },
    })),
  ];

  // Filter commands by query
  const baseFiltered = allCommands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.badge && cmd.badge.toLowerCase().includes(q))
    );
  });

  // Dynamic Natural Language Magic Item
  const magicCommands: CommandItem[] = [];
  if (query.trim().length > 1) {
    const nlpMatch = parseNaturalLanguageIntent(query, {}, columnText);
    if (nlpMatch.matched) {
      magicCommands.push({
        id: 'magic-command-run',
        category: 'Conduit',
        title: `🪄 Apply: ${nlpMatch.description}`,
        badge: 'MAGIC',
        description: 'Execute natural language command on dataset',
        icon: <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />,
        action: () => {
          if (nlpMatch.transformedText !== undefined) {
            onUpdateColumnText(nlpMatch.transformedText);
          }
          if (Object.keys(nlpMatch.options).length > 0) {
            onOptionsChange(nlpMatch.options);
          }
          if (nlpMatch.extractType) {
            onExtract(nlpMatch.extractType);
          }
          if (nlpMatch.reverseLines) {
            onReverseLines();
          }
          if (nlpMatch.shuffleLines) {
            onShuffleLines();
          }
          onClose();
        },
      });
    }
  }

  const filtered = [...magicCommands, ...baseFiltered];

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/[0.08]">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, formats, presets, or paste conduits..."
            className="w-full text-sm bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {toastMessage && (
          <div className="px-4 py-2 bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Command List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands found for "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-obsidian-850 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cmd.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{cmd.title}</span>
                        {cmd.badge && (
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded ${
                              isSelected
                                ? 'bg-white text-indigo-700'
                                : 'bg-slate-200 dark:bg-obsidian-750 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                      isSelected
                        ? 'text-indigo-100 bg-indigo-700'
                        : 'text-slate-400 bg-slate-100 dark:bg-obsidian-800'
                    }`}
                  >
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-obsidian-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-obsidian-800 font-mono text-[10px]">↑↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-obsidian-800 font-mono text-[10px]">↵</kbd>{' '}
              Execute
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-obsidian-800 font-mono text-[10px]">esc</kbd>{' '}
              Close
            </span>
          </div>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">delim Spotlight</span>
        </div>
      </div>
    </div>
  );
};
