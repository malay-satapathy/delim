import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Wand2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { IntentCard, classifyDataIntent, parseNaturalLanguageIntent } from '../lib/intent';
import { isOnDeviceAIAvailable, queryOnDeviceAIFallback } from '../lib/onDeviceAI';
import { DelimOptions } from '../types';

interface IntentDeckProps {
  input: string;
  options: DelimOptions;
  onOptionsChange: (newOptions: Partial<DelimOptions>) => void;
  onUpdateInput?: (newText: string, newOptions?: Partial<DelimOptions>) => void;
  onApplyExtraction?: (type: 'numbers' | 'emails' | 'urls' | 'uuids' | 'excel') => void;
  onReverseLines?: () => void;
  onShuffleLines?: () => void;
  onSelectResult?: (result: string) => void;
  onOpenSpotlight?: () => void;
}

export const IntentDeck: React.FC<IntentDeckProps> = ({
  input,
  options,
  onOptionsChange,
  onUpdateInput,
  onApplyExtraction,
  onReverseLines,
  onShuffleLines,
  onSelectResult,
  onOpenSpotlight,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [magicFeedback, setMagicFeedback] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);
  const [hasOnDeviceAI, setHasOnDeviceAI] = useState(false);

  useEffect(() => {
    isOnDeviceAIAvailable().then((avail) => setHasOnDeviceAI(avail));
  }, []);

  const cards: IntentCard[] = React.useMemo(() => {
    return classifyDataIntent(input);
  }, [input]);

  // Copy card handler (copies and synchronizes active format)
  const handleCopyCard = async (card: IntentCard) => {
    try {
      await navigator.clipboard.writeText(card.formattedResult);
      setCopiedId(card.id);
      setTimeout(() => setCopiedId(null), 2000);
      if (onSelectResult) {
        onSelectResult(card.formattedResult);
      }
      if (card.options) {
        onOptionsChange(card.options);
      }
    } catch {
      // Fallback
    }
  };

  // Keyboard shortcut listener for ⌘1, ⌘2, ⌘3
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const isTyping =
          target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

        if (!isTyping && cards.length > 0) {
          if (e.key === '1' && cards[0]) {
            e.preventDefault();
            handleCopyCard(cards[0]);
          } else if (e.key === '2' && cards[1]) {
            e.preventDefault();
            handleCopyCard(cards[1]);
          } else if (e.key === '3' && cards[2]) {
            e.preventDefault();
            handleCopyCard(cards[2]);
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards]);

  // Magic wand NLP submit
  const handleMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicPrompt.trim()) return;

    const res = parseNaturalLanguageIntent(magicPrompt, options, input);

    if (res.matched) {
      if (res.transformedText !== undefined && onUpdateInput) {
        onUpdateInput(res.transformedText, res.options);
      } else if (Object.keys(res.options).length > 0) {
        onOptionsChange(res.options);
      }
      if (res.extractType && onApplyExtraction) {
        onApplyExtraction(res.extractType);
      }
      if (res.reverseLines && onReverseLines) {
        onReverseLines();
      }
      if (res.shuffleLines && onShuffleLines) {
        onShuffleLines();
      }

      setMagicFeedback({ type: 'success', text: res.description });
    } else if (hasOnDeviceAI) {
      // Async fallback to local Chrome Gemini Nano
      const aiRes = await queryOnDeviceAIFallback(magicPrompt, input);
      if (aiRes && aiRes.transformedText && onUpdateInput) {
        onUpdateInput(aiRes.transformedText);
        setMagicFeedback({ type: 'success', text: `On-Device AI: ${aiRes.description}` });
      } else {
        setMagicFeedback({ type: 'warning', text: res.description });
      }
    } else {
      setMagicFeedback({ type: 'warning', text: res.description });
    }

    setMagicPrompt('');
    setTimeout(() => setMagicFeedback(null), 5000);
  };

  if (!input || input.trim().length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-indigo-50/90 dark:from-obsidian-900 dark:via-obsidian-850 dark:to-obsidian-900 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl p-2.5 shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 select-none">
      {/* Top Strip: Header & Predictive Cards */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/20" />
            <span>Auto-Synthesized (Instant Intent):</span>
          </div>
          {hasOnDeviceAI && (
            <span className="px-1.5 py-0.2 text-[9px] font-mono font-medium rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
              Nano AI
            </span>
          )}
        </div>

        {/* Action Cards (Top 3 Predictions) */}
        <div className="flex flex-wrap items-center gap-2">
          {cards.map((card) => {
            const isCopied = copiedId === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCopyCard(card)}
                title={`Click to copy: ${card.description}`}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 ${
                  isCopied
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-obsidian-800 border-indigo-200/90 dark:border-white/[0.08] hover:border-indigo-500 hover:shadow-xs text-slate-800 dark:text-slate-200'
                }`}
              >
                <span
                  className={`px-1 py-0.2 text-[9px] font-mono font-bold rounded ${
                    isCopied
                      ? 'bg-white text-emerald-700'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {card.badge}
                </span>

                <span className="font-semibold">{card.title}</span>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <span className="hidden sm:inline font-mono opacity-80">{card.hotkey}</span>
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Copy className="w-3 h-3 group-hover:text-indigo-500" />
                  )}
                </div>
              </button>
            );
          })}

          {onOpenSpotlight && (
            <button
              type="button"
              onClick={onOpenSpotlight}
              title="Open Spotlight Command Palette (⌘K)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-obsidian-850 hover:bg-slate-100 dark:hover:bg-obsidian-800 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400"
            >
              <span>⌘K</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar: Natural Language "Magic Wand" Prompt */}
      <div className="pt-1.5 border-t border-indigo-100/80 dark:border-white/[0.05]">
        <form onSubmit={handleMagicSubmit} className="relative flex items-center w-full">
          <Wand2 className="w-3.5 h-3.5 text-indigo-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={magicPrompt}
            onChange={(e) => setMagicPrompt(e.target.value)}
            placeholder="Magic Prompt: e.g. 'sql in numbers', 'pad 5 zeros', 'python list uppercase', 'dedupe keep last'..."
            className="w-full pl-9 pr-24 py-1.5 text-xs rounded-xl border border-indigo-200/90 dark:border-white/[0.08] bg-white/90 dark:bg-obsidian-850 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!magicPrompt.trim()}
            className="absolute right-1.5 px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
          >
            <span>Apply</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </form>

        {magicFeedback && (
          <div
            className={`mt-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] flex items-center gap-2 animate-in fade-in duration-150 ${
              magicFeedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-200'
            }`}
          >
            {magicFeedback.type === 'success' ? (
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>
              {magicFeedback.type === 'success' ? (
                <>
                  Applied: <strong>{magicFeedback.text}</strong>
                </>
              ) : (
                magicFeedback.text
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
