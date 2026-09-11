# DataViz AI — Automated Analytics & Dashboard Generator

A production-style MVP inspired by the requested DataViz AI specification. It supports CSV and Excel uploads in the browser, automatic profiling, data-quality scoring, dynamic KPIs, chart selection, EDA, generated SQL, feature suggestions, AI-style insights, filters, and a Power BI-inspired dashboard.

## Run in VS Code

1. Install Node.js 18+ (20+ recommended).
2. Open this folder in VS Code.
3. Open Terminal.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Notes

- Demo data loads automatically.
- CSV/XLSX/XLS are parsed client-side.
- SQL analysis is generated from the detected schema; this MVP does not execute arbitrary remote SQL.
- The "AI" layer is deterministic and dataset-aware in this frontend MVP. Connect an LLM + FastAPI backend for real natural-language reasoning and server-side processing.
- The uploaded specification is reflected in the architecture and UX, with reusable analytics utilities and a structured chart configuration approach.
