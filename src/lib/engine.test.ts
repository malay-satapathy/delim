import { describe, it, expect } from 'vitest';
import {
  columnToDelimited,
  delimitedToColumn,
  calculateStats,
  extractNumbers,
  extractEmails,
  extractUrls,
  cleanExcelPasted,
  reverseLines,
  filterLines,
  getDuplicateDetails,
  slugify,
  performSetOperation,
  applyTemplate,
  parseCsvLine,
  detectTable,
  extractColumnFromTable,
  formatSqlDialect,
  DEFAULT_OPTIONS,
} from './engine';

describe('delim engine - columnToDelimited', () => {
  it('converts newline separated items to comma delimited', () => {
    const input = 'apple\nbanana\ncherry';
    const result = columnToDelimited(input, { delimiter: ',' });
    expect(result).toBe('apple,banana,cherry');
  });

  it('supports comma with space delimiter', () => {
    const input = 'alpha\nbeta\ngamma';
    const result = columnToDelimited(input, { delimiter: ', ' });
    expect(result).toBe('alpha, beta, gamma');
  });

  it('handles quoting (single, double, backtick)', () => {
    const input = 'NYC\nLA\nSFO';
    expect(columnToDelimited(input, { quotes: 'single', delimiter: ', ' })).toBe("'NYC', 'LA', 'SFO'");
    expect(columnToDelimited(input, { quotes: 'double', delimiter: ', ' })).toBe('"NYC", "LA", "SFO"');
    expect(columnToDelimited(input, { quotes: 'backtick', delimiter: ', ' })).toBe('`NYC`, `LA`, `SFO`');
  });

  it('removes duplicates when deduplicate is true', () => {
    const input = '100\n200\n100\n300\n200\n400';
    const result = columnToDelimited(input, { deduplicate: true, delimiter: ',' });
    expect(result).toBe('100,200,300,400');
  });

  it('trims whitespace and ignores blank lines', () => {
    const input = '  item1   \n\n   \n   item2  \n';
    const result = columnToDelimited(input, { trimWhitespace: true, skipEmpty: true, delimiter: ',' });
    expect(result).toBe('item1,item2');
  });

  it('supports item tags (e.g. HTML <li>)', () => {
    const input = 'one\ntwo';
    const result = columnToDelimited(input, {
      itemTagOpen: '<li>',
      itemTagClose: '</li>',
      delimiter: '\n',
    });
    expect(result).toBe('<li>one</li>\n<li>two</li>');
  });

  it('supports interval batching and wrapping', () => {
    const input = 'a\nb\nc\nd\ne';
    const result = columnToDelimited(input, {
      delimiter: ',',
      interval: 2,
      intervalWrapOpen: '(',
      intervalWrapClose: ')',
    });
    expect(result).toBe('(a,b)\n(c,d)\n(e)');
  });

  it('supports global prefix and suffix', () => {
    const input = 'id1\nid2';
    const result = columnToDelimited(input, {
      delimiter: ', ',
      quotes: 'single',
      globalPrefix: 'WHERE id IN (',
      globalSuffix: ')',
    });
    expect(result).toBe("WHERE id IN ('id1', 'id2')");
  });

  it('supports sorting (alphabetic and numeric)', () => {
    const input = '10\n2\n1\n20';
    const numericAsc = columnToDelimited(input, { sort: 'numeric-asc', delimiter: ',' });
    expect(numericAsc).toBe('1,2,10,20');

    const alphaAsc = columnToDelimited(input, { sort: 'asc', delimiter: ',' });
    expect(alphaAsc).toBe('1,2,10,20'); // natural numeric sort

    const alphaDesc = columnToDelimited(input, { sort: 'desc', delimiter: ',' });
    expect(alphaDesc).toBe('20,10,2,1');
  });

  it('supports case transformations', () => {
    const input = 'hello world\ngoodbye world';
    expect(columnToDelimited(input, { caseTransform: 'upper', delimiter: ', ' })).toBe('HELLO WORLD, GOODBYE WORLD');
    expect(columnToDelimited(input, { caseTransform: 'title', delimiter: ', ' })).toBe('Hello World, Goodbye World');
  });

  it('respects tidyUp false (adds newline after delimiter)', () => {
    const input = 'first\nsecond\nthird';
    const result = columnToDelimited(input, { delimiter: ',', tidyUp: false });
    expect(result).toBe('first,\nsecond,\nthird');
  });

  it('returns empty string for empty or whitespace-only input', () => {
    expect(columnToDelimited('', DEFAULT_OPTIONS)).toBe('');
    expect(columnToDelimited('   \n  \n  ', DEFAULT_OPTIONS)).toBe('');
  });
});

describe('delim engine - delimitedToColumn', () => {
  it('reverses comma delimited string back to column lines', () => {
    const input = 'apple, banana, cherry';
    const result = delimitedToColumn(input, { delimiter: ', ' });
    expect(result).toBe('apple\nbanana\ncherry');
  });

  it('strips quotes during reverse conversion', () => {
    const input = "'apple', 'banana', 'cherry'";
    const result = delimitedToColumn(input, { delimiter: ', ', quotes: 'single' });
    expect(result).toBe('apple\nbanana\ncherry');
  });

  it('strips global prefix and suffix during reverse conversion', () => {
    const input = "('apple', 'banana')";
    const result = delimitedToColumn(input, {
      delimiter: ', ',
      quotes: 'single',
      globalPrefix: '(',
      globalSuffix: ')',
    });
    expect(result).toBe('apple\nbanana');
  });

  it('reverses pipe-delimited data', () => {
    const input = 'x|y|z';
    const result = delimitedToColumn(input, { delimiter: '|' });
    expect(result).toBe('x\ny\nz');
  });
});

describe('delim engine - calculateStats', () => {
  it('correctly calculates counts', () => {
    const text = 'foo\nbar\nfoo\nbaz';
    const stats = calculateStats(text, '\n');
    expect(stats.lineCount).toBe(4);
    expect(stats.itemCount).toBe(4);
    expect(stats.uniqueCount).toBe(3);
    expect(stats.duplicateCount).toBe(1);
    expect(stats.charCount).toBe(text.length);
  });
});

describe('delim engine - extractors', () => {
  it('extracts numbers from messy text', () => {
    const text = 'Order #10294 placed on 2026-09-14 with ID 55829 and cost 99.50';
    expect(extractNumbers(text)).toBe('10294\n2026\n09\n14\n55829\n99.50');
  });

  it('extracts emails from text', () => {
    const text = 'Contact alice@example.com or bob.smith@work.org for help';
    expect(extractEmails(text)).toBe('alice@example.com\nbob.smith@work.org');
  });

  it('extracts URLs from text', () => {
    const text = 'Check out https://github.com/malay-satapathy/delim and http://example.com/test';
    expect(extractUrls(text)).toBe('https://github.com/malay-satapathy/delim\nhttp://example.com/test');
  });

  it('cleans excel pasted quotes and tabs', () => {
    const text = '"123, Main St"\t\n"Hello ""World"""\nSimple Line';
    expect(cleanExcelPasted(text)).toBe('123, Main St\nHello "World"\nSimple Line');
  });

  it('reverses lines correctly', () => {
    const text = 'first\nsecond\nthird';
    expect(reverseLines(text)).toBe('third\nsecond\nfirst');
  });

  it('filters lines by query', () => {
    const text = 'user_101\nadmin_202\nuser_303';
    expect(filterLines(text, 'user', 'keep')).toBe('user_101\nuser_303');
    expect(filterLines(text, 'admin', 'drop')).toBe('user_101\nuser_303');
  });

  it('finds duplicate details and frequencies', () => {
    const text = 'apple\nbanana\napple\ncherry\napple\nbanana';
    const dupes = getDuplicateDetails(text, '\n');
    expect(dupes).toEqual([
      { value: 'apple', count: 3 },
      { value: 'banana', count: 2 },
    ]);
  });
});

describe('delim engine - slugify', () => {
  it('converts strings into clean kebab-case slugs', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('  Data & Analytics 101 -- Test  ')).toBe('data-analytics-101-test');
    expect(slugify('Crème Brûlée')).toBe('creme-brulee');
  });
});

describe('delim engine - performSetOperation', () => {
  const listA = 'apple\nbanana\ncherry\ndate';
  const listB = 'banana\ndate\nelderberry\nfig';

  it('calculates diffA (items only in A)', () => {
    const res = performSetOperation(listA, listB, 'diffA');
    expect(res.items).toEqual(['apple', 'cherry']);
    expect(res.result).toBe('apple\ncherry');
    expect(res.countA).toBe(4);
    expect(res.countB).toBe(4);
    expect(res.overlapCount).toBe(2);
  });

  it('calculates diffB (items only in B)', () => {
    const res = performSetOperation(listA, listB, 'diffB');
    expect(res.items).toEqual(['elderberry', 'fig']);
    expect(res.result).toBe('elderberry\nfig');
  });

  it('calculates intersect (items in both A and B)', () => {
    const res = performSetOperation(listA, listB, 'intersect');
    expect(res.items).toEqual(['banana', 'date']);
  });

  it('calculates union (unique items across both A and B)', () => {
    const res = performSetOperation(listA, listB, 'union');
    expect(res.items).toEqual(['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig']);
    expect(res.resultCount).toBe(6);
  });

  it('calculates symDiff (items in either A or B, but not both)', () => {
    const res = performSetOperation(listA, listB, 'symDiff');
    expect(res.items).toEqual(['apple', 'cherry', 'elderberry', 'fig']);
  });

  it('handles case-insensitivity by default and case-sensitivity when enabled', () => {
    const a = 'ALPHA\nBETA';
    const b = 'alpha\ngamma';

    const caseInsensitive = performSetOperation(a, b, 'intersect', { caseSensitive: false });
    expect(caseInsensitive.items).toEqual(['ALPHA']);

    const caseSensitive = performSetOperation(a, b, 'intersect', { caseSensitive: true });
    expect(caseSensitive.items).toEqual([]);
  });

  it('applies custom delimiter and quotes to result', () => {
    const res = performSetOperation(listA, listB, 'intersect', {
      delimiter: ', ',
      quotes: 'single',
    });
    expect(res.result).toBe("'banana', 'date'");
  });
});

describe('delim engine - applyTemplate', () => {
  const items = ['Apple iPhone', 'Samsung Galaxy', "O'Reilly Media"];

  it('interpolates {item}, {index}, and {index1}', () => {
    const tpl = '{index1}. {item} [0-idx: {index}]';
    const res = applyTemplate(items.slice(0, 2), tpl);
    expect(res).toBe('1. Apple iPhone [0-idx: 0]\n2. Samsung Galaxy [0-idx: 1]');
  });

  it('interpolates case and slug variants', () => {
    const tpl = '{item_slug} -> {item_upper} -> {item_lower}';
    const res = applyTemplate(['Web Dev 101'], tpl);
    expect(res).toBe('web-dev-101 -> WEB DEV 101 -> web dev 101');
  });

  it('escapes single quotes for SQL in {item_escaped}', () => {
    const tpl = "INSERT INTO brands VALUES ('{item_escaped}');";
    const res = applyTemplate(["O'Reilly Media"], tpl);
    expect(res).toBe("INSERT INTO brands VALUES ('O''Reilly Media');");
  });

  it('escapes strings for JSON in {item_json}', () => {
    const tpl = '{"name": "{item_json}"}';
    const res = applyTemplate(['Hello "World"'], tpl);
    expect(res).toBe('{"name": "Hello \\"World\\""}');
  });
});

describe('delim engine - parseCsvLine & table detection', () => {
  it('parses standard comma-separated and quoted fields with commas inside', () => {
    const line = '101, "Miller, John", "Software Engineer, VP", 120000';
    const cells = parseCsvLine(line, ',');
    expect(cells).toEqual(['101', 'Miller, John', 'Software Engineer, VP', '120000']);
  });

  it('parses escaped quotes ""', () => {
    const line = '1, "He said ""Welcome"""';
    const cells = parseCsvLine(line, ',');
    expect(cells).toEqual(['1', 'He said "Welcome"']);
  });

  it('detects tab-separated spreadsheet data', () => {
    const tsvData = `ID\tName\tRole\n1\tAlice\tEngineer\n2\tBob\tDesigner\n3\tCharlie\tPM`;
    const detection = detectTable(tsvData);
    expect(detection.isTable).toBe(true);
    expect(detection.delimiter).toBe('\t');
    expect(detection.columnCount).toBe(3);
    expect(detection.headers).toEqual(['ID', 'Name', 'Role']);
  });

  it('extracts specific column with or without header', () => {
    const tsvData = `ID\tName\tRole\n1\tAlice\tEngineer\n2\tBob\tDesigner\n3\tCharlie\tPM`;
    const namesWithoutHeader = extractColumnFromTable(tsvData, 1, true);
    expect(namesWithoutHeader).toEqual(['Alice', 'Bob', 'Charlie']);

    const rolesWithHeader = extractColumnFromTable(tsvData, 2, false);
    expect(rolesWithHeader).toEqual(['Role', 'Engineer', 'Designer', 'PM']);
  });

  it('returns isTable false for single column text', () => {
    const singleCol = 'apple\nbanana\ncherry\ndate';
    expect(detectTable(singleCol).isTable).toBe(false);
  });
});

describe('delim engine - formatSqlDialect', () => {
  const items = ['apple', 'banana', 'cherry'];

  it('formats standard SQL IN clause', () => {
    const sql = formatSqlDialect(items, 'standard', { columnName: 'fruit_name' });
    expect(sql).toBe("fruit_name IN ('apple', 'banana', 'cherry')");
  });

  it('formats standard SQL numeric unquoted', () => {
    const sql = formatSqlDialect(['10', '20', '30'], 'standard', { columnName: 'id', isNumeric: true });
    expect(sql).toBe('id IN (10, 20, 30)');
  });

  it('formats PostgreSQL ANY(ARRAY[...])', () => {
    const sql = formatSqlDialect(items, 'postgres', { columnName: 'tag' });
    expect(sql).toBe("tag = ANY(ARRAY['apple', 'banana', 'cherry'])");
  });

  it('formats BigQuery IN UNNEST([...])', () => {
    const sql = formatSqlDialect(items, 'bigquery', { columnName: 'tag' });
    expect(sql).toBe("tag IN UNNEST(['apple', 'banana', 'cherry'])");
  });

  it('formats SQL VALUES clause', () => {
    const sql = formatSqlDialect(items, 'values');
    expect(sql).toBe("VALUES\n  ('apple'),\n  ('banana'),\n  ('cherry')");
  });

  it('splits large Oracle IN lists into 1000-item chunks (ORA-01795)', () => {
    // Generate 1500 items
    const manyItems = Array.from({ length: 1500 }, (_, i) => `item_${i + 1}`);
    const sql = formatSqlDialect(manyItems, 'oracle', { columnName: 'order_id', chunkSize: 1000 });
    expect(sql).toContain('(\n  order_id IN (');
    expect(sql).toContain('OR order_id IN (');
    // First chunk has item_1000, second has item_1001
    expect(sql).toContain("'item_1000')\n  OR order_id IN ('item_1001'");
  });
});
