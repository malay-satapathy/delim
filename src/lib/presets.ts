import { Preset } from '../types';

export const PRESETS: Preset[] = [
  {
    id: 'sql-in',
    name: 'SQL IN (Strings)',
    badge: 'SQL',
    description: "Format string items for SQL WHERE col IN ('a', 'b', 'c')",
    options: {
      delimiter: ', ',
      quotes: 'single',
      globalPrefix: '(',
      globalSuffix: ')',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
      itemTagOpen: '',
      itemTagClose: '',
      interval: 0,
      intervalWrapOpen: '',
      intervalWrapClose: '',
    },
  },
  {
    id: 'sql-numbers',
    name: 'SQL IN (Numbers)',
    badge: 'SQL',
    description: 'Format unquoted numeric IDs for SQL WHERE id IN (1, 2, 3)',
    options: {
      delimiter: ', ',
      quotes: 'none',
      globalPrefix: '(',
      globalSuffix: ')',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
      itemTagOpen: '',
      itemTagClose: '',
      interval: 0,
      intervalWrapOpen: '',
      intervalWrapClose: '',
    },
  },
  {
    id: 'json-array',
    name: 'JSON Array',
    badge: 'JSON',
    description: 'Format items as JSON string array ["a", "b", "c"]',
    options: {
      delimiter: ', ',
      quotes: 'double',
      globalPrefix: '[\n  ',
      globalSuffix: '\n]',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
      itemTagOpen: '',
      itemTagClose: '',
      interval: 0,
    },
  },
  {
    id: 'csv-plain',
    name: 'CSV (Plain)',
    badge: 'CSV',
    description: 'Comma separated values: a, b, c',
    options: {
      delimiter: ', ',
      quotes: 'none',
      globalPrefix: '',
      globalSuffix: '',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
      interval: 0,
    },
  },
  {
    id: 'csv-quoted',
    name: 'CSV (Quoted)',
    badge: 'CSV',
    description: 'Double-quoted comma separated: "a", "b", "c"',
    options: {
      delimiter: ', ',
      quotes: 'double',
      globalPrefix: '',
      globalSuffix: '',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
      interval: 0,
    },
  },
  {
    id: 'pipe-separated',
    name: 'Pipe (|)',
    badge: 'PIPE',
    description: 'Pipe separated values: a|b|c',
    options: {
      delimiter: '|',
      quotes: 'none',
      globalPrefix: '',
      globalSuffix: '',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
      interval: 0,
    },
  },
  {
    id: 'tsv',
    name: 'TSV (Tab)',
    badge: 'TSV',
    description: 'Tab separated values for spreadsheet pasting',
    options: {
      delimiter: '\t',
      quotes: 'none',
      globalPrefix: '',
      globalSuffix: '',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
      interval: 0,
    },
  },
  {
    id: 'html-list',
    name: 'HTML <li> List',
    badge: 'HTML',
    description: 'HTML unordered list with <li> elements',
    options: {
      delimiter: '\n',
      quotes: 'none',
      itemTagOpen: '  <li>',
      itemTagClose: '</li>',
      globalPrefix: '<ul>\n',
      globalSuffix: '\n</ul>',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
      interval: 0,
    },
  },
  {
    id: 'sql-postgres',
    name: 'Postgres ANY(ARRAY)',
    badge: 'PG',
    description: "Postgres array membership: col = ANY(ARRAY['a', 'b'])",
    options: {
      delimiter: ', ',
      quotes: 'single',
      globalPrefix: 'ANY(ARRAY[',
      globalSuffix: '])',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
    },
  },
  {
    id: 'sql-bigquery',
    name: 'BigQuery UNNEST',
    badge: 'BQ',
    description: "BigQuery array unnest: col IN UNNEST(['a', 'b'])",
    options: {
      delimiter: ', ',
      quotes: 'single',
      globalPrefix: 'IN UNNEST([',
      globalSuffix: '])',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
    },
  },
  {
    id: 'sql-values',
    name: 'SQL VALUES',
    badge: 'SQL',
    description: "SQL VALUES row constructor: VALUES ('a'), ('b')",
    options: {
      delimiter: ',\n',
      quotes: 'single',
      itemTagOpen: '  (',
      itemTagClose: ')',
      globalPrefix: 'VALUES\n',
      globalSuffix: '',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
    },
  },
  {
    id: 'python-list',
    name: 'Python List [...]',
    badge: 'PY',
    description: "Format as Python list: ['a', 'b', 'c']",
    options: {
      delimiter: ', ',
      quotes: 'single',
      globalPrefix: '[',
      globalSuffix: ']',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
    },
  },
  {
    id: 'python-set',
    name: 'Python Set {...}',
    badge: 'PY',
    description: "Format as Python unique set: {'a', 'b', 'c'}",
    options: {
      delimiter: ', ',
      quotes: 'single',
      deduplicate: true,
      globalPrefix: '{',
      globalSuffix: '}',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
    },
  },
  {
    id: 'python-tuple',
    name: 'Python Tuple (...)',
    badge: 'PY',
    description: "Format as Python tuple: ('a', 'b', 'c')",
    options: {
      delimiter: ', ',
      quotes: 'single',
      globalPrefix: '(',
      globalSuffix: ')',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
    },
  },
  {
    id: 'sql-batch',
    name: 'SQL Chunks (50)',
    badge: 'BATCH',
    description: 'Batch every 50 records inside wrapped parentheses',
    options: {
      delimiter: ', ',
      quotes: 'single',
      interval: 50,
      intervalWrapOpen: '(',
      intervalWrapClose: '),',
      tidyUp: true,
      trimWhitespace: true,
      skipEmpty: true,
    },
  },
];

export const SAMPLE_INPUT = `90210
10001
94103
90210
30301
60601
02138
10001`;

export const SAMPLE_DATASETS = {
  zipcodes: {
    label: 'Zip Codes',
    icon: '📍',
    data: `90210
10001
94103
90210
30301
60601
02138
10001`,
  },
  emails: {
    label: 'User Emails',
    icon: '📧',
    data: `alex.miller@stripe.com
sarah.connor@cyberdyne.io
alex.miller@stripe.com
neo@matrix.org
ellen.ripley@weyland.corp
bruce.wayne@wayne.enterprises`,
  },
  uuids: {
    label: 'UUIDs',
    icon: '🆔',
    data: `550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
6ba7b811-9dad-11d1-80b4-00c04fd430c8
550e8400-e29b-41d4-a716-446655440000
6ba7b812-9dad-11d1-80b4-00c04fd430c8`,
  },
  skus: {
    label: 'Product SKUs',
    icon: '📦',
    data: `SKU-99021
SKU-11045
SKU-77291
SKU-99021
SKU-33019
SKU-55420`,
  },
};

