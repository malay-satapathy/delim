import React from 'react';
import { ShieldCheck, EyeOff, Ban, HeartHandshake } from 'lucide-react';

interface PrivacyNoticeProps {
  isFullWidth?: boolean;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ isFullWidth = false }) => {
  return (
    <footer className="w-full mt-12 pt-8 pb-12 border-t border-slate-200/80 dark:border-white/[0.08]">
      <div
        className={`w-full mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isFullWidth ? 'max-w-[98vw]' : 'max-w-7xl'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                100% Client-Side
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                All transformations execute strictly in your browser's local memory. No backend server exists.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Zero Data Stored
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Nothing is saved, recorded, or transmitted. Completely safe for private tokens, SQL records, and PII.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Zero Ads & Trackers
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                No Google Analytics, no tracking cookies, and no advertisements. Ever.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Free & Open Source
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Released under the MIT License. Audit, fork, or self-host freely on GitHub Pages.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-3">
          <p>
            <strong>delim</strong> — The fast, private delimiter & list transformer.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/malay-satapathy/delim"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <span>MIT License</span>
            <span>•</span>
            <span>Works Offline</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
