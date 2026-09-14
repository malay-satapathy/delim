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
});
