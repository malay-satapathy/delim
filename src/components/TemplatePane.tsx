import React, { useState, useMemo, useRef } from 'react';
import {
  Braces,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Plus,
} from 'lucide-react';
import { applyTemplate } from '../lib/engine';
import { TemplateToken } from '../types';

interface TemplatePaneProps {
  initialInput?: string;
}

const SAMPLE_ITEMS = `apple
banana
cherry
dragon fruit
elderberry`;

const TOKENS: TemplateToken[] = [
  { token: '{item}', label: '{item}', description: 'Original text', example: 'apple' },
  { token: '{index1}', label: '{index1}', description: '1-based counter', example: '1, 2, 3...' },
  { token: '{index}', label: '{index}', description: '0-based counter', example: '0, 1, 2...' },
  { token: '{item_lower}', label: '{item_lower}', description: 'lowercase', example: 'apple' },
  { token: '{item_upper}', label: '{item_upper}', description: 'UPPERCASE', example: 'APPLE' },
  { token: '{item_title}', label: '{item_title}', description: 'Title Case', example: 'Dragon Fruit' },
  { token: '{item_slug}', label: '{item_slug}', description: 'URL-friendly slug', example: 'dragon-fruit' },
  { token: '{item_escaped}', label: '{item_escaped}', description: "SQL-escaped ('')", example: "O''Reilly" },
  { token: '{item_json}', label: '{item_json}', description: 'JSON escaped', example: '\\"quote\\"' },
];

const TEMPLATE_PRESETS = [
  {
    name: 'SQL INSERT',
    template: "INSERT INTO items (id, name, slug) VALUES ({index1}, '{item_escaped}', '{item_slug}');",
  },
  {
    name: 'cURL API',
    template: 'curl -X POST https://api.example.com/v1/{item_slug} -H "Content-Type: application/json"',
  },
  {
    name: 'Markdown Checklist',
    template: '- [ ] {item}',
  },
  {
    name: 'TS / JS Constant',
    template: "export const {item_upper} = '{item}';",
  },
  {
    name: 'HTML Option',
    template: '<option value="{item_slug}">{item}</option>',
  },
];

export const TemplatePane: React.FC<TemplatePaneProps> = ({ initialInput = '' }) => {
  const [inputText, setInputText] = useState(initialInput || SAMPLE_ITEMS);
  const [template, setTemplate] = useState("INSERT INTO items (id, name, slug) VALUES ({index1}, '{item_escaped}', '{item_slug}');");
  const [lineDelimiter, setLineDelimiter] = useState('\n');
  const [copied, setCopied] = useState(false);
  const templateInputRef = useRef<HTMLInputElement>(null);

  // Split input lines
  const items = useMemo(() => {
    return inputText
      .split(/\r?\n/)
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
  }, [inputText]);

  // Interpolated result
  const output = useMemo(() => {
    return applyTemplate(items, template, lineDelimiter);
  }, [items, template, lineDelimiter]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'templated-output.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertToken = (token: string) => {
    const input = templateInputRef.current;
    if (!input) {
      setTemplate((prev) => `${prev} ${token}`);
      return;
    }
    const start = input.selectionStart ?? template.length;
    const end = input.selectionEnd ?? template.length;
    const next = template.substring(0, start) + token + template.substring(end);
    setTemplate(next);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + token.length, start + token.length);
    }, 10);
  };

  return (
    <div className="space-y-3.5">
      {/* Top Configuration Bar */}
      <div className="bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm p-3.5 space-y-3">
        {/* Template Input Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Braces className="w-3.5 h-3.5 text-indigo-500" />
              <span>Template Pattern</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Join lines by:</span>
              <select
                value={lineDelimiter}
                onChange={(e) => setLineDelimiter(e.target.value)}
                className="px-2 py-0.5 text-xs rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="\n">Newlines (\n)</option>
                <option value=",\n">Comma + Newline (,\n)</option>
                <option value=";\n">Semicolon + Newline (;\n)</option>
                <option value=" ">Space</option>
              </select>
            </div>
          </div>

          <div className="relative flex items-center">
            <input
              ref={templateInputRef}
              type="text"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="e.g. INSERT INTO tbl VALUES ({index1}, '{item}');"
              className="w-full px-3.5 py-2.5 font-mono text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50/70 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Clickable Token Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 select-none">Insert Token:</span>
          {TOKENS.map((t) => (
            <button
              key={t.token}
              type="button"
              onClick={() => insertToken(t.token)}
              title={`${t.description} (e.g. ${t.example})`}
              className="flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all select-none"
            >
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Preset Templates Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1 select-none">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Preset Templates:</span>
          </span>
          {TEMPLATE_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setTemplate(p.template)}
              className={`px-2.5 py-1 text-xs font-medium rounded-xl border transition-all ${
                template === p.template
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500/20'
                  : 'bg-white dark:bg-obsidian-850 border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Workspaces: Input List vs Interpolated Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Input Items Pane */}
        <div className="flex flex-col h-[560px] xl:h-[calc(100vh-320px)] min-h-[480px] bg-white dark:bg-obsidian-900 border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-obsidian-850/60 border-b border-slate-200/80 dark:border-white/[0.06]">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Source Items ({items.length})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">One item per line</p>
            </div>
            <button
              type="button"
              onClick={() => setInputText('')}
              disabled={!inputText}
              title="Clear text"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter source items (one per line)..."
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none leading-relaxed whitespace-pre overflow-auto"
          />

          <div className="flex items-center justify-between px-4 py-2 bg-slate-50/60 dark:bg-obsidian-850/50 border-t border-slate-200/80 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400 select-none">
            <span>{items.length} items ready for template</span>
            <span>{inputText.length.toLocaleString()} chars</span>
          </div>
        </div>

        {/* Interpolated Output Pane */}
        <div className="flex flex-col h-[560px] xl:h-[calc(100vh-320px)] min-h-[480px] bg-white dark:bg-obsidian-900 border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-obsidian-850/60 border-b border-slate-200/80 dark:border-white/[0.06]">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Interpolated Result
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Generated using template pattern</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!output}
                title="Download Result"
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Result'}</span>
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={output}
            placeholder="Templated output will appear here automatically..."
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none leading-relaxed whitespace-pre overflow-auto"
          />

          <div className="flex items-center justify-between px-4 py-2 bg-slate-50/60 dark:bg-obsidian-850/50 border-t border-slate-200/80 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400 select-none">
            <span>{items.length} records interpolated</span>
            <span>{output.length.toLocaleString()} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
};
