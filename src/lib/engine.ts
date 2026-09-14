import {
  DelimOptions,
  TextStats,
  SetOpType,
  SetOpOptions,
  SetOpResult,
  SqlDialect,
  SqlDialectOptions,
  DetectedTable,
} from '../types';

export const DEFAULT_OPTIONS: DelimOptions = {
  delimiter: ',',
  explode: '\n',
  isExplodeRegex: false,
  tidyUp: true,
  deduplicate: false,
  trimWhitespace: true,
  skipEmpty: true,
  quotes: 'none',
  customQuoteOpen: '',
  customQuoteClose: '',
  itemTagOpen: '',
  itemTagClose: '',
  interval: 0,
  intervalWrapOpen: '',
  intervalWrapClose: '',
  sort: 'none',
  caseTransform: 'none',
  globalPrefix: '',
  globalSuffix: '',
};

/**
 * Escapes string for safe usage in RegExp
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolves quote characters based on quote style
 */
export function resolveQuotes(options: DelimOptions): { open: string; close: string } {
  switch (options.quotes) {
    case 'single':
      return { open: "'", close: "'" };
    case 'double':
      return { open: '"', close: '"' };
    case 'backtick':
      return { open: '`', close: '`' };
    case 'custom':
      return {
        open: options.customQuoteOpen ?? '',
        close: options.customQuoteClose ?? '',
      };
    case 'none':
    default:
      return { open: '', close: '' };
  }
}

/**
 * Resolves delimiter string (handling aliases like "Spaces", "New Line", "Tab")
 */
export function resolveDelimiter(delimiter: string): string {
  if (delimiter === 'Spaces') return ' ';
  if (delimiter === 'New Line') return '\n';
  if (delimiter === 'Tab') return '\t';
  return delimiter;
}

/**
 * Applies case transformation to a string
 */
export function applyCase(text: string, transform: DelimOptions['caseTransform']): string {
  switch (transform) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    case 'none':
    default:
      return text;
  }
}

/**
 * Converts column data to delimited format based on options
 */
export function columnToDelimited(input: string, userOptions: Partial<DelimOptions> = {}): string {
  if (!input || input.trim() === '') {
    return '';
  }

  const options: DelimOptions = { ...DEFAULT_OPTIONS, ...userOptions };

  // 1. Explode / Split input
  let rawItems: string[];
  if (options.explode === '\n') {
    rawItems = input.split(/\r\n|\r|\n/);
  } else if (options.isExplodeRegex) {
    try {
      const regex = new RegExp(options.explode);
      rawItems = input.split(regex);
    } catch {
      rawItems = input.split(options.explode);
    }
  } else {
    rawItems = input.split(options.explode);
  }

  // 2. Trim and filter empty
  let items = rawItems.map((item) => (options.trimWhitespace ? item.trim() : item));
  if (options.skipEmpty) {
    items = items.filter((item) => item.length > 0);
  }

  // 3. Deduplicate
  if (options.deduplicate) {
    const seen = new Set<string>();
    items = items.filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
  }

  // 4. Case transform
  if (options.caseTransform !== 'none') {
    items = items.map((item) => applyCase(item, options.caseTransform));
  }

  // 5. Sorting
  if (options.sort === 'asc') {
    items = [...items].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (options.sort === 'desc') {
    items = [...items].sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (options.sort === 'numeric-asc') {
    items = [...items].sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.-]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^0-9.-]/g, '')) || 0;
      return numA - numB;
    });
  } else if (options.sort === 'numeric-desc') {
    items = [...items].sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.-]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^0-9.-]/g, '')) || 0;
      return numB - numA;
    });
  }

  // 6. Wrap items with quotes and tags
  const { open: qOpen, close: qClose } = resolveQuotes(options);
  const tagOpen = options.itemTagOpen || '';
  const tagClose = options.itemTagClose || '';

  const wrappedItems = items.map((item) => `${tagOpen}${qOpen}${item}${qClose}${tagClose}`);

  // 7. Joining with delimiter
  const resolvedDelim = resolveDelimiter(options.delimiter);
  const itemSeparator = options.tidyUp ? resolvedDelim : `${resolvedDelim}\n`;

  let result = '';

  // 8. Interval Batching
  if (options.interval && options.interval > 0) {
    const batches: string[] = [];
    const intervalOpen = options.intervalWrapOpen || '';
    const intervalClose = options.intervalWrapClose || '';

    for (let i = 0; i < wrappedItems.length; i += options.interval) {
      const chunk = wrappedItems.slice(i, i + options.interval);
      const chunkContent = chunk.join(itemSeparator);
      batches.push(`${intervalOpen}${chunkContent}${intervalClose}`);
    }

    result = batches.join('\n');
  } else {
    result = wrappedItems.join(itemSeparator);
  }

  // 9. Global Prefix & Suffix
  if (options.globalPrefix) {
    result = `${options.globalPrefix}${result}`;
  }
  if (options.globalSuffix) {
    result = `${result}${options.globalSuffix}`;
  }

  return result;
}

/**
 * Converts delimited data back to column format
 */
export function delimitedToColumn(input: string, userOptions: Partial<DelimOptions> = {}): string {
  if (!input || input.trim() === '') {
    return '';
  }

  const options: DelimOptions = { ...DEFAULT_OPTIONS, ...userOptions };
  let str = input.trim();

  // Strip global prefix/suffix
  if (options.globalPrefix && str.startsWith(options.globalPrefix)) {
    str = str.slice(options.globalPrefix.length);
  }
  if (options.globalSuffix && str.endsWith(options.globalSuffix)) {
    str = str.slice(0, -options.globalSuffix.length);
  }

  // Strip interval tags if present
  if (options.intervalWrapOpen) {
    str = str.split(options.intervalWrapOpen).join('');
  }
  if (options.intervalWrapClose) {
    str = str.split(options.intervalWrapClose).join('');
  }

  // Determine split delimiter
  const resolvedDelim = resolveDelimiter(options.delimiter);
  let rawItems: string[];

  if (resolvedDelim === '\n') {
    rawItems = str.split(/\r\n|\r|\n/);
  } else {
    // If not tidyUp, might have newlines along with delimiter
    const escapedDelim = escapeRegExp(resolvedDelim);
    const splitRegex = new RegExp(`${escapedDelim}\\s*|\\r?\\n`);
    rawItems = str.split(splitRegex);
  }

  // Clean items from tags & quotes
  const { open: qOpen, close: qClose } = resolveQuotes(options);
  const tagOpen = options.itemTagOpen || '';
  const tagClose = options.itemTagClose || '';

  let cleaned = rawItems.map((raw) => {
    let item = options.trimWhitespace ? raw.trim() : raw;

    // Strip item tags
    if (tagOpen && item.startsWith(tagOpen)) {
      item = item.slice(tagOpen.length);
    }
    if (tagClose && item.endsWith(tagClose)) {
      item = item.slice(0, -tagClose.length);
    }

    // Strip quotes
    if (qOpen && qClose) {
      if (item.startsWith(qOpen) && item.endsWith(qClose) && item.length >= qOpen.length + qClose.length) {
        item = item.slice(qOpen.length, -qClose.length);
      }
    } else {
      // Auto-strip quotes if matched
      if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'")) || (item.startsWith('`') && item.endsWith('`'))) {
        item = item.slice(1, -1);
      }
    }

    return options.trimWhitespace ? item.trim() : item;
  });

  if (options.skipEmpty) {
    cleaned = cleaned.filter((item) => item.length > 0);
  }

  if (options.deduplicate) {
    const seen = new Set<string>();
    cleaned = cleaned.filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
  }

  return cleaned.join('\n');
}

/**
 * Calculates statistics for given text
 */
export function calculateStats(text: string, delimiter: string = '\n'): TextStats {
  if (!text || text.length === 0) {
    return {
      lineCount: 0,
      itemCount: 0,
      uniqueCount: 0,
      duplicateCount: 0,
      charCount: 0,
    };
  }

  const lines = text.split(/\r\n|\r|\n/);
  const resolved = resolveDelimiter(delimiter);
  const items = (resolved === '\n' ? lines : text.split(resolved))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const uniqueSet = new Set(items);
  const uniqueCount = uniqueSet.size;
  const duplicateCount = Math.max(0, items.length - uniqueCount);

  return {
    lineCount: lines.length,
    itemCount: items.length,
    uniqueCount,
    duplicateCount,
    charCount: text.length,
  };
}

/**
 * Extracts numbers from text (e.g. IDs, order numbers, zip codes)
 */
export function extractNumbers(input: string): string {
  if (!input) return '';
  const matches = input.match(/\b\d+(?:\.\d+)?\b/g);
  return matches ? matches.join('\n') : '';
}

/**
 * Extracts email addresses from text
 */
export function extractEmails(input: string): string {
  if (!input) return '';
  const matches = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  return matches ? matches.join('\n') : '';
}

/**
 * Extracts HTTP/HTTPS URLs from text
 */
export function extractUrls(input: string): string {
  if (!input) return '';
  const matches = input.match(/https?:\/\/[^\s"'<>]+/g);
  return matches ? matches.join('\n') : '';
}

/**
 * Extracts UUIDs from text
 */
export function extractUuids(input: string): string {
  if (!input) return '';
  const matches = input.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g);
  return matches ? matches.join('\n') : '';
}

/**
 * Cleans Excel/Google Sheets copy-paste artifacts:
 * - Removes enclosing outer quotes for cells containing commas
 * - Unescapes doubled quotes ("" -> ")
 * - Strips tab delimiters
 */
export function cleanExcelPasted(input: string): string {
  if (!input) return '';
  const lines = input.split(/\r?\n/);
  const cleaned = lines.map((line) => {
    let l = line.trim();
    // Strip trailing or leading tabs
    l = l.replace(/^\t+|\t+$/g, '');
    // If enclosed in quotes, strip them
    if (l.startsWith('"') && l.endsWith('"') && l.length >= 2) {
      l = l.slice(1, -1);
    }
    // Unescape doubled quotes
    l = l.replace(/""/g, '"');
    return l;
  });
  return cleaned.join('\n');
}

/**
 * Reverses order of lines
 */
export function reverseLines(input: string): string {
  if (!input) return '';
  return input.split(/\r?\n/).reverse().join('\n');
}

/**
 * Randomly shuffles lines using Fisher-Yates algorithm
 */
export function shuffleLines(input: string): string {
  if (!input) return '';
  const array = input.split(/\r?\n/);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('\n');
}

/**
 * Filters lines by keeping or dropping lines containing a query string or pattern
 */
export function filterLines(
  input: string,
  query: string,
  mode: 'keep' | 'drop' = 'keep',
  isRegex: boolean = false
): string {
  if (!input || !query) return input;
  const lines = input.split(/\r?\n/);

  let matcher: (line: string) => boolean;
  if (isRegex) {
    try {
      const rx = new RegExp(query, 'i');
      matcher = (line) => rx.test(line);
    } catch {
      matcher = (line) => line.toLowerCase().includes(query.toLowerCase());
    }
  } else {
    const qLower = query.toLowerCase();
    matcher = (line) => line.toLowerCase().includes(qLower);
  }

  const filtered = lines.filter((line) => (mode === 'keep' ? matcher(line) : !matcher(line)));
  return filtered.join('\n');
}

export interface DuplicateDetail {
  value: string;
  count: number;
}

/**
 * Returns duplicate items with their frequency counts, ordered by count descending
 */
export function getDuplicateDetails(text: string, delimiter: string = '\n'): DuplicateDetail[] {
  if (!text) return [];
  const resolved = resolveDelimiter(delimiter);
  const items = (resolved === '\n' ? text.split(/\r?\n/) : text.split(resolved))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const freqMap = new Map<string, number>();
  for (const item of items) {
    freqMap.set(item, (freqMap.get(item) || 0) + 1);
  }

  const duplicates: DuplicateDetail[] = [];
  freqMap.forEach((count, value) => {
    if (count > 1) {
      duplicates.push({ value, count });
    }
  });

  return duplicates.sort((a, b) => b.count - a.count);
}

/**
 * Creates a URL-friendly slug from text
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Computes Set Operations between two lists (A and B):
 * - diffA: Items only in List A (A - B)
 * - diffB: Items only in List B (B - A)
 * - intersect: Items in both lists (A ∩ B)
 * - union: Unique items across both lists (A ∪ B)
 * - symDiff: Items in either list, but not both (A Δ B)
 */
export function performSetOperation(
  listA: string,
  listB: string,
  op: SetOpType,
  userOptions: Partial<SetOpOptions> = {}
): SetOpResult {
  const options: Required<SetOpOptions> = {
    caseSensitive: false,
    trimWhitespace: true,
    skipEmpty: true,
    delimiter: '\n',
    quotes: 'none',
    prefix: '',
    suffix: '',
    sort: 'none',
    ...userOptions,
  };

  const cleanList = (raw: string): string[] => {
    if (!raw) return [];
    let items = raw.split(/\r?\n/);
    if (options.trimWhitespace) {
      items = items.map((i) => i.trim());
    }
    if (options.skipEmpty) {
      items = items.filter((i) => i.length > 0);
    }
    return items;
  };

  const itemsA = cleanList(listA);
  const itemsB = cleanList(listB);

  const getKey = (item: string) => (options.caseSensitive ? item : item.toLowerCase());

  // Unique key-to-original map preserving first appearance
  const mapA = new Map<string, string>();
  itemsA.forEach((item) => {
    const key = getKey(item);
    if (!mapA.has(key)) mapA.set(key, item);
  });

  const mapB = new Map<string, string>();
  itemsB.forEach((item) => {
    const key = getKey(item);
    if (!mapB.has(key)) mapB.set(key, item);
  });

  const keysA = new Set(mapA.keys());
  const keysB = new Set(mapB.keys());

  let overlapCount = 0;
  keysA.forEach((k) => {
    if (keysB.has(k)) overlapCount++;
  });

  const resultKeys: string[] = [];
  const resultMap = new Map<string, string>();

  switch (op) {
    case 'diffA':
      keysA.forEach((k) => {
        if (!keysB.has(k)) {
          resultKeys.push(k);
          resultMap.set(k, mapA.get(k)!);
        }
      });
      break;

    case 'diffB':
      keysB.forEach((k) => {
        if (!keysA.has(k)) {
          resultKeys.push(k);
          resultMap.set(k, mapB.get(k)!);
        }
      });
      break;

    case 'intersect':
      keysA.forEach((k) => {
        if (keysB.has(k)) {
          resultKeys.push(k);
          resultMap.set(k, mapA.get(k)!);
        }
      });
      break;

    case 'union':
      keysA.forEach((k) => {
        resultKeys.push(k);
        resultMap.set(k, mapA.get(k)!);
      });
      keysB.forEach((k) => {
        if (!keysA.has(k)) {
          resultKeys.push(k);
          resultMap.set(k, mapB.get(k)!);
        }
      });
      break;

    case 'symDiff':
      keysA.forEach((k) => {
        if (!keysB.has(k)) {
          resultKeys.push(k);
          resultMap.set(k, mapA.get(k)!);
        }
      });
      keysB.forEach((k) => {
        if (!keysA.has(k)) {
          resultKeys.push(k);
          resultMap.set(k, mapB.get(k)!);
        }
      });
      break;
  }

  const finalItems = resultKeys.map((k) => resultMap.get(k)!);

  // Sorting
  if (options.sort === 'asc') {
    finalItems.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (options.sort === 'desc') {
    finalItems.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (options.sort === 'numeric-asc') {
    finalItems.sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.-]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^0-9.-]/g, '')) || 0;
      return numA - numB;
    });
  } else if (options.sort === 'numeric-desc') {
    finalItems.sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.-]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^0-9.-]/g, '')) || 0;
      return numB - numA;
    });
  }

  // Quoting and delimiter wrapping
  const dummyOpts: DelimOptions = { ...DEFAULT_OPTIONS, quotes: options.quotes };
  const { open: qOpen, close: qClose } = resolveQuotes(dummyOpts);
  const formattedItems = finalItems.map((item) => `${qOpen}${item}${qClose}`);

  const resolvedDelim = resolveDelimiter(options.delimiter);
  let result = formattedItems.join(resolvedDelim);
  if (options.prefix) result = `${options.prefix}${result}`;
  if (options.suffix) result = `${result}${options.suffix}`;

  return {
    result,
    items: finalItems,
    countA: itemsA.length,
    countB: itemsB.length,
    resultCount: finalItems.length,
    overlapCount,
    uniqueACount: keysA.size,
    uniqueBCount: keysB.size,
  };
}

/**
 * Custom Template Interpolation Engine:
 * Replaces token placeholders like {item}, {index}, {item_lower}, {item_upper}, {item_slug}, {item_escaped}
 */
export function applyTemplate(
  items: string[],
  template: string,
  delimiter: string = '\n'
): string {
  if (!items || items.length === 0 || !template) return '';

  const processedLines = items.map((rawItem, idx) => {
    const item = rawItem;
    const lower = item.toLowerCase();
    const upper = item.toUpperCase();
    const title = item.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    const slug = slugify(item);
    const sqlEscaped = item.replace(/'/g, "''");
    const jsonEscaped = JSON.stringify(item).slice(1, -1);

    return template
      .replace(/\{item\}/g, item)
      .replace(/\{index\}/g, String(idx))
      .replace(/\{index1\}|\{1-based\}|\{idx1\}/g, String(idx + 1))
      .replace(/\{item_lower\}/g, lower)
      .replace(/\{item_upper\}/g, upper)
      .replace(/\{item_title\}/g, title)
      .replace(/\{item_slug\}/g, slug)
      .replace(/\{item_escaped\}/g, sqlEscaped)
      .replace(/\{item_json\}/g, jsonEscaped);
  });

  return processedLines.join(delimiter);
}

/**
 * RFC 4180 compliant single line CSV/TSV parser handling quoted cells and escaped quotes
 */
export function parseCsvLine(line: string, delimiter: string = ','): string[] {
  if (!line) return [];
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Auto-detects multi-column tabular data (TSV, CSV, Pipe, Semicolon) from text
 */
export function detectTable(raw: string): DetectedTable {
  const notTable: DetectedTable = {
    isTable: false,
    delimiter: '',
    delimiterName: '',
    columnCount: 0,
    headers: [],
    rows: [],
    totalRows: 0,
  };

  if (!raw || raw.trim().length === 0) return notTable;

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 1) return notTable;

  const candidateDelimiters = [
    { delim: '\t', name: 'Tab (Spreadsheet / TSV)' },
    { delim: ',', name: 'Comma (CSV)' },
    { delim: '|', name: 'Pipe (|)' },
    { delim: ';', name: 'Semicolon (;)' },
  ];

  const sampleLines = lines.slice(0, Math.min(lines.length, 25));

  for (const candidate of candidateDelimiters) {
    const counts = sampleLines.map((line) => {
      const parsed = parseCsvLine(line, candidate.delim);
      return parsed.length;
    });

    const colCount = counts[0];
    if (colCount >= 2) {
      const matchingCount = counts.filter((c) => c === colCount).length;
      if (matchingCount / counts.length >= 0.7) {
        const parsedRows = sampleLines.map((line) => parseCsvLine(line, candidate.delim));
        const firstRow = parsedRows[0];
        const isHeaderRow = firstRow.some((cell) => isNaN(Number(cell)) && cell.length > 0);
        const headers = isHeaderRow
          ? firstRow.map((h, i) => (h.trim() ? h.trim() : `Column ${i + 1}`))
          : Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);

        const dataRows = isHeaderRow ? parsedRows.slice(1) : parsedRows;

        return {
          isTable: true,
          delimiter: candidate.delim,
          delimiterName: candidate.name,
          columnCount: colCount,
          headers,
          rows: dataRows.slice(0, 10),
          totalRows: lines.length,
        };
      }
    }
  }

  return notTable;
}

/**
 * Extracts a specific column from multi-column tabular data
 */
export function extractColumnFromTable(
  raw: string,
  columnIndex: number,
  skipHeader: boolean = false,
  forcedDelimiter?: string
): string[] {
  if (!raw || raw.trim().length === 0) return [];

  let delimiter = forcedDelimiter;
  if (!delimiter) {
    const detection = detectTable(raw);
    delimiter = detection.isTable ? detection.delimiter : '\t';
  }

  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const startIdx = skipHeader ? 1 : 0;
  const result: string[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], delimiter);
    if (columnIndex >= 0 && columnIndex < cells.length) {
      result.push(cells[columnIndex]);
    }
  }

  return result;
}

/**
 * SQL Dialect & Limit-Aware Formatter:
 * Supports standard SQL IN, Oracle 1000 chunking (ORA-01795), PostgreSQL ANY(ARRAY[]), BigQuery UNNEST, and VALUES
 */
export function formatSqlDialect(
  items: string[],
  dialect: SqlDialect,
  options: SqlDialectOptions = {}
): string {
  if (!items || items.length === 0) return '';

  const {
    columnName = 'id',
    chunkSize = 1000,
    isNumeric = false,
  } = options;

  const formatItem = (item: string) => {
    if (isNumeric) {
      return item.trim();
    }
    const escaped = item.replace(/'/g, "''");
    return `'${escaped}'`;
  };

  const formattedItems = items.map(formatItem);

  switch (dialect) {
    case 'oracle': {
      if (formattedItems.length <= chunkSize) {
        return `${columnName} IN (${formattedItems.join(', ')})`;
      }
      const chunks: string[] = [];
      for (let i = 0; i < formattedItems.length; i += chunkSize) {
        const slice = formattedItems.slice(i, i + chunkSize);
        chunks.push(`${columnName} IN (${slice.join(', ')})`);
      }
      return `(\n  ${chunks.join('\n  OR ')}\n)`;
    }

    case 'postgres': {
      return `${columnName} = ANY(ARRAY[${formattedItems.join(', ')}])`;
    }

    case 'bigquery': {
      return `${columnName} IN UNNEST([${formattedItems.join(', ')}])`;
    }

    case 'values': {
      const rows = formattedItems.map((item) => `(${item})`);
      return `VALUES\n  ${rows.join(',\n  ')}`;
    }

    case 'standard':
    default: {
      return `${columnName} IN (${formattedItems.join(', ')})`;
    }
  }
}

