import { DelimOptions } from '../types';
import { PRESETS } from './presets';
import { columnToDelimited, cleanExcelPasted, calculateStats } from './engine';

export interface IntentCard {
  id: string;
  title: string;
  badge: string;
  description: string;
  formattedResult: string;
  hotkey: string; // e.g. "⌘1", "⌘2", "⌘3"
}

export interface NaturalLanguageResult {
  options: Partial<DelimOptions>;
  description: string;
  extractType?: 'numbers' | 'emails' | 'urls' | 'uuids' | 'excel';
  reverseLines?: boolean;
  shuffleLines?: boolean;
}

/**
 * Heuristic Intent Classifier ("It Just Knows")
 * Profiles input data in <1ms and generates the Top 3 most probable formatted outputs.
 */
export function classifyDataIntent(input: string): IntentCard[] {
  if (!input || input.trim().length === 0) {
    return [];
  }

  const lines = input
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const sample = lines.slice(0, 100);
  const total = sample.length;

  // Profile characteristics
  let numCount = 0;
  let emailCount = 0;
  let urlCount = 0;
  let uuidCount = 0;
  let hasExcelTabsOrQuotes = false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const urlRegex = /^https?:\/\//i;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const numberRegex = /^-?\d+(?:\.\d+)?$/;

  for (const line of sample) {
    if (numberRegex.test(line)) numCount++;
    if (emailRegex.test(line)) emailCount++;
    if (urlRegex.test(line)) urlCount++;
    if (uuidRegex.test(line)) uuidCount++;
    if (line.includes('\t') || line.startsWith('"') || line.includes('""')) {
      hasExcelTabsOrQuotes = true;
    }
  }

  const numRatio = numCount / total;
  const emailRatio = emailCount / total;
  const urlRatio = urlCount / total;
  const isNumeric = numRatio >= 0.7;
  const isEmail = emailRatio >= 0.5;
  const isUrl = urlRatio >= 0.5;

  const stats = calculateStats(input, '\n');
  const hasDuplicates = stats.duplicateCount > 0;

  const cards: IntentCard[] = [];

  // Helper to format with preset
  const formatWithPreset = (presetId: string, customOverrides?: Partial<DelimOptions>): string => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return columnToDelimited(input);
    return columnToDelimited(input, { ...preset.options, ...customOverrides });
  };

  // Case 1: Numeric IDs / Zip Codes / Quantities
  if (isNumeric) {
    // Determine if numbers might benefit from zero-padding (e.g. zip codes with varying lengths)
    const lengths = sample.map((l) => l.length);
    const maxLen = Math.max(...lengths);
    const minLen = Math.min(...lengths);
    const shouldSuggestPad = maxLen > minLen && maxLen <= 10;

    cards.push({
      id: 'sql-numbers',
      title: 'SQL IN (Numbers)',
      badge: 'SQL',
      description: 'Unquoted numeric ID list: WHERE id IN (1, 2, 3)',
      formattedResult: formatWithPreset('sql-numbers', { deduplicate: hasDuplicates }),
      hotkey: '⌘1',
    });

    cards.push({
      id: 'json-numbers',
      title: 'JSON Array',
      badge: 'JSON',
      description: 'JSON numeric array format: [1, 2, 3]',
      formattedResult: columnToDelimited(input, {
        delimiter: ', ',
        quotes: 'none',
        globalPrefix: '[\n  ',
        globalSuffix: '\n]',
        deduplicate: hasDuplicates,
      }),
      hotkey: '⌘2',
    });

    if (shouldSuggestPad) {
      cards.push({
        id: 'zfill-csv',
        title: `Pad 0s (${maxLen} Digits)`,
        badge: 'PANDAS',
        description: `Zero-padded strings: '00042', '01234'`,
        formattedResult: columnToDelimited(input, {
          delimiter: ', ',
          quotes: 'single',
          zeroPadWidth: maxLen,
          deduplicate: hasDuplicates,
        }),
        hotkey: '⌘3',
      });
    } else {
      cards.push({
        id: 'python-list-num',
        title: 'Python List',
        badge: 'PYTHON',
        description: 'Native Python list syntax: [1, 2, 3]',
        formattedResult: columnToDelimited(input, {
          delimiter: ', ',
          quotes: 'none',
          globalPrefix: '[',
          globalSuffix: ']',
          deduplicate: hasDuplicates,
        }),
        hotkey: '⌘3',
      });
    }

    return cards.slice(0, 3);
  }

  // Case 2: Email Addresses
  if (isEmail) {
    cards.push({
      id: 'email-bcc',
      title: 'Email Client (Bcc/To)',
      badge: 'EMAIL',
      description: 'Semicolon delimited for Outlook / Gmail recipients',
      formattedResult: columnToDelimited(input, {
        delimiter: '; ',
        quotes: 'none',
        deduplicate: true,
      }),
      hotkey: '⌘1',
    });

    cards.push({
      id: 'sql-in-emails',
      title: 'SQL IN (Emails)',
      badge: 'SQL',
      description: "WHERE email IN ('user@example.com')",
      formattedResult: formatWithPreset('sql-in', { deduplicate: true }),
      hotkey: '⌘2',
    });

    cards.push({
      id: 'python-list-emails',
      title: 'Python List',
      badge: 'PYTHON',
      description: "['alice@work.org', 'bob@work.org']",
      formattedResult: formatWithPreset('python-list', { deduplicate: true }),
      hotkey: '⌘3',
    });

    return cards.slice(0, 3);
  }

  // Case 2.5: URLs / Hyperlinks
  if (isUrl) {
    cards.push({
      id: 'urls-csv',
      title: 'Comma URLs',
      badge: 'URLS',
      description: 'Clean comma-separated URL links',
      formattedResult: columnToDelimited(input, { delimiter: ', ', deduplicate: true }),
      hotkey: '⌘1',
    });

    cards.push({
      id: 'urls-markdown',
      title: 'Markdown List',
      badge: 'MARKDOWN',
      description: '- <url> markdown list items',
      formattedResult: columnToDelimited(input, {
        delimiter: '\n',
        itemTagOpen: '- <',
        itemTagClose: '>',
        deduplicate: true,
      }),
      hotkey: '⌘2',
    });

    cards.push({
      id: 'urls-json',
      title: 'JSON Array',
      badge: 'JSON',
      description: '["https://...", "https://..."]',
      formattedResult: formatWithPreset('json-array', { deduplicate: true }),
      hotkey: '⌘3',
    });

    return cards.slice(0, 3);
  }

  // Case 3: Messy Excel Pasted Data with Quotes / Tabs
  if (hasExcelTabsOrQuotes) {
    const cleaned = cleanExcelPasted(input);
    cards.push({
      id: 'clean-csv',
      title: 'Cleaned CSV',
      badge: 'EXCEL FIX',
      description: 'Stripped spreadsheet tabs, quotes & artifact characters',
      formattedResult: columnToDelimited(cleaned, { delimiter: ', ', deduplicate: hasDuplicates }),
      hotkey: '⌘1',
    });

    cards.push({
      id: 'clean-sql',
      title: 'Cleaned SQL IN',
      badge: 'SQL',
      description: "Cleaned and quoted: ('item 1', 'item 2')",
      formattedResult: columnToDelimited(cleaned, {
        delimiter: ', ',
        quotes: 'single',
        globalPrefix: '(',
        globalSuffix: ')',
        deduplicate: hasDuplicates,
      }),
      hotkey: '⌘2',
    });

    cards.push({
      id: 'clean-json',
      title: 'Cleaned JSON Array',
      badge: 'JSON',
      description: 'Valid JSON array with escaped quotes',
      formattedResult: columnToDelimited(cleaned, {
        delimiter: ', ',
        quotes: 'double',
        globalPrefix: '[\n  ',
        globalSuffix: '\n]',
        deduplicate: hasDuplicates,
      }),
      hotkey: '⌘3',
    });

    return cards.slice(0, 3);
  }

  // Case 4: General Alphanumeric Strings / SKUs / Names
  cards.push({
    id: 'sql-in-strings',
    title: 'SQL IN (Strings)',
    badge: 'SQL',
    description: "WHERE col IN ('a', 'b', 'c')",
    formattedResult: formatWithPreset('sql-in', { deduplicate: hasDuplicates }),
    hotkey: '⌘1',
  });

  cards.push({
    id: 'json-array',
    title: 'JSON Array',
    badge: 'JSON',
    description: '["item1", "item2", "item3"]',
    formattedResult: formatWithPreset('json-array', { deduplicate: hasDuplicates }),
    hotkey: '⌘2',
  });

  if (hasDuplicates) {
    cards.push({
      id: 'freq-desc',
      title: 'Frequency Ranked',
      badge: 'PANDAS',
      description: 'Sorted by occurrence count (most frequent first)',
      formattedResult: columnToDelimited(input, {
        delimiter: ', ',
        sort: 'freq-desc',
      }),
      hotkey: '⌘3',
    });
  } else {
    cards.push({
      id: 'csv-plain',
      title: 'Plain CSV',
      badge: 'CSV',
      description: 'Clean comma-separated values: a, b, c',
      formattedResult: formatWithPreset('csv-plain'),
      hotkey: '⌘3',
    });
  }

  return cards.slice(0, 3);
}

/**
 * Pure On-Device Natural Language Intent Parser ("The Magic Wand")
 * Translates human thoughts into exact delim options and triggers.
 * Runs 100% locally with zero external network or AI API latency.
 */
export function parseNaturalLanguageIntent(
  prompt: string,
  _currentOptions?: DelimOptions
): NaturalLanguageResult {
  const p = prompt.toLowerCase().trim();
  const options: Partial<DelimOptions> = {};
  const descriptions: string[] = [];
  let extractType: NaturalLanguageResult['extractType'];
  let reverseLines = false;
  let shuffleLines = false;

  // 1. Target Format / Presets
  if (p.includes('postgres') || p.includes('any(array')) {
    options.delimiter = ', ';
    options.quotes = 'single';
    options.globalPrefix = 'ANY(ARRAY[';
    options.globalSuffix = '])';
    descriptions.push('PostgreSQL ANY(ARRAY[...])');
  } else if (p.includes('bigquery') || p.includes('unnest')) {
    options.delimiter = ', ';
    options.quotes = 'single';
    options.globalPrefix = 'IN UNNEST([';
    options.globalSuffix = '])';
    descriptions.push('BigQuery IN UNNEST([...])');
  } else if (p.includes('python list') || p.includes('py list')) {
    options.delimiter = ', ';
    options.quotes = p.includes('number') || p.includes('num') ? 'none' : 'single';
    options.globalPrefix = '[';
    options.globalSuffix = ']';
    descriptions.push('Python List [...]');
  } else if (p.includes('python set') || p.includes('py set')) {
    options.delimiter = ', ';
    options.quotes = p.includes('number') || p.includes('num') ? 'none' : 'single';
    options.globalPrefix = '{';
    options.globalSuffix = '}';
    descriptions.push('Python Set {...}');
  } else if (p.includes('python tuple') || p.includes('py tuple')) {
    options.delimiter = ', ';
    options.quotes = p.includes('number') || p.includes('num') ? 'none' : 'single';
    options.globalPrefix = '(';
    options.globalSuffix = ')';
    descriptions.push('Python Tuple (...)');
  } else if (p.includes('json') || p.includes('json array')) {
    options.delimiter = ', ';
    options.quotes = 'double';
    options.globalPrefix = '[\n  ';
    options.globalSuffix = '\n]';
    descriptions.push('JSON Array');
  } else if (p.includes('html') || p.includes('<li>')) {
    options.delimiter = '\n';
    options.itemTagOpen = '<li>';
    options.itemTagClose = '</li>';
    options.globalPrefix = '<ul>\n';
    options.globalSuffix = '\n</ul>';
    descriptions.push('HTML <li> List');
  } else if (p.includes('sql') || p.includes('in clause')) {
    options.delimiter = ', ';
    options.quotes = p.includes('number') || p.includes('num') ? 'none' : 'single';
    options.globalPrefix = '(';
    options.globalSuffix = ')';
    descriptions.push(options.quotes === 'none' ? 'SQL IN (Numbers)' : 'SQL IN (Strings)');
  } else if (p.includes('tsv') || p.includes('tab')) {
    options.delimiter = '\t';
    descriptions.push('Tab-separated (TSV)');
  } else if (p.includes('pipe')) {
    options.delimiter = '|';
    descriptions.push('Pipe-separated (|)');
  } else if (p.includes('semicolon')) {
    options.delimiter = '; ';
    descriptions.push('Semicolon-separated (; )');
  } else if (p.includes('csv') || p.includes('comma')) {
    options.delimiter = p.includes('space') ? ', ' : ',';
    descriptions.push('Comma-separated (CSV)');
  }

  // 2. Quotes
  if (p.includes('single quote') || p.includes('single-quote')) {
    options.quotes = 'single';
    descriptions.push("single quotes (')");
  } else if (p.includes('double quote') || p.includes('double-quote')) {
    options.quotes = 'double';
    descriptions.push('double quotes (")');
  } else if (p.includes('backtick')) {
    options.quotes = 'backtick';
    descriptions.push('backticks (`)');
  } else if (p.includes('no quote') || p.includes('unquoted')) {
    options.quotes = 'none';
    descriptions.push('unquoted');
  }

  // 3. Deduplication & pandas drop_duplicates
  if (p.includes('dedupe') || p.includes('deduplicate') || p.includes('unique') || p.includes('remove duplicate')) {
    options.deduplicate = true;
    if (p.includes('keep last') || p.includes('last occurrence')) {
      options.deduplicateStrategy = 'last';
      descriptions.push('deduplicate (keep last)');
    } else if (p.includes('singleton') || p.includes('drop all repeat') || p.includes('only once')) {
      options.deduplicateStrategy = 'none';
      descriptions.push('strictly singletons');
    } else {
      options.deduplicateStrategy = 'first';
      descriptions.push('deduplicate (keep first)');
    }
  }

  // 4. Zero-Padding (pandas zfill)
  const padMatch = p.match(/(?:pad|zfill|zero pad|leading zero).*?(\d+)/i) || p.match(/(\d+)\s*(?:digit|char|zeros?)/i);
  if (padMatch && padMatch[1]) {
    const width = parseInt(padMatch[1], 10);
    if (width > 0 && width <= 20) {
      options.zeroPadWidth = width;
      descriptions.push(`pad 0s to ${width} digits (pandas zfill)`);
    }
  }

  // 5. Case Transformation
  if (p.includes('uppercase') || p.includes('upper') || p.includes('all caps')) {
    options.caseTransform = 'upper';
    descriptions.push('UPPERCASE');
  } else if (p.includes('lowercase') || p.includes('lower')) {
    options.caseTransform = 'lower';
    descriptions.push('lowercase');
  } else if (p.includes('title case') || p.includes('capitalize')) {
    options.caseTransform = 'title';
    descriptions.push('Title Case');
  }

  // 6. Sorting & Ordering
  if (p.includes('frequency') || p.includes('value_count') || p.includes('most common') || p.includes('most frequent')) {
    options.sort = 'freq-desc';
    descriptions.push('frequency sort (high → low)');
  } else if (p.includes('sort asc') || p.includes('alphabetical') || p.includes('a to z') || p.includes('a-z')) {
    options.sort = 'asc';
    descriptions.push('sort ascending');
  } else if (p.includes('sort desc') || p.includes('z to a') || p.includes('z-a')) {
    options.sort = 'desc';
    descriptions.push('sort descending');
  } else if (p.includes('sort num') || p.includes('numeric sort')) {
    options.sort = 'numeric-asc';
    descriptions.push('sort numeric ascending');
  } else if (p.includes('reverse') || p.includes('upside down')) {
    reverseLines = true;
    descriptions.push('reverse line order');
  } else if (p.includes('shuffle') || p.includes('random')) {
    shuffleLines = true;
    descriptions.push('random shuffle');
  }

  // 7. Extractors
  if (p.includes('extract email') || p.includes('only email')) {
    extractType = 'emails';
    descriptions.push('extract emails');
  } else if (p.includes('extract number') || p.includes('extract id') || p.includes('only number')) {
    extractType = 'numbers';
    descriptions.push('extract numbers');
  } else if (p.includes('extract url') || p.includes('extract link')) {
    extractType = 'urls';
    descriptions.push('extract URLs');
  } else if (p.includes('extract uuid')) {
    extractType = 'uuids';
    descriptions.push('extract UUIDs');
  } else if (p.includes('clean excel') || p.includes('clean quote')) {
    extractType = 'excel';
    descriptions.push('clean Excel quotes & tabs');
  }

  // 8. Whitespace
  if (p.includes('trim')) {
    options.trimWhitespace = true;
    descriptions.push('trim whitespace');
  }
  if (p.includes('skip blank') || p.includes('no empty line')) {
    options.skipEmpty = true;
    descriptions.push('skip blank lines');
  }

  const actionDescription =
    descriptions.length > 0 ? descriptions.join(', ') : 'Custom transform applied';

  return {
    options,
    description: actionDescription,
    extractType,
    reverseLines,
    shuffleLines,
  };
}
