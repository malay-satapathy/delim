import { describe, it, expect } from 'vitest';
import { columnToDelimited, delimitedToColumn, calculateStats } from './engine';
import { DEFAULT_OPTIONS } from './engine';

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
