# delim

<p align="center">
  <strong>Fast, intuitive, and 100% in-browser list formatting and delimiter transformation tool.</strong><br/>
  Zero data stored. Zero analytics. Zero ads. Safe for sensitive credentials, SQL, and private datasets.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Privacy-100%25%20Client--Side-10b981?style=flat-square" alt="Privacy Guarantee" />
  <img src="https://img.shields.io/badge/Design-Unified%20Command%20Deck-6366f1?style=flat-square" alt="Unified Command Deck" />
  <img src="https://img.shields.io/badge/Engine-pandas%20Enhanced-f59e0b?style=flat-square" alt="pandas Enhanced" />
  <img src="https://img.shields.io/badge/Ads-Zero%20Ever-ef4444?style=flat-square" alt="Zero Ads" />
  <img src="https://img.shields.io/badge/License-MIT-3b82f6?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=flat-square" alt="GitHub Pages" />
</p>

---

## ✨ Design Philosophy & Architecture

Built with a **minimalist, Apple-inspired design pattern** and **progressive disclosure**:
- **Unified Command Deck**: Collapses multi-tier toolbars into a single, razor-thin 44px command strip. High-frequency essentials (`CSV`, `SQL IN`, `JSON`, `Pipe`, `Delim`, `Quotes`, `Trim`, `Dedupe`) sit at hand, while secondary tools live inside a clean `Refine ▾` menu.
- **Quiet Canvas**: Free of visual noise, fake sample clutter, and redundant buttons. The canvas gives 80%+ of the viewport directly to your data.
- **Sensory Progressive Disclosure**: Power tools appear only when your dataset demands them. Numeric data summons the Zero-Pad chip and live $\Sigma$ Summary pill; duplicates surface strategy controls (`Keep First`, `Keep Last`, `Singletons Only`); tabular spreadsheets summon the inline column isolator.

---

## 🚀 Key Features

### 1. Four Focused Studio Modes
- **Standard Delimiter (`[1]`)**: Fast, fluid 2-pane delimiter conversion with instant real-time updates, format presets, and smart clean-up.
- **Two-List Diff & Set Operations (`[2]`)**: Compare two datasets with $A - B$, $B - A$, $A \cap B$, $A \cup B$, and Symmetric Difference ($A \Delta B$).
- **Custom Template Engine (`[3]`)**: Dynamic string interpolation using `{item}`, `{index1}`, `{item_lower}`, `{item_upper}`, `{item_title}`, `{item_slug}`, `{item_escaped}`, and `{item_json}`.
- **Multi-Column Tabular Slicer (`[4]`)**: Auto-detect pasted Excel/Google Sheets/TSV/CSV tables and slice any column into delimited output with 1 click.
- *Switch modes via the central Navbar badges or keyboard shortcuts `1`, `2`, `3`, `4`.*

### 2. Python `pandas`-Inspired Operations
- **`s.str.zfill()` (Zero-Padding)**: Zero-pads numeric strings, IDs, and ZIP codes to $N$ digits (`42` $\rightarrow$ `00042`) without modifying text.
- **`drop_duplicates(keep='first' | 'last' | False)`**:
  - `Keep First` (default): Retains first occurrence, discards repeats.
  - `Keep Last`: Retains latest occurrence.
  - `Strictly Singletons`: Discards all duplicates entirely, keeping only unique singletons.
- **`s.value_counts()` (Frequency Distribution Sorting)**: Sort items by how frequently they occur in the dataset (highest or lowest first).
- **`s.describe()` (Live Numeric Summary Bar)**: Instant calculation of $\Sigma$ Sum, Mean (Avg), Median, Min, and Max for numeric columns.
- **Python Syntax Presets**: 1-click presets for `Python List [...]`, `Python Set {...}`, and `Python Tuple (...)`.
- **`s.str.split(delim).str[idx]`**: Programmatic slice-and-pick by delimiter with positive or negative indexing.

### 3. SQL Dialect & Limit-Aware Formatter
- **Standard SQL**: `col IN ('a', 'b', 'c')` and unquoted numbers `id IN (1, 2, 3)`.
- **Oracle ORA-01795 Auto-Chunker**: Automatically breaks large lists (>1,000 items) into compliant `(col IN (...) OR col IN (...))` blocks.
- **PostgreSQL**: `col = ANY(ARRAY['a', 'b', 'c'])`.
- **Google BigQuery & DuckDB**: `col IN UNNEST(['a', 'b', 'c'])`.
- **SQL VALUES**: `VALUES ('a'), ('b'), ('c')`.

### 4. Smart Clean-up & Pattern Extractors
- **Whitespace Trimming & Blank Stripping**: Clean messy inputs automatically.
- **Pattern Extraction**: 1-click extraction of Numbers/IDs, Emails, URLs, UUIDs, and cleaning of Excel pasted quotes (`""`).
- **Sorting & Reordering**: Natural A-Z, Z-A, Numeric sort, Frequency sort, Reverse upside-down, and Random shuffle.
- **Case Transformations**: UPPERCASE, lowercase, and Title Case.

### 5. PWA & Offline Capability
- Fully installable Progressive Web App (PWA) on macOS, Windows, Linux, iOS, and Android.
- 100% offline-ready via built-in Service Worker.

---

## 🔒 Privacy & Security Guarantee

1. **100% In-Browser Execution**: All text parsing and string manipulation runs entirely inside your browser JavaScript runtime.
2. **Zero Servers**: There is no backend API, no database, and no server-side logging.
3. **Zero Telemetry**: No Google Analytics, no tracking pixels, no telemetry beacons, and no cookies.
4. **Zero Ads**: Clean, distraction-free environment.
5. **Safe for Confidential Data**: Safe to use for production SQL queries, customer IDs, employee emails, UUIDs, and API tokens.

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/malay-satapathy/delim.git
cd delim

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Run Automated Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

The production output will be placed in the `dist/` directory, ready to be served from any static file host.

---

## 🚀 Live Production Deployment

- **Live URL**: [https://malay-satapathy.github.io/delim/](https://malay-satapathy.github.io/delim/)
- **GitHub Repository**: [https://github.com/malay-satapathy/delim](https://github.com/malay-satapathy/delim)

---

## 📄 License

Released under the [MIT License](LICENSE).
