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
  options?: Partial<DelimOptions>;
}

export interface NaturalLanguageResult {
  options: Partial<DelimOptions>;
  description: string;
  extractType?: 'numbers' | 'emails' | 'urls' | 'uuids' | 'excel';
  reverseLines?: boolean;
  shuffleLines?: boolean;
  transformedText?: string;
  matched: boolean;
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

  const getPresetOptions = (presetId: string, customOverrides?: Partial<DelimOptions>): Partial<DelimOptions> => {
    const preset = PRESETS.find((p) => p.id === presetId);
    return { ...(preset ? preset.options : {}), ...customOverrides };
  };

  // Case 1: Numeric IDs / Zip Codes / Quantities
  if (isNumeric) {
    const lengths = sample.map((l) => l.length);
    const maxLen = Math.max(...lengths);
    const minLen = Math.min(...lengths);
    const shouldSuggestPad = maxLen > minLen && maxLen <= 10;

    const sqlNumOpts = getPresetOptions('sql-numbers', { deduplicate: hasDuplicates });
    cards.push({
      id: 'sql-numbers',
      title: 'SQL IN (Numbers)',
      badge: 'SQL',
      description: 'Unquoted numeric ID list: WHERE id IN (1, 2, 3)',
      formattedResult: formatWithPreset('sql-numbers', { deduplicate: hasDuplicates }),
      hotkey: '⌘1',
      options: sqlNumOpts,
    });

    const jsonNumOpts: Partial<DelimOptions> = {
      delimiter: ', ',
      quotes: 'none',
      globalPrefix: '[\n  ',
      globalSuffix: '\n]',
      deduplicate: hasDuplicates,
    };
    cards.push({
      id: 'json-numbers',
      title: 'JSON Array',
      badge: 'JSON',
      description: 'JSON numeric array format: [1, 2, 3]',
      formattedResult: columnToDelimited(input, jsonNumOpts),
      hotkey: '⌘2',
      options: jsonNumOpts,
    });

    if (shouldSuggestPad) {
      const padOpts: Partial<DelimOptions> = {
        delimiter: ', ',
        quotes: 'single',
        zeroPadWidth: maxLen,
        deduplicate: hasDuplicates,
      };
      cards.push({
        id: 'zfill-csv',
        title: `Pad 0s (${maxLen} Digits)`,
        badge: 'PANDAS',
        description: `Zero-padded strings: '00042', '01234'`,
        formattedResult: columnToDelimited(input, padOpts),
        hotkey: '⌘3',
        options: padOpts,
      });
    } else {
      const pyNumOpts: Partial<DelimOptions> = {
        delimiter: ', ',
        quotes: 'none',
        globalPrefix: '[',
        globalSuffix: ']',
        deduplicate: hasDuplicates,
      };
      cards.push({
        id: 'python-list-num',
        title: 'Python List',
        badge: 'PYTHON',
        description: 'Native Python list syntax: [1, 2, 3]',
        formattedResult: columnToDelimited(input, pyNumOpts),
        hotkey: '⌘3',
        options: pyNumOpts,
      });
    }

    return cards.slice(0, 3);
  }

  // Case 2: Email Addresses
  if (isEmail) {
    const emailOpts: Partial<DelimOptions> = {
      delimiter: '; ',
      quotes: 'none',
      deduplicate: true,
    };
    cards.push({
      id: 'email-bcc',
      title: 'Email Client (Bcc/To)',
      badge: 'EMAIL',
      description: 'Semicolon delimited for Outlook / Gmail recipients',
      formattedResult: columnToDelimited(input, emailOpts),
      hotkey: '⌘1',
      options: emailOpts,
    });

    const sqlEmailOpts = getPresetOptions('sql-in', { deduplicate: true });
    cards.push({
      id: 'sql-in-emails',
      title: 'SQL IN (Emails)',
      badge: 'SQL',
      description: "WHERE email IN ('user@example.com')",
      formattedResult: formatWithPreset('sql-in', { deduplicate: true }),
      hotkey: '⌘2',
      options: sqlEmailOpts,
    });

    const pyEmailOpts = getPresetOptions('python-list', { deduplicate: true });
    cards.push({
      id: 'python-list-emails',
      title: 'Python List',
      badge: 'PYTHON',
      description: "['alice@work.org', 'bob@work.org']",
      formattedResult: formatWithPreset('python-list', { deduplicate: true }),
      hotkey: '⌘3',
      options: pyEmailOpts,
    });

    return cards.slice(0, 3);
  }

  // Case 2.5: URLs / Hyperlinks
  if (isUrl) {
    const urlCsvOpts: Partial<DelimOptions> = { delimiter: ', ', deduplicate: true };
    cards.push({
      id: 'urls-csv',
      title: 'Comma URLs',
      badge: 'URLS',
      description: 'Clean comma-separated URL links',
      formattedResult: columnToDelimited(input, urlCsvOpts),
      hotkey: '⌘1',
      options: urlCsvOpts,
    });

    const mdOpts: Partial<DelimOptions> = {
      delimiter: '\n',
      itemTagOpen: '- <',
      itemTagClose: '>',
      deduplicate: true,
    };
    cards.push({
      id: 'urls-markdown',
      title: 'Markdown List',
      badge: 'MARKDOWN',
      description: '- <url> markdown list items',
      formattedResult: columnToDelimited(input, mdOpts),
      hotkey: '⌘2',
      options: mdOpts,
    });

    const jsonUrlOpts = getPresetOptions('json-array', { deduplicate: true });
    cards.push({
      id: 'urls-json',
      title: 'JSON Array',
      badge: 'JSON',
      description: '["https://...", "https://..."]',
      formattedResult: formatWithPreset('json-array', { deduplicate: true }),
      hotkey: '⌘3',
      options: jsonUrlOpts,
    });

    return cards.slice(0, 3);
  }

  // Case 3: Messy Excel Pasted Data with Quotes / Tabs
  if (hasExcelTabsOrQuotes) {
    const cleaned = cleanExcelPasted(input);
    const cleanCsvOpts: Partial<DelimOptions> = { delimiter: ', ', deduplicate: hasDuplicates };
    cards.push({
      id: 'clean-csv',
      title: 'Cleaned CSV',
      badge: 'EXCEL FIX',
      description: 'Stripped spreadsheet tabs, quotes & artifact characters',
      formattedResult: columnToDelimited(cleaned, cleanCsvOpts),
      hotkey: '⌘1',
      options: cleanCsvOpts,
    });

    const cleanSqlOpts: Partial<DelimOptions> = {
      delimiter: ', ',
      quotes: 'single',
      globalPrefix: '(',
      globalSuffix: ')',
      deduplicate: hasDuplicates,
    };
    cards.push({
      id: 'clean-sql',
      title: 'Cleaned SQL IN',
      badge: 'SQL',
      description: "Cleaned and quoted: ('item 1', 'item 2')",
      formattedResult: columnToDelimited(cleaned, cleanSqlOpts),
      hotkey: '⌘2',
      options: cleanSqlOpts,
    });

    const cleanJsonOpts: Partial<DelimOptions> = {
      delimiter: ', ',
      quotes: 'double',
      globalPrefix: '[\n  ',
      globalSuffix: '\n]',
      deduplicate: hasDuplicates,
    };
    cards.push({
      id: 'clean-json',
      title: 'Cleaned JSON Array',
      badge: 'JSON',
      description: 'Valid JSON array with escaped quotes',
      formattedResult: columnToDelimited(cleaned, cleanJsonOpts),
      hotkey: '⌘3',
      options: cleanJsonOpts,
    });

    return cards.slice(0, 3);
  }

  // Case 4: General Alphanumeric Strings / SKUs / Names
  const sqlStringOpts = getPresetOptions('sql-in', { deduplicate: hasDuplicates });
  cards.push({
    id: 'sql-in-strings',
    title: 'SQL IN (Strings)',
    badge: 'SQL',
    description: "WHERE col IN ('a', 'b', 'c')",
    formattedResult: formatWithPreset('sql-in', { deduplicate: hasDuplicates }),
    hotkey: '⌘1',
    options: sqlStringOpts,
  });

  const jsonOpts = getPresetOptions('json-array', { deduplicate: hasDuplicates });
  cards.push({
    id: 'json-array',
    title: 'JSON Array',
    badge: 'JSON',
    description: '["item1", "item2", "item3"]',
    formattedResult: formatWithPreset('json-array', { deduplicate: hasDuplicates }),
    hotkey: '⌘2',
    options: jsonOpts,
  });

  if (hasDuplicates) {
    const freqOpts: Partial<DelimOptions> = {
      delimiter: ', ',
      sort: 'freq-desc',
    };
    cards.push({
      id: 'freq-desc',
      title: 'Frequency Ranked',
      badge: 'PANDAS',
      description: 'Sorted by occurrence count (most frequent first)',
      formattedResult: columnToDelimited(input, freqOpts),
      hotkey: '⌘3',
      options: freqOpts,
    });
  } else {
    const csvOpts = getPresetOptions('csv-plain');
    cards.push({
      id: 'csv-plain',
      title: 'Plain CSV',
      badge: 'CSV',
      description: 'Clean comma-separated values: a, b, c',
      formattedResult: formatWithPreset('csv-plain'),
      hotkey: '⌘3',
      options: csvOpts,
    });
  }

  return cards.slice(0, 3);
}

/**
 * Pure On-Device Natural Language Intent Parser ("The Magic Wand")
 * Translates human thoughts into exact delim options and text mutations.
 * Runs 100% locally with zero external network or AI API latency.
 */
export function parseNaturalLanguageIntent(
  prompt: string,
  _currentOptions?: Partial<DelimOptions>,
  inputText?: string
): NaturalLanguageResult {
  const p = prompt.trim();
  const lowerPrompt = p.toLowerCase();
  const options: Partial<DelimOptions> = {};
  const descriptions: string[] = [];
  let extractType: NaturalLanguageResult['extractType'];
  let reverseLines = false;
  let shuffleLines = false;
  let matched = false;

  let currentText = inputText !== undefined ? inputText : '';

  // Reserved keywords that should not be treated as literal remove targets
  const reservedWords = new Set([
    'duplicate',
    'duplicates',
    'dupe',
    'dupes',
    'blank',
    'blanks',
    'empty',
    'empty line',
    'empty lines',
    'blank line',
    'blank lines',
    'space',
    'spaces',
    'whitespace',
    'quote',
    'quotes',
    'single quote',
    'single quotes',
    'double quote',
    'double quotes',
    'vowel',
    'vowels',
    'digit',
    'digits',
    'number',
    'numbers',
    'letter',
    'letters',
    'alphabet',
    'alphabets',
    'punctuation',
    'symbol',
    'symbols',
    'special character',
    'special characters',
    'dash',
    'dashes',
    'hyphen',
    'hyphens',
    'comma',
    'commas',
    'dot',
    'dots',
    'period',
    'periods',
    'bracket',
    'brackets',
    'parenthesis',
    'parentheses',
    'line',
    'lines',
    'first',
    'last',
  ]);

  // ==========================================
  // 1. Text Mutations (Removal / Replace / Filter)
  // ==========================================

  // A. Blank lines removal
  if (/\b(?:remove|delete|drop|strip|filter out)\s+(?:all\s+)?(?:empty|blank)\s*(?:lines?)?\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .filter((line) => line.trim().length > 0)
        .join('\n');
    }
    options.skipEmpty = true;
    descriptions.push('Removed blank lines');
    matched = true;
  }

  // B. Space / whitespace removal or trim
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?spaces?\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/ +/g, '');
    }
    descriptions.push('Removed all spaces');
    matched = true;
  } else if (/\b(?:trim|strip)\s+(?:all\s+)?whitespace\b/i.test(lowerPrompt) || lowerPrompt === 'trim') {
    if (inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .map((l) => l.trim())
        .join('\n');
    }
    options.trimWhitespace = true;
    descriptions.push('Trimmed whitespace');
    matched = true;
  }

  // C. Vowels removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?vowels?\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/[aeiouAEIOU]/g, '');
    }
    descriptions.push('Removed all vowels');
    matched = true;
  }

  // D. Numbers / Digits removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?(?:digits?|numbers?)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/\d+/g, '');
    }
    descriptions.push('Removed all numbers');
    matched = true;
  }

  // E. Letters removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?(?:letters?|alphabets?)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/[a-zA-Z]+/g, '');
    }
    descriptions.push('Removed all letters');
    matched = true;
  }

  // F. Punctuation / special characters removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?(?:punctuation|symbols?|special\s+characters?)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/[^\w\s\r\n]/g, '');
    }
    descriptions.push('Removed special characters');
    matched = true;
  }

  // G. Quotes removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?(?:quotes?|single\s+quotes?|double\s+quotes?)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/['"`]/g, '');
    }
    options.quotes = 'none';
    descriptions.push('Removed all quotes');
    matched = true;
  }

  // H. Commas removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?commas?\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/,/g, '');
    }
    descriptions.push('Removed all commas');
    matched = true;
  }

  // I. Dashes removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?(?:dashes?|hyphens?)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/-/g, '');
    }
    descriptions.push('Removed all dashes');
    matched = true;
  }

  // J. Periods / dots removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?(?:dots?|periods?)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/\./g, '');
    }
    descriptions.push('Removed all periods');
    matched = true;
  }

  // K. Brackets removal
  if (/\b(?:remove|delete|strip)\s+(?:all\s+)?(?:brackets?|parentheses?|parens?)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText.replace(/[[\]{}()]/g, '');
    }
    descriptions.push('Removed all brackets');
    matched = true;
  }

  // L. Remove lines containing / with
  const removeLinesMatch = lowerPrompt.match(
    /\b(?:remove|delete|drop|exclude)\s+(?:all\s+)?lines?\s+(?:containing|with)\s+['"]?([^'"]+?)['"]?(?:\s+(?:in|from)\s+text)?(?:\s*$|\s+(?:and|then)\s+)/i
  );
  if (removeLinesMatch && removeLinesMatch[1]) {
    const target = removeLinesMatch[1].trim();
    if (inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .filter((line) => !line.toLowerCase().includes(target.toLowerCase()))
        .join('\n');
    }
    descriptions.push(`Removed lines containing "${target}"`);
    matched = true;
  }

  // M. Keep / filter lines containing / with
  const keepLinesMatch = lowerPrompt.match(
    /\b(?:keep|filter|retain)\s+(?:only\s+)?(?:lines?\s+)?(?:containing|with)\s+['"]?([^'"]+?)['"]?(?:\s+(?:in|from)\s+text)?(?:\s*$|\s+(?:and|then)\s+)/i
  );
  if (keepLinesMatch && keepLinesMatch[1]) {
    const target = keepLinesMatch[1].trim();
    if (inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .filter((line) => line.toLowerCase().includes(target.toLowerCase()))
        .join('\n');
    }
    descriptions.push(`Kept lines containing "${target}"`);
    matched = true;
  }

  // N. Remove first N chars
  const removeFirstMatch = lowerPrompt.match(
    /\b(?:remove|drop|delete|strip)\s+(?:the\s+)?first\s+(\d+)\s*(?:chars?|characters?|letters?)/i
  );
  if (removeFirstMatch && removeFirstMatch[1]) {
    const count = parseInt(removeFirstMatch[1], 10);
    if (count > 0 && inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .map((line) => line.slice(count))
        .join('\n');
    }
    descriptions.push(`Removed first ${count} characters`);
    matched = true;
  }

  // O. Remove last N chars
  const removeLastMatch = lowerPrompt.match(
    /\b(?:remove|drop|delete|strip)\s+(?:the\s+)?last\s+(\d+)\s*(?:chars?|characters?|letters?)/i
  );
  if (removeLastMatch && removeLastMatch[1]) {
    const count = parseInt(removeLastMatch[1], 10);
    if (count > 0 && inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .map((line) => (line.length > count ? line.slice(0, -count) : ''))
        .join('\n');
    }
    descriptions.push(`Removed last ${count} characters`);
    matched = true;
  }

  // P. Arbitrary Substring / Character Removal (e.g. "remove all a in text", "remove all a", "delete 'test'")
  const genericRemoveMatch = lowerPrompt.match(
    /\b(?:remove|delete|strip|drop|erase)\s+(?:all\s+)?(?:the\s+)?(?:letters?\s+|characters?\s+|chars?\s+)?(?:['"]?([^'"]+?)['"]?)(?:\s+(?:in|from)\s+(?:text|data|string|each\s+line))?(?:\s*$|\s+(?:and|then)\s+)/i
  );
  if (genericRemoveMatch && genericRemoveMatch[1]) {
    const rawTarget = genericRemoveMatch[1].trim();
    if (!reservedWords.has(rawTarget.toLowerCase())) {
      const target = rawTarget;
      if (inputText !== undefined) {
        const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        currentText = currentText.replace(new RegExp(escaped, 'gi'), '');
      }
      descriptions.push(`Removed all "${target}" from text`);
      matched = true;
    }
  }

  // Q. Substring Replacement (e.g. "replace all a with b", "replace foo with bar", "replace spaces with underscores")
  const replaceMatch = lowerPrompt.match(
    /\b(?:replace|change|substitute)\s+(?:all\s+)?['"]?([^'"]+?)['"]?\s+(?:with|to|by|into)\s+['"]?([^'"]*?)['"]?(?:\s+(?:in|from)\s+text)?(?:\s*$|\s+(?:and|then)\s+)/i
  );
  if (replaceMatch && replaceMatch[1]) {
    const fromTarget = replaceMatch[1].trim();
    const toTarget = replaceMatch[2] ?? '';
    if (fromTarget.toLowerCase() === 'spaces' || fromTarget.toLowerCase() === 'space') {
      if (inputText !== undefined) {
        currentText = currentText.replace(/ +/g, toTarget);
      }
      descriptions.push(`Replaced spaces with "${toTarget}"`);
      matched = true;
    } else if (fromTarget.toLowerCase() === 'commas' || fromTarget.toLowerCase() === 'comma') {
      if (inputText !== undefined) {
        currentText = currentText.replace(/,/g, toTarget);
      }
      descriptions.push(`Replaced commas with "${toTarget}"`);
      matched = true;
    } else if (fromTarget.toLowerCase() === 'dashes' || fromTarget.toLowerCase() === 'dash') {
      if (inputText !== undefined) {
        currentText = currentText.replace(/-/g, toTarget);
      }
      descriptions.push(`Replaced dashes with "${toTarget}"`);
      matched = true;
    } else {
      if (inputText !== undefined) {
        const escaped = fromTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        currentText = currentText.replace(new RegExp(escaped, 'gi'), toTarget);
      }
      descriptions.push(`Replaced "${fromTarget}" with "${toTarget}"`);
      matched = true;
    }
  }

  // R. Prefix each line
  const prefixMatch = lowerPrompt.match(
    /\b(?:prefix|prepend|add prefix)\s+(?:with\s+|each\s+line\s+with\s+|to\s+each\s+line\s+with\s+)?['"]?([^'"]+?)['"]?(?:\s*$|\s+(?:and|then)\s+)/i
  );
  if (prefixMatch && prefixMatch[1]) {
    const prefix = prefixMatch[1];
    if (inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .map((l) => (l.length > 0 ? `${prefix}${l}` : l))
        .join('\n');
    }
    descriptions.push(`Prefixed each line with "${prefix}"`);
    matched = true;
  }

  // S. Suffix each line
  const suffixMatch = lowerPrompt.match(
    /\b(?:suffix|append|add suffix)\s+(?:with\s+|to\s+each\s+line\s+with\s+|to\s+each\s+line\s+)?['"]?([^'"]+?)['"]?(?:\s*$|\s+(?:and|then)\s+)/i
  );
  if (suffixMatch && suffixMatch[1]) {
    const suffix = suffixMatch[1];
    if (inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .map((l) => (l.length > 0 ? `${l}${suffix}` : l))
        .join('\n');
    }
    descriptions.push(`Suffixed each line with "${suffix}"`);
    matched = true;
  }

  // T. Reverse characters in each line
  if (/\b(?:reverse\s+(?:each\s+)?(?:characters?|text|string|word)|flip\s+characters?)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .map((l) => l.split('').reverse().join(''))
        .join('\n');
    }
    descriptions.push('Reversed characters in each line');
    matched = true;
  }

  // U. Slugify
  if (/\b(?:slugify|make\s+slugs?|kebab\s+case|url\s+slug)\b/i.test(lowerPrompt)) {
    if (inputText !== undefined) {
      currentText = currentText
        .split(/\r\n|\r|\n/)
        .map((l) =>
          l
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
        )
        .join('\n');
    }
    descriptions.push('Converted lines to URL slugs');
    matched = true;
  }

  // ==========================================
  // 2. Delimiter Presets & SQL Dialects
  // ==========================================
  if (lowerPrompt.includes('postgres') || lowerPrompt.includes('any(array')) {
    options.delimiter = ', ';
    options.quotes = 'single';
    options.globalPrefix = 'ANY(ARRAY[';
    options.globalSuffix = '])';
    descriptions.push('PostgreSQL ANY(ARRAY[...])');
    matched = true;
  } else if (lowerPrompt.includes('bigquery') || lowerPrompt.includes('unnest')) {
    options.delimiter = ', ';
    options.quotes = 'single';
    options.globalPrefix = 'IN UNNEST([';
    options.globalSuffix = '])';
    descriptions.push('BigQuery IN UNNEST([...])');
    matched = true;
  } else if (lowerPrompt.includes('python list') || lowerPrompt.includes('py list')) {
    options.delimiter = ', ';
    options.quotes = lowerPrompt.includes('number') || lowerPrompt.includes('num') ? 'none' : 'single';
    options.globalPrefix = '[';
    options.globalSuffix = ']';
    descriptions.push('Python List [...]');
    matched = true;
  } else if (lowerPrompt.includes('python set') || lowerPrompt.includes('py set')) {
    options.delimiter = ', ';
    options.quotes = lowerPrompt.includes('number') || lowerPrompt.includes('num') ? 'none' : 'single';
    options.globalPrefix = '{';
    options.globalSuffix = '}';
    descriptions.push('Python Set {...}');
    matched = true;
  } else if (lowerPrompt.includes('python tuple') || lowerPrompt.includes('py tuple')) {
    options.delimiter = ', ';
    options.quotes = lowerPrompt.includes('number') || lowerPrompt.includes('num') ? 'none' : 'single';
    options.globalPrefix = '(';
    options.globalSuffix = ')';
    descriptions.push('Python Tuple (...)');
    matched = true;
  } else if (lowerPrompt.includes('json') || lowerPrompt.includes('json array')) {
    options.delimiter = ', ';
    options.quotes = 'double';
    options.globalPrefix = '[\n  ';
    options.globalSuffix = '\n]';
    descriptions.push('JSON Array');
    matched = true;
  } else if (lowerPrompt.includes('html') || lowerPrompt.includes('<li>')) {
    options.delimiter = '\n';
    options.itemTagOpen = '<li>';
    options.itemTagClose = '</li>';
    options.globalPrefix = '<ul>\n';
    options.globalSuffix = '\n</ul>';
    descriptions.push('HTML <li> List');
    matched = true;
  } else if (lowerPrompt.includes('sql') || lowerPrompt.includes('in clause')) {
    options.delimiter = ', ';
    options.quotes = lowerPrompt.includes('number') || lowerPrompt.includes('num') ? 'none' : 'single';
    options.globalPrefix = '(';
    options.globalSuffix = ')';
    descriptions.push(options.quotes === 'none' ? 'SQL IN (Numbers)' : 'SQL IN (Strings)');
    matched = true;
  } else if (lowerPrompt.includes('tsv') || lowerPrompt.includes('tab separated')) {
    options.delimiter = '\t';
    descriptions.push('Tab-separated (TSV)');
    matched = true;
  } else if (lowerPrompt.includes('pipe')) {
    options.delimiter = '|';
    descriptions.push('Pipe-separated (|)');
    matched = true;
  } else if (lowerPrompt.includes('semicolon')) {
    options.delimiter = '; ';
    descriptions.push('Semicolon-separated (; )');
    matched = true;
  } else if (lowerPrompt.includes('csv') || lowerPrompt.includes('comma')) {
    options.delimiter = lowerPrompt.includes('space') ? ', ' : ',';
    descriptions.push('Comma-separated (CSV)');
    matched = true;
  }

  // ==========================================
  // 3. Quotes
  // ==========================================
  if (lowerPrompt.includes('single quote') || lowerPrompt.includes('single-quote')) {
    options.quotes = 'single';
    descriptions.push("single quotes (')");
    matched = true;
  } else if (lowerPrompt.includes('double quote') || lowerPrompt.includes('double-quote')) {
    options.quotes = 'double';
    descriptions.push('double quotes (")');
    matched = true;
  } else if (lowerPrompt.includes('backtick')) {
    options.quotes = 'backtick';
    descriptions.push('backticks (`)');
    matched = true;
  } else if (lowerPrompt.includes('no quote') || lowerPrompt.includes('unquoted')) {
    options.quotes = 'none';
    descriptions.push('unquoted');
    matched = true;
  }

  // ==========================================
  // 4. Deduplication & pandas drop_duplicates
  // ==========================================
  if (
    lowerPrompt.includes('dedupe') ||
    lowerPrompt.includes('deduplicate') ||
    lowerPrompt.includes('unique') ||
    lowerPrompt.includes('remove duplicate') ||
    lowerPrompt.includes('remove duplicates')
  ) {
    options.deduplicate = true;
    matched = true;
    if (lowerPrompt.includes('keep last') || lowerPrompt.includes('last occurrence')) {
      options.deduplicateStrategy = 'last';
      descriptions.push('deduplicate (keep last)');
    } else if (lowerPrompt.includes('singleton') || lowerPrompt.includes('drop all repeat') || lowerPrompt.includes('only once')) {
      options.deduplicateStrategy = 'none';
      descriptions.push('strictly singletons');
    } else {
      options.deduplicateStrategy = 'first';
      descriptions.push('deduplicate (keep first)');
    }
  }

  // ==========================================
  // 5. Zero-Padding (pandas zfill)
  // ==========================================
  const padMatch = lowerPrompt.match(/(?:pad|zfill|zero pad|leading zero).*?(\d+)/i) || lowerPrompt.match(/(\d+)\s*(?:digit|char|zeros?)/i);
  if (padMatch && padMatch[1]) {
    const width = parseInt(padMatch[1], 10);
    if (width > 0 && width <= 20) {
      options.zeroPadWidth = width;
      descriptions.push(`pad 0s to ${width} digits`);
      matched = true;
    }
  }

  // ==========================================
  // 6. Case Transformation
  // ==========================================
  if (lowerPrompt.includes('uppercase') || lowerPrompt.includes('upper') || lowerPrompt.includes('all caps')) {
    options.caseTransform = 'upper';
    descriptions.push('UPPERCASE');
    matched = true;
  } else if (lowerPrompt.includes('lowercase') || lowerPrompt.includes('lower')) {
    options.caseTransform = 'lower';
    descriptions.push('lowercase');
    matched = true;
  } else if (lowerPrompt.includes('title case') || lowerPrompt.includes('capitalize')) {
    options.caseTransform = 'title';
    descriptions.push('Title Case');
    matched = true;
  }

  // ==========================================
  // 7. Sorting & Ordering
  // ==========================================
  if (
    lowerPrompt.includes('frequency') ||
    lowerPrompt.includes('value_count') ||
    lowerPrompt.includes('most common') ||
    lowerPrompt.includes('most frequent')
  ) {
    options.sort = 'freq-desc';
    descriptions.push('frequency sort');
    matched = true;
  } else if (lowerPrompt.includes('sort asc') || lowerPrompt.includes('alphabetical') || lowerPrompt.includes('a to z') || lowerPrompt.includes('a-z')) {
    options.sort = 'asc';
    descriptions.push('sort ascending');
    matched = true;
  } else if (lowerPrompt.includes('sort desc') || lowerPrompt.includes('z to a') || lowerPrompt.includes('z-a')) {
    options.sort = 'desc';
    descriptions.push('sort descending');
    matched = true;
  } else if (lowerPrompt.includes('sort num') || lowerPrompt.includes('numeric sort')) {
    options.sort = 'numeric-asc';
    descriptions.push('sort numeric');
    matched = true;
  } else if (lowerPrompt.includes('reverse lines') || lowerPrompt.includes('reverse line order') || lowerPrompt.includes('upside down')) {
    reverseLines = true;
    descriptions.push('reverse line order');
    matched = true;
  } else if (lowerPrompt.includes('shuffle') || lowerPrompt.includes('random')) {
    shuffleLines = true;
    descriptions.push('random shuffle');
    matched = true;
  }

  // ==========================================
  // 8. Extractors
  // ==========================================
  if (lowerPrompt.includes('extract email') || lowerPrompt.includes('only email')) {
    extractType = 'emails';
    descriptions.push('extract emails');
    matched = true;
  } else if (lowerPrompt.includes('extract number') || lowerPrompt.includes('extract id') || lowerPrompt.includes('only number')) {
    extractType = 'numbers';
    descriptions.push('extract numbers');
    matched = true;
  } else if (lowerPrompt.includes('extract url') || lowerPrompt.includes('extract link')) {
    extractType = 'urls';
    descriptions.push('extract URLs');
    matched = true;
  } else if (lowerPrompt.includes('extract uuid')) {
    extractType = 'uuids';
    descriptions.push('extract UUIDs');
    matched = true;
  } else if (lowerPrompt.includes('clean excel') || lowerPrompt.includes('clean quote')) {
    extractType = 'excel';
    descriptions.push('clean Excel quotes & tabs');
    matched = true;
  }

  const actionDescription = matched
    ? descriptions.join(', ')
    : "Could not recognize prompt. Try: 'remove all a', 'replace X with Y', 'sql in', 'pad 5 zeros', 'keep lines with foo'...";

  return {
    options,
    description: actionDescription,
    extractType,
    reverseLines,
    shuffleLines,
    transformedText: inputText !== undefined && currentText !== inputText ? currentText : undefined,
    matched,
  };
}
