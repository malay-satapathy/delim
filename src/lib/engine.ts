import { DelimOptions, TextStats } from '../types';

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
