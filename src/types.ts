export type QuoteStyle = 'none' | 'single' | 'double' | 'backtick' | 'custom';

export type DelimiterPreset = ',' | ';' | '|' | ' ' | '\t' | '\n' | 'custom';

export type ExplodePreset = '\n' | ',' | ';' | ' ' | '\t' | 'custom';

export type SortOrder = 'none' | 'asc' | 'desc' | 'numeric-asc' | 'numeric-desc' | 'freq-desc' | 'freq-asc';

export type CaseTransform = 'none' | 'upper' | 'lower' | 'title';

export type DeduplicateStrategy = 'first' | 'last' | 'none'; // pandas drop_duplicates(keep='first'|'last'|False)

export interface DelimOptions {
  delimiter: string;
  explode: string;
  isExplodeRegex?: boolean;
  tidyUp: boolean; // true = single-line (or interval-line) output, false = newline with delimiter
  deduplicate: boolean;
  deduplicateStrategy: DeduplicateStrategy;
  zeroPadWidth: number; // 0 = disabled, > 0 = zero-pad numbers to N digits (e.g. 5 for zip codes)
  trimWhitespace: boolean;
  skipEmpty: boolean;
  fillnaValue: string; // pandas fillna fallback for blank items
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

export interface NumericStats {
  count: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
}

export interface TextStats {
  lineCount: number;
  itemCount: number;
  uniqueCount: number;
  duplicateCount: number;
  charCount: number;
  numericStats?: NumericStats | null;
}

export type StudioMode = 'standard' | 'diff' | 'template' | 'slicer';

export type SetOpType = 'diffA' | 'diffB' | 'intersect' | 'union' | 'symDiff';

export interface SetOpOptions {
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
  skipEmpty?: boolean;
  delimiter?: string;
  quotes?: QuoteStyle;
  prefix?: string;
  suffix?: string;
  sort?: SortOrder;
}

export interface SetOpResult {
  result: string;
  items: string[];
  countA: number;
  countB: number;
  resultCount: number;
  overlapCount: number;
  uniqueACount: number;
  uniqueBCount: number;
}

export type SqlDialect = 'standard' | 'oracle' | 'postgres' | 'bigquery' | 'values';

export interface SqlDialectOptions {
  columnName?: string;
  quotes?: QuoteStyle;
  chunkSize?: number; // For Oracle ORA-01795 (default 1000)
  isNumeric?: boolean;
}

export interface DetectedTable {
  isTable: boolean;
  delimiter: string;
  delimiterName: string;
  columnCount: number;
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export interface TemplateToken {
  token: string;
  label: string;
  description: string;
  example: string;
}
