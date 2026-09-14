export type QuoteStyle = 'none' | 'single' | 'double' | 'backtick' | 'custom';

export type DelimiterPreset = ',' | ';' | '|' | ' ' | '\t' | '\n' | 'custom';

export type ExplodePreset = '\n' | ',' | ';' | ' ' | '\t' | 'custom';

export type SortOrder = 'none' | 'asc' | 'desc' | 'numeric-asc' | 'numeric-desc';

export type CaseTransform = 'none' | 'upper' | 'lower' | 'title';

export interface DelimOptions {
  delimiter: string;
  explode: string;
  isExplodeRegex?: boolean;
  tidyUp: boolean; // true = single-line (or interval-line) output, false = newline with delimiter
  deduplicate: boolean;
  trimWhitespace: boolean;
  skipEmpty: boolean;
  quotes: QuoteStyle;
  customQuoteOpen: string;
  customQuoteClose: string;
  itemTagOpen: string;
  itemTagClose: string;
  interval: number; // 0 = disabled, > 0 = break every N items
  intervalWrapOpen: string;
  intervalWrapClose: string;
  sort: SortOrder;
  caseTransform: CaseTransform;
  globalPrefix: string;
  globalSuffix: string;
}

export interface Preset {
  id: string;
  name: string;
  badge?: string;
  description: string;
  options: Partial<DelimOptions>;
}

export interface TextStats {
  lineCount: number;
  itemCount: number;
  uniqueCount: number;
  duplicateCount: number;
  charCount: number;
}
