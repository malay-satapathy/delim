import { describe, it, expect } from 'vitest';
import { classifyDataIntent, parseNaturalLanguageIntent } from './intent';
import { DEFAULT_OPTIONS } from './engine';

describe('intent engine - classifyDataIntent', () => {
  it('returns empty array for empty input', () => {
    expect(classifyDataIntent('')).toEqual([]);
    expect(classifyDataIntent('   \n  \n  ')).toEqual([]);
  });

  it('classifies numeric IDs into SQL Numbers, JSON Array, and Python List', () => {
    const input = '1001\n1002\n1003\n1004\n1005';
    const cards = classifyDataIntent(input);
    expect(cards.length).toBe(3);

    // Card 1: SQL Numbers
    expect(cards[0].id).toBe('sql-numbers');
    expect(cards[0].formattedResult).toBe('(1001, 1002, 1003, 1004, 1005)');

    // Card 2: JSON Array
    expect(cards[1].id).toBe('json-numbers');
    expect(cards[1].formattedResult).toContain('1001, 1002, 1003');

    // Card 3: Python List
    expect(cards[2].id).toBe('python-list-num');
    expect(cards[2].formattedResult).toBe('[1001, 1002, 1003, 1004, 1005]');
  });

  it('suggests zero-padding for numeric strings with varying lengths (e.g. zip codes)', () => {
    const input = '42\n1001\n94103\n7';
    const cards = classifyDataIntent(input);
    expect(cards.length).toBe(3);
    expect(cards[2].id).toBe('zfill-csv');
    expect(cards[2].formattedResult).toContain("'00042'");
    expect(cards[2].formattedResult).toContain("'00007'");
  });

  it('classifies emails into Email To/Bcc semicolon list and SQL IN emails', () => {
    const input = 'alice@example.com\nbob@work.org\ncarol@corp.io';
    const cards = classifyDataIntent(input);
    expect(cards.length).toBe(3);

    expect(cards[0].id).toBe('email-bcc');
    expect(cards[0].formattedResult).toBe('alice@example.com; bob@work.org; carol@corp.io');

    expect(cards[1].id).toBe('sql-in-emails');
    expect(cards[1].formattedResult).toBe("('alice@example.com', 'bob@work.org', 'carol@corp.io')");

    expect(cards[2].id).toBe('python-list-emails');
    expect(cards[2].formattedResult).toContain("'alice@example.com'");
  });

  it('cleans messy Excel pasted data with quotes and tabs', () => {
    const input = '"1001, Main St"\t\n"1002, High Ave"\t';
    const cards = classifyDataIntent(input);
    expect(cards.length).toBe(3);
    expect(cards[0].id).toBe('clean-csv');
    expect(cards[0].formattedResult).toBe('1001, Main St, 1002, High Ave');
  });

  it('provides frequency ranked distribution when duplicates are present in text', () => {
    const input = 'apple\nbanana\napple\ncherry\napple\nbanana';
    const cards = classifyDataIntent(input);
    expect(cards.length).toBe(3);
    expect(cards[2].id).toBe('freq-desc');
    // apple has 3 occurrences, banana has 2, cherry has 1
    expect(cards[2].formattedResult).toBe('apple, apple, apple, banana, banana, cherry');
  });
});

describe('intent engine - parseNaturalLanguageIntent', () => {
  it('parses "sql in with single quotes and deduplicate"', () => {
    const res = parseNaturalLanguageIntent('sql in with single quotes and deduplicate', DEFAULT_OPTIONS);
    expect(res.options.delimiter).toBe(', ');
    expect(res.options.quotes).toBe('single');
    expect(res.options.globalPrefix).toBe('(');
    expect(res.options.globalSuffix).toBe(')');
    expect(res.options.deduplicate).toBe(true);
    expect(res.options.deduplicateStrategy).toBe('first');
  });

  it('parses "pad to 5 zeros and sort by frequency"', () => {
    const res = parseNaturalLanguageIntent('pad to 5 zeros and sort by frequency', DEFAULT_OPTIONS);
    expect(res.options.zeroPadWidth).toBe(5);
    expect(res.options.sort).toBe('freq-desc');
  });

  it('parses "make it a json array uppercase"', () => {
    const res = parseNaturalLanguageIntent('make it a json array uppercase', DEFAULT_OPTIONS);
    expect(res.options.quotes).toBe('double');
    expect(res.options.globalPrefix).toBe('[\n  ');
    expect(res.options.caseTransform).toBe('upper');
  });

  it('parses "postgres unnest array"', () => {
    const res = parseNaturalLanguageIntent('postgres unnest array', DEFAULT_OPTIONS);
    expect(res.options.globalPrefix).toBe('ANY(ARRAY[');
    expect(res.options.globalSuffix).toBe('])');
  });

  it('parses "bigquery unnest"', () => {
    const res = parseNaturalLanguageIntent('bigquery unnest', DEFAULT_OPTIONS);
    expect(res.options.globalPrefix).toBe('IN UNNEST([');
    expect(res.options.globalSuffix).toBe('])');
  });

  it('parses "python list with single quotes"', () => {
    const res = parseNaturalLanguageIntent('python list with single quotes', DEFAULT_OPTIONS);
    expect(res.options.globalPrefix).toBe('[');
    expect(res.options.globalSuffix).toBe(']');
    expect(res.options.quotes).toBe('single');
  });

  it('parses "clean excel quotes"', () => {
    const res = parseNaturalLanguageIntent('clean excel quotes', DEFAULT_OPTIONS);
    expect(res.extractType).toBe('excel');
  });

  it('parses "extract emails and deduplicate"', () => {
    const res = parseNaturalLanguageIntent('extract emails and deduplicate', DEFAULT_OPTIONS);
    expect(res.extractType).toBe('emails');
    expect(res.options.deduplicate).toBe(true);
  });

  it('correctly handles "remove all a in text" on input data', () => {
    const input = 'hahahhahaaaaaaaaa';
    const res = parseNaturalLanguageIntent('remove all a in text', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('hhhhh');
    expect(res.description).toBe('Removed all "a" from text');
  });

  it('removes vowels from text', () => {
    const input = 'apple\nbanana\ncherry';
    const res = parseNaturalLanguageIntent('remove all vowels', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('ppl\nbnn\nchrry');
  });

  it('removes numbers from text', () => {
    const input = 'user123\nitem456\norder789';
    const res = parseNaturalLanguageIntent('remove all digits', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('user\nitem\norder');
  });

  it('removes spaces from text', () => {
    const input = 'a b c\nd e f';
    const res = parseNaturalLanguageIntent('remove all spaces', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('abc\ndef');
  });

  it('replaces substrings in text', () => {
    const input = 'hello foo world\ngoodbye foo';
    const res = parseNaturalLanguageIntent('replace foo with bar', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('hello bar world\ngoodbye bar');
  });

  it('replaces spaces with dashes', () => {
    const input = 'hello world\nalpha beta gamma';
    const res = parseNaturalLanguageIntent('replace spaces with -', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('hello-world\nalpha-beta-gamma');
  });

  it('filters and keeps lines containing term', () => {
    const input = 'apple pie\nbanana split\ncherry tart\npineapple cake';
    const res = parseNaturalLanguageIntent('keep lines containing apple', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('apple pie\npineapple cake');
  });

  it('removes lines containing term', () => {
    const input = 'apple pie\nbanana split\ncherry tart\npineapple cake';
    const res = parseNaturalLanguageIntent('remove lines containing apple', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('banana split\ncherry tart');
  });

  it('prefixes each line', () => {
    const input = 'col1\ncol2\ncol3';
    const res = parseNaturalLanguageIntent('prefix with tbl_', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('tbl_col1\ntbl_col2\ntbl_col3');
  });

  it('suffixes each line', () => {
    const input = 'data\narchive\nbackup';
    const res = parseNaturalLanguageIntent('suffix with .json', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('data.json\narchive.json\nbackup.json');
  });

  it('reverses characters in each line', () => {
    const input = 'hello\nworld';
    const res = parseNaturalLanguageIntent('reverse characters', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('olleh\ndlrow');
  });

  it('handles combined commands: "remove all a in text and uppercase"', () => {
    const input = 'apple\nbanana';
    const res = parseNaturalLanguageIntent('remove all a in text and uppercase', DEFAULT_OPTIONS, input);
    expect(res.matched).toBe(true);
    expect(res.transformedText).toBe('pple\nbnn');
    expect(res.options.caseTransform).toBe('upper');
  });

  it('returns matched=false and help text for unrecognized prompts', () => {
    const res = parseNaturalLanguageIntent('make me a hot cappuccino please', DEFAULT_OPTIONS);
    expect(res.matched).toBe(false);
    expect(res.description).toContain('Could not recognize prompt');
  });
});
