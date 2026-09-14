# delim

<p align="center">
  <strong>Fast, intuitive, and 100% in-browser list formatting and delimiter transformation tool.</strong><br/>
  Zero data stored. Zero analytics. Zero ads. Safe for sensitive credentials, SQL, and private datasets.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Privacy-100%25%20Client--Side-10b981?style=flat-square" alt="Privacy Guarantee" />
  <img src="https://img.shields.io/badge/Ads-Zero%20Ever-ef4444?style=flat-square" alt="Zero Ads" />
  <img src="https://img.shields.io/badge/License-MIT-6366f1?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=flat-square" alt="GitHub Pages" />
</p>

---

## ✨ Features

- **Bidirectional Transformation**:
  - Convert multi-line column data to delimited strings in 1-click.
  - Reverse delimited data back to clean column lines.
  - Swap data between workspaces instantly.
- **1-Click Quick Presets**:
  - `SQL IN ('a', 'b', 'c')`
  - `JSON Array ["a", "b", "c"]`
  - `CSV (Plain)` & `CSV (Quoted)`
  - `Pipe (|)` separated
  - `TSV (Tab)` separated
  - `HTML <li>` lists
  - `SQL Chunks (50)` batching
- **Flexible Delimiters & Quotes**:
  - Support for commas, semicolons, pipes, spaces, tabs, newlines, or any custom string/regex.
  - Wrap items in single quotes (`'`), double quotes (`"`), backticks (`` ` ``), or custom item tags.
- **Smart Clean-up**:
  - **Attack the Clones**: Remove duplicate entries while preserving initial order.
  - **Tidy Up**: Toggle inline vs. newline delimited outputs.
  - **Whitespace Trimming**: Strip leading and trailing whitespace automatically.
  - **Skip Empty Lines**: Clean input datasets automatically.
- **Batching & Chunking**:
  - Break into new lines every $N$ items (e.g. for SQL query batch limits).
  - Wrap batches with opening/closing strings (e.g. `( ... ),`).
- **Sorting & Case Transformation**:
  - Sort alphabetically (A-Z, Z-A) or naturally by numeric values.
  - Transform casing: UPPERCASE, lowercase, or Title Case.
- **Developer First**:
  - Line numbers gutter with synchronized scrolling.
  - Real-time statistics: lines, items, unique count, duplicate count, and characters.
  - One-click copy with visual toast confirmation.
  - File drag-and-drop & download (`.txt`, `.csv`).
  - Keyboard shortcuts: `Cmd/Ctrl + Enter` to convert, `Cmd/Ctrl + K` to clear.
  - Dark & Light mode toggle.

---

## 🔒 Privacy & Security Guarantee

1. **100% In-Browser Execution**: All text parsing and string manipulation runs entirely inside your browser runtime.
2. **Zero Servers**: There is no backend API, no database, and no server-side logging.
3. **Zero Telemetry**: No Google Analytics, no tracking pixels, no telemetry beacons, and no session cookies.
4. **Zero Ads**: Clean, distraction-free environment.
5. **Safe for Confidential Data**: Safe to use for SQL queries, customer IDs, employee emails, UUIDs, and API tokens.

---

## 🚀 1-Click Deployment to GitHub Pages

Deploying your own instance of **delim** to GitHub Pages takes less than a minute:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for delim"
   git remote add origin https://github.com/malay-satapathy/delim.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub: **Settings** $\rightarrow$ **Pages**.
   - Under **Build and deployment** $\rightarrow$ **Source**, choose **GitHub Actions**.
   - The included workflow (`.github/workflows/deploy.yml`) will automatically test, build, and publish your site to:
     ```
     https://malay-satapathy.github.io/delim/
     ```

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn or pnpm

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

The output will be placed in the `dist/` directory, ready to be served from any static file host.

---

## 📄 License

Released under the [MIT License](LICENSE).
