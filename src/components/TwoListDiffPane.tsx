import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
} from 'lucide-react';
import { SetOpType, QuoteStyle } from '../types';
import { performSetOperation } from '../lib/engine';

interface TwoListDiffPaneProps {
  initialListA?: string;
  initialListB?: string;
}

const SAMPLE_A = `apple
banana
cherry
date
elderberry
fig`;

const SAMPLE_B = `banana
date
grape
honeydew
fig
kiwi`;

export const TwoListDiffPane: React.FC<TwoListDiffPaneProps> = ({
  initialListA = '',
  initialListB = '',
}) => {
  const [listA, setListA] = useState(initialListA);
  const [listB, setListB] = useState(initialListB);
  const [op, setOp] = useState<SetOpType>('diffA');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [delimiter, setDelimiter] = useState('\n');
  const [quotes, setQuotes] = useState<QuoteStyle>('none');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute set operation result
  const result = useMemo(() => {
    return performSetOperation(listA, listB, op, {
      caseSensitive,
      trimWhitespace,
      delimiter,
      quotes,
      prefix,
      suffix,
    });
  }, [listA, listB, op, caseSensitive, trimWhitespace, delimiter, quotes, prefix, suffix]);

  const handleCopy = async () => {
    if (!result.result) return;
    await navigator.clipboard.writeText(result.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result.result) return;
    const blob = new Blob([result.result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `set-operation-${op}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setListA(SAMPLE_A);
    setListB(SAMPLE_B);
  };

  const clearAll = () => {
    setListA('');
    setListB('');
  };

  const OPERATIONS: {
    id: SetOpType;
    label: string;
    symbol: string;
    desc: string;
    badgeColor: string;
  }[] = [
    {
      id: 'diffA',
      label: 'Only in List A',
      symbol: 'A − B',
      desc: 'Items in List A that do not appear in List B',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'diffB',
      label: 'Only in List B',
      symbol: 'B − A',
      desc: 'Items in List B that do not appear in List A',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'intersect',
      label: 'In Both (Intersection)',
      symbol: 'A ∩ B',
      desc: 'Common items present in both List A and List B',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'union',
      label: 'Combined (Union)',
      symbol: 'A ∪ B',
      desc: 'All unique items combined from both lists',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    {
      id: 'symDiff',
      label: 'Symmetric Difference',
      symbol: 'A Δ B',
      desc: 'Items in either list, but not in both',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Control Bar: Operation Selector & Controls */}
      <div className="bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Operation Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 select-none">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Operation:</span>
            </span>
            {OPERATIONS.map((operation) => {
              const active = op === operation.id;
              return (
                <button
                  key={operation.id}
                  type="button"
                  onClick={() => setOp(operation.id)}
                  title={operation.desc}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 ${
                    active
                      ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-slate-50 dark:bg-obsidian-850 border-slate-200/80 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                  }`}
                >
                  <span className="font-mono font-bold text-[11px] opacity-90">{operation.symbol}</span>
                  <span>{operation.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions (Sample, Clear) */}
          <div className="flex items-center gap-2 ml-auto">
            {!listA && !listB && (
              <button
                type="button"
                onClick={loadSample}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-obsidian-800"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Sample</span>
              </button>
            )}
            <button
              type="button"
              onClick={clearAll}
              disabled={!listA && !listB}
              title="Clear both lists"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Options Row: Case Sensitive, Trim, Quotes, Delimiter */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCaseSensitive(!caseSensitive)}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 select-none"
            >
              {caseSensitive ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Case Sensitive</span>
            </button>

            <button
              type="button"
              onClick={() => setTrimWhitespace(!trimWhitespace)}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 select-none"
            >
              {trimWhitespace ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Trim Whitespace</span>
            </button>
          </div>

          {/* Output Format Selectors */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Format:</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="\n">Lines (\n)</option>
              <option value=", ">Comma + Space (, )</option>
              <option value=",">Comma (,)</option>
              <option value="; ">Semicolon (; )</option>
              <option value="|">Pipe (|)</option>
            </select>

            <select
              value={quotes}
              onChange={(e) => setQuotes(e.target.value as QuoteStyle)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="none">No Quotes</option>
              <option value="single">Single ('x')</option>
              <option value="double">Double ("x")</option>
              <option value="backtick">Backticks (`x`)</option>
            </select>

            <input
              type="text"
              placeholder="Prefix e.g. ("
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-20 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Suffix e.g. )"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className="w-20 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-obsidian-850 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3-Column Workspaces: List A, List B, and Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Pane A */}
        <div className="flex flex-col h-[560px] xl:h-[calc(100vh-310px)] min-h-[480px] bg-white dark:bg-obsidian-900 border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-obsidian-850/60 border-b border-slate-200/80 dark:border-white/[0.06]">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
                A
              </span>
              <span>List A</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {result.countA} lines ({result.uniqueACount} unique)
            </span>
          </div>
          <textarea
            value={listA}
            onChange={(e) => setListA(e.target.value)}
            placeholder="Enter List A items (one per line)..."
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none leading-relaxed whitespace-pre overflow-auto"
          />
        </div>

        {/* Pane B */}
        <div className="flex flex-col h-[560px] xl:h-[calc(100vh-310px)] min-h-[480px] bg-white dark:bg-obsidian-900 border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-obsidian-850/60 border-b border-slate-200/80 dark:border-white/[0.06]">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-[10px]">
                B
              </span>
              <span>List B</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {result.countB} lines ({result.uniqueBCount} unique)
            </span>
          </div>
          <textarea
            value={listB}
            onChange={(e) => setListB(e.target.value)}
            placeholder="Enter List B items (one per line)..."
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none leading-relaxed whitespace-pre overflow-auto"
          />
        </div>

        {/* Result Pane */}
        <div className="flex flex-col h-[560px] xl:h-[calc(100vh-310px)] min-h-[480px] bg-white dark:bg-obsidian-900 border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 dark:bg-obsidian-850/60 border-b border-slate-200/80 dark:border-white/[0.06]">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold">
                {OPERATIONS.find((o) => o.id === op)?.symbol}
              </span>
              <span>Output ({result.resultCount})</span>
            </h3>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!result.result}
                title="Download Result"
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!result.result}
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
            value={result.result}
            placeholder="Comparison result will appear here automatically..."
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none outline-none leading-relaxed whitespace-pre overflow-auto"
          />

          <div className="flex items-center justify-between px-4 py-2 bg-slate-50/60 dark:bg-obsidian-850/50 border-t border-slate-200/80 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400 select-none">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {result.resultCount} items
              </span>
              <span>•</span>
              <span>
                {result.overlapCount} overlap (in both)
              </span>
            </div>
            <div>
              <span>{result.result.length.toLocaleString()} chars</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
