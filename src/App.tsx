import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudioToolbar } from './components/StudioToolbar';
import { EditorPane } from './components/EditorPane';
import { SettingsDrawer } from './components/SettingsDrawer';
import { DuplicateInspector } from './components/DuplicateInspector';
import { PrivacyNotice } from './components/PrivacyNotice';
import { TwoListDiffPane } from './components/TwoListDiffPane';
import { TemplatePane } from './components/TemplatePane';
import { TableSlicerPane } from './components/TableSlicerPane';
import { DelimOptions, Preset, StudioMode } from './types';
import {
  SlidersHorizontal,
  Layers,
  Braces,
  Table,
} from 'lucide-react';
import {
  DEFAULT_OPTIONS,
  columnToDelimited,
  delimitedToColumn,
  extractNumbers,
  extractEmails,
  extractUrls,
  extractUuids,
  cleanExcelPasted,
  reverseLines,
  shuffleLines,
  getDuplicateDetails,
} from './lib/engine';
import { SAMPLE_INPUT } from './lib/presets';

export const App: React.FC = () => {
  const [studioMode, setStudioMode] = useState<StudioMode>('standard');
  const [columnText, setColumnText] = useState<string>('');
  const [delimitedText, setDelimitedText] = useState<string>('');
  const [options, setOptions] = useState<DelimOptions>(DEFAULT_OPTIONS);
  const [liveMode, setLiveMode] = useState<boolean>(true);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Dark mode class toggle on root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Transform Column to Delimited
  const handleConvertToDelimited = useCallback(
    (textToConvert: string = columnText, opts: DelimOptions = options) => {
      const result = columnToDelimited(textToConvert, opts);
      setDelimitedText(result);
    },
    [columnText, options]
  );

  // Transform Delimited to Column
  const handleConvertToColumn = useCallback(
    (textToConvert: string = delimitedText, opts: DelimOptions = options) => {
      const result = delimitedToColumn(textToConvert, opts);
      setColumnText(result);
    },
    [delimitedText, options]
  );

  // Live Auto-Convert effect when columnText or options change
  useEffect(() => {
    if (liveMode) {
      handleConvertToDelimited(columnText, options);
    }
  }, [columnText, options, liveMode, handleConvertToDelimited]);

  // Options update handler
  const handleUpdateOptions = (updated: Partial<DelimOptions>) => {
    setOptions((prev) => {
      const next = { ...prev, ...updated };
      if (liveMode) {
        handleConvertToDelimited(columnText, next);
      }
      return next;
    });
  };

  // Preset Selection
  const handleSelectPreset = (preset: Preset) => {
    setOptions((prev) => {
      const next = { ...prev, ...preset.options };
      if (liveMode) {
        handleConvertToDelimited(columnText, next);
      }
      return next;
    });
  };

  // Extractors Handler
  const handleExtract = (type: 'numbers' | 'emails' | 'urls' | 'uuids' | 'excel') => {
    let extracted = '';
    switch (type) {
      case 'numbers':
        extracted = extractNumbers(columnText);
        break;
      case 'emails':
        extracted = extractEmails(columnText);
        break;
      case 'urls':
        extracted = extractUrls(columnText);
        break;
      case 'uuids':
        extracted = extractUuids(columnText);
        break;
      case 'excel':
        extracted = cleanExcelPasted(columnText);
        break;
    }
    if (extracted) {
      setColumnText(extracted);
      if (liveMode) {
        handleConvertToDelimited(extracted, options);
      }
    }
  };

  // Reverse & Shuffle Handlers
  const handleReverseLines = () => {
    const reversed = reverseLines(columnText);
    setColumnText(reversed);
    if (liveMode) {
      handleConvertToDelimited(reversed, options);
    }
  };

  const handleShuffleLines = () => {
    const shuffled = shuffleLines(columnText);
    setColumnText(shuffled);
    if (liveMode) {
      handleConvertToDelimited(shuffled, options);
    }
  };

  // Swap Left & Right Data
  const handleSwap = () => {
    const tempCol = columnText;
    setColumnText(delimitedText);
    setDelimitedText(tempCol);
  };

  // Clear both
  const handleClear = () => {
    setColumnText('');
    setDelimitedText('');
  };

  // Reset Everything
  const handleResetAll = () => {
    setColumnText('');
    setDelimitedText('');
    setOptions(DEFAULT_OPTIONS);
  };

  // Load Sample
  const handleLoadSample = (sampleData: string = SAMPLE_INPUT) => {
    setColumnText(sampleData);
    handleConvertToDelimited(sampleData, options);
  };

  // Deduplication from Modal
  const handleRemoveDuplicates = () => {
    handleUpdateOptions({ deduplicate: true });
  };

  const duplicateDetails = getDuplicateDetails(columnText, '\n');

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to convert to delimited
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleConvertToColumn();
        } else {
          handleConvertToDelimited();
        }
      }
      // Cmd/Ctrl + K to clear
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleConvertToDelimited, handleConvertToColumn]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onResetAll={handleResetAll}
        isFullWidth={isFullWidth}
        onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
      />

      <main
        className={`flex-1 w-full mx-auto py-4 space-y-3.5 transition-all duration-300 ${
          isFullWidth ? 'max-w-[98vw] px-2 sm:px-4 lg:px-6' : 'max-w-7xl px-4 sm:px-6 lg:px-8'
        }`}
      >
        {/* Mode Switcher Segmented Control */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
          <div className="inline-flex items-center p-1 bg-slate-200/60 dark:bg-obsidian-850/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] text-xs font-medium gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setStudioMode('standard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                studioMode === 'standard'
                  ? 'bg-white dark:bg-obsidian-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Delimiter</span>
            </button>

            <button
              type="button"
              onClick={() => setStudioMode('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                studioMode === 'diff'
                  ? 'bg-white dark:bg-obsidian-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Two-List Diff</span>
            </button>

            <button
              type="button"
              onClick={() => setStudioMode('template')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                studioMode === 'template'
                  ? 'bg-white dark:bg-obsidian-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Braces className="w-3.5 h-3.5" />
              <span>Template Engine</span>
            </button>

            <button
              type="button"
              onClick={() => setStudioMode('slicer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                studioMode === 'slicer'
                  ? 'bg-white dark:bg-obsidian-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table Slicer</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>100% Client-Side • Private • Zero Telemetry</span>
          </div>
        </div>

        {/* Mode Views */}
        {studioMode === 'standard' && (
          <>
            <StudioToolbar
              options={options}
              onOptionsChange={handleUpdateOptions}
              onSelectPreset={handleSelectPreset}
              onExtract={handleExtract}
              onReverseLines={handleReverseLines}
              onShuffleLines={handleShuffleLines}
              onConvertToDelimited={() => handleConvertToDelimited()}
              onConvertToColumn={() => handleConvertToColumn()}
              onSwap={handleSwap}
              onClear={handleClear}
              liveMode={liveMode}
              onToggleLiveMode={() => setLiveMode(!liveMode)}
              onToggleSettings={() => setSettingsOpen(!settingsOpen)}
              settingsOpen={settingsOpen}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              <EditorPane
                title="Column Data"
                subtitle="Paste lists, spreadsheet columns, or raw text"
                value={columnText}
                onChange={(val) => {
                  setColumnText(val);
                  if (liveMode) {
                    handleConvertToDelimited(val, options);
                  }
                }}
                placeholder={`Enter or paste column data here...\n\nExample:\n90210\n10001\n94103\n90210`}
                delimiter="\n"
                isSource={true}
                onSelectSample={handleLoadSample}
                onInspectDuplicates={() => setDuplicateModalOpen(true)}
                onOpenSlicer={() => setStudioMode('slicer')}
              />

              <EditorPane
                title="Delimited Data"
                subtitle="Formatted output for SQL, JSON, CSV, or code"
                value={delimitedText}
                onChange={(val) => {
                  setDelimitedText(val);
                  if (liveMode) {
                    handleConvertToColumn(val, options);
                  }
                }}
                placeholder={`Delimited output appears here...\n\nExample:\n'90210', '10001', '94103'`}
                delimiter={options.delimiter}
                isSource={false}
                isPrimaryCopy={true}
                onInspectDuplicates={() => setDuplicateModalOpen(true)}
              />
            </div>

            <SettingsDrawer
              options={options}
              onChange={handleUpdateOptions}
              isOpen={settingsOpen}
              onToggleOpen={() => setSettingsOpen(!settingsOpen)}
            />
          </>
        )}

        {studioMode === 'diff' && (
          <TwoListDiffPane
            initialListA={columnText}
            initialListB=""
          />
        )}

        {studioMode === 'template' && (
          <TemplatePane
            initialInput={columnText}
          />
        )}

        {studioMode === 'slicer' && (
          <TableSlicerPane
            initialData={columnText}
            onSendToDelim={(col) => {
              setColumnText(col);
              setStudioMode('standard');
            }}
          />
        )}
      </main>

      {/* Duplicate Frequency Inspector Modal */}
      {duplicateModalOpen && (
        <DuplicateInspector
          duplicates={duplicateDetails}
          onClose={() => setDuplicateModalOpen(false)}
          onRemoveDuplicates={handleRemoveDuplicates}
        />
      )}

      <PrivacyNotice isFullWidth={isFullWidth} />
    </div>
  );
};

export default App;
