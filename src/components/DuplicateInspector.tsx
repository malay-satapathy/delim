import React from 'react';
import { X, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import { DuplicateDetail } from '../lib/engine';

interface DuplicateInspectorProps {
  duplicates: DuplicateDetail[];
  onClose: () => void;
  onRemoveDuplicates: () => void;
}

export const DuplicateInspector: React.FC<DuplicateInspectorProps> = ({
  duplicates,
  onClose,
  onRemoveDuplicates,
}) => {
  const [copiedVal, setCopiedVal] = React.useState<string | null>(null);

  const handleCopyValue = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedVal(val);
    setTimeout(() => setCopiedVal(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Duplicate Inspector</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {duplicates.length} unique items appeared multiple times
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Duplicates */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2">
          {duplicates.map((item) => (
            <div
              key={item.value}
              className="flex items-center justify-between px-3 py-2 text-xs font-mono rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="truncate max-w-[260px] text-slate-800 dark:text-slate-200 font-medium">
                {item.value}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  {item.count}x
                </span>
                <button
                  onClick={() => handleCopyValue(item.value)}
                  title="Copy value"
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                >
                  {copiedVal === item.value ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              onRemoveDuplicates();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove All Duplicates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
