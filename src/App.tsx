import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PresetsBar } from './components/PresetsBar';
import { CenterControls } from './components/CenterControls';
import { EditorPane } from './components/EditorPane';
import { SettingsDrawer } from './components/SettingsDrawer';
import { PrivacyNotice } from './components/PrivacyNotice';
import { DelimOptions, Preset } from './types';
import { DEFAULT_OPTIONS, columnToDelimited, delimitedToColumn } from './lib/engine';
import { SAMPLE_INPUT } from './lib/presets';

export const App: React.FC = () => {
  const [columnText, setColumnText] = useState<string>('');
  const [delimitedText, setDelimitedText] = useState<string>('');
  const [options, setOptions] = useState<DelimOptions>(DEFAULT_OPTIONS);
  const [liveMode, setLiveMode] = useState<boolean>(true);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
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
  const handleLoadSample = () => {
    setColumnText(SAMPLE_INPUT);
    handleConvertToDelimited(SAMPLE_INPUT, options);
  };

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onResetAll={handleResetAll}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Presets Bar */}
        <PresetsBar onSelectPreset={handleSelectPreset} currentOptions={options} />

        {/* Center Actions Hub */}
        <CenterControls
          options={options}
          onOptionsChange={handleUpdateOptions}
          onConvertToDelimited={() => handleConvertToDelimited()}
          onConvertToColumn={() => handleConvertToColumn()}
          onSwap={handleSwap}
          onClear={handleClear}
          liveMode={liveMode}
          onToggleLiveMode={() => setLiveMode(!liveMode)}
        />

        {/* Dual Workspaces (Column & Delimited) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
            placeholder={`Enter or paste multi-line column data here...\n\nExample:\napple\nbanana\ncherry`}
            delimiter="\n"
            isSource={true}
            onLoadSample={handleLoadSample}
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
            placeholder={`Delimited output appears here...\n\nExample:\n'apple', 'banana', 'cherry'`}
            delimiter={options.delimiter}
            isSource={false}
          />
        </div>

        {/* Settings Drawer */}
        <SettingsDrawer
          options={options}
          onChange={handleUpdateOptions}
          isOpen={settingsOpen}
          onToggleOpen={() => setSettingsOpen(!settingsOpen)}
        />
      </main>

      <PrivacyNotice />
    </div>
  );
};

export default App;
