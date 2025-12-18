# Sai Import Exports & Agro — Website
Tech: Vite + React + Tailwind (prefixed `tw-`) + Bootstrap 5

## Quick Start (Line-by-line)

1. Ensure Node.js 18+ is installed.
2. Open terminal and go into the folder:
   ```bash
   cd sai-basmati-website
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open the URL shown (usually http://localhost:5173).

### How this project avoids Tailwind x Bootstrap conflicts
- Tailwind is configured with the prefix `tw-`. Use `tw-` classes (e.g., `tw-p-4`, `tw-text-gray-700`).
- Bootstrap classes (e.g., `container`, `row`, `btn`) work as usual.
- The navbar toggles are handled by React state, so no Bootstrap JS is required.

### Replace sample data
- Edit `src/data/basmati-prices.json` (price_inr per kg).
- Hook your API later by replacing the import in `PriceTable.jsx` with an Axios call.

### Build for production
```bash
npm run build
npm run preview
```

### Where to change brand text/logo
- `src/assets/logo.svg`
- `index.html` `<title>`
- Navbar brand in `src/components/Navbar.jsx`
