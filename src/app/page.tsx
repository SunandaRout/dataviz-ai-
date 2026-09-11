'use client';

import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Upload,
  BarChart3,
  Code2,
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Download,
  Maximize2,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import {
  Row,
  profile,
  chooseMetrics,
  chooseCharts,
  chartData,
  insights,
  formatValue,
  summarize,
  askAI,
} from '@/lib/analytics';

const demo: Row[] = Array.from({ length: 180 }, (_, i) => {
  const d = new Date(2026, 0, 1 + i % 180);
  const categories = ['Technology', 'Furniture', 'Office Supplies', 'Healthcare'];
  const regions = ['North', 'South', 'East', 'West'];
  const sales = Math.round(400 + Math.random() * 2400);
  const profit = Math.round(sales * (0.08 + Math.random() * 0.22));
  return {
    Date: d.toISOString().slice(0, 10),
    Category: categories[i % categories.length],
    Region: regions[i % regions.length],
    Sales: sales,
    Profit: profit,
    Orders: 1,
    Customers: 100 + (i % 45),
  };
});

function parseFile(file: File, onDone: (rows: Row[], name: string) => void) {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => onDone(result.data, file.name),
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const wb = XLSX.read(event.target?.result, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    onDone(XLSX.utils.sheet_to_json<Row>(ws, { defval: null }), file.name);
  };
  reader.readAsArrayBuffer(file);
}

export default function Home() {
  const [rows, setRows] = useState<Row[]>(demo);
  const [name, setName] = useState('demo_sales_dataset.csv');
  const [tab, setTab] = useState('Dashboard');
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const info = useMemo(() => profile(rows), [rows]);
  const metrics = useMemo(() => chooseMetrics(rows, info), [rows, info]);
  const charts = useMemo(() => chooseCharts(rows, info), [rows, info]);
  const ai = useMemo(() => insights(rows, info), [rows, info]);

  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        Object.entries(filter).every(([key, value]) => !value || String(row[key]) === value),
      ),
    [rows, filter],
  );

  const categorical = info
    .filter((column) => column.type === 'category' && column.unique <= 20)
    .slice(0, 4);

  const duplicateCount = rows.length - new Set(rows.map((row) => JSON.stringify(row))).size;
  const missingCells = info.reduce((sum, column) => sum + column.missing, 0);
  const totalCells = Math.max(rows.length * Math.max(info.length, 1), 1);
  const quality = Math.max(
    0,
    Math.round(100 - (missingCells / totalCells) * 100 - Math.min(8, duplicateCount)),
  );

  const load = (file: File) => {
    parseFile(file, (newRows, fileName) => {
      if (!newRows.length) return;
      setRows(newRows);
      setName(fileName);
      setFilter({});
      setAiAnswer('');
      setQuery('');
      setTab('Dashboard');
    });
  };

  const handleAsk = () => {
    const question = query.trim();
    if (!question || asking) return;

    setAsking(true);
    setAiAnswer('');

    window.setTimeout(() => {
      setAiAnswer(askAI(question, filtered, info));
      setAsking(false);
    }, 250);
  };

  const resetFilters = () => setFilter({});

  const regenerate = () => {
    setRows([...demo]);
    setName('demo_sales_dataset.csv');
    setFilter({});
    setAiAnswer('');
    setQuery('');
    setTab('Dashboard');
  };

  return (
    <div className="min-h-screen grid-bg">
      <header className="sticky top-0 z-30 h-16 border-b bg-white/95 px-5 backdrop-blur">
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
              <BarChart3 size={19} />
            </div>
            <div>
              <div className="font-bold tracking-tight">
                DataViz <span className="text-blue-600">AI</span>
              </div>
              <div className="text-[10px] tracking-wider text-slate-500">
                AUTOMATED ANALYTICS PLATFORM
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {['Overview', 'EDA', 'SQL', 'Feature Engineering', 'Dashboard', 'AI Insights'].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    tab === item
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border bg-white p-2 hover:bg-slate-50"
              title="Refresh analysis"
              onClick={() => setRows([...rows])}
            >
              <RefreshCw size={16} />
            </button>
            <button
              className="rounded-lg border bg-white p-2 hover:bg-slate-50"
              title="Full screen"
              onClick={() => document.documentElement.requestFullscreen?.()}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          <aside className="space-y-4 lg:w-64">
            <div className="card p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">Dataset</div>
              <div className="mt-2 truncate font-semibold" title={name}>
                {name}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2">
                  <b>{rows.length.toLocaleString()}</b>
                  <br />
                  <span className="text-slate-500">Rows</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <b>{info.length}</b>
                  <br />
                  <span className="text-slate-500">Columns</span>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-sm font-medium hover:bg-blue-50">
                <Upload size={15} /> Replace dataset
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) load(file);
                  }}
                />
              </label>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Data Quality</span>
                <span className="text-sm font-bold">{quality}/100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600" style={{ width: `${quality}%` }} />
              </div>
              <div className="mt-3 text-xs text-slate-500">
                {missingCells.toLocaleString()} missing cells detected
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {duplicateCount ? `${duplicateCount} potential duplicate rows` : 'No obvious duplicates'}
              </div>
            </div>

            <div className="card p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Filter size={15} /> Smart Filters
              </div>

              {categorical.map((column) => {
                const values = [...new Set(rows.map((row) => String(row[column.name] ?? 'Unknown')))].slice(0, 30);
                return (
                  <label key={column.name} className="mb-3 block text-xs text-slate-500">
                    {column.name}
                    <select
                      value={filter[column.name] || ''}
                      onChange={(event) =>
                        setFilter({ ...filter, [column.name]: event.target.value })
                      }
                      className="mt-1 w-full rounded-lg border bg-white p-2 text-sm text-slate-800"
                    >
                      <option value="">All</option>
                      {values.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}

              <button
                onClick={resetFilters}
                className="flex w-full items-center justify-center gap-2 rounded-lg border p-2 text-xs hover:bg-slate-50"
              >
                <RotateCcw size={13} /> Reset filters
              </button>
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  AI-generated analytics
                </div>
                <h1 className="mt-1 text-2xl font-bold md:text-3xl">Business Performance Dashboard</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Interactive analysis from <b>{name}</b> · {filtered.length.toLocaleString()} filtered rows
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50">
                  <Download size={15} /> Export
                </button>
                <button
                  onClick={regenerate}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {metrics.map((metric: any) => (
                <div className="card p-4" key={metric.label}>
                  <div className="text-xs text-slate-500">{metric.label}</div>
                  <div className="mt-2 text-2xl font-bold">
                    {metric.format === 'integer'
                      ? metric.value.toLocaleString()
                      : formatValue(metric.value)}
                  </div>
                  <div className="mt-2 text-xs text-emerald-600">↑ AI metric</div>
                </div>
              ))}
            </div>

            {tab === 'Dashboard' || tab === 'Overview' ? (
              <>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {charts.map((chart) => (
                    <ChartCard key={chart.id} cfg={chart} rows={filtered} />
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  <div className="card p-5 xl:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Detailed Data</h3>
                        <p className="text-xs text-slate-500">Preview of transformed dataset</p>
                      </div>
                      <FileSpreadsheet size={18} className="text-slate-400" />
                    </div>

                    <div className="overflow-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            {info.slice(0, 7).map((column) => (
                              <th
                                key={column.name}
                                className="border-b p-2 text-left font-semibold text-slate-500"
                              >
                                {column.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.slice(0, 8).map((row, index) => (
                            <tr key={index}>
                              {info.slice(0, 7).map((column) => (
                                <td key={column.name} className="whitespace-nowrap border-b p-2">
                                  {String(row[column.name] ?? '—')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <InsightsCard ai={ai} />
                </div>
              </>
            ) : (
              <AnalyticsTab tab={tab} rows={filtered} info={info} ai={ai} quality={quality} />
            )}

            <div className="card mt-4 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                  <BrainCircuit size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">Ask AI about your data</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Ask questions about sales, categories, regions, products, months, averages, counts, or year comparisons.
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAsk();
                  }}
                  placeholder="Ask a question about your dataset..."
                  className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={handleAsk}
                  disabled={asking || !query.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {asking ? 'Analyzing…' : 'Ask AI'}
                </button>
              </div>

              {aiAnswer && (
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-blue-700">AI Answer:</span> {aiAnswer}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function InsightsCard({ ai }: { ai: string[] }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 font-semibold">
        <Sparkles size={17} className="text-blue-600" /> AI Insights
      </div>
      {ai.map((item, index) => (
        <div key={index} className="mt-4 flex gap-3 text-sm">
          <div className="mt-0.5">
            {index === 2 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <p className="leading-5 text-slate-600">{item}</p>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ cfg, rows }: { cfg: any; rows: Row[] }) {
  const data = chartData(rows, cfg);

  return (
    <div className="card min-h-[330px] p-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{cfg.title}</h3>
          <p className="text-xs text-slate-500">AI-selected visualization</p>
        </div>
        <button className="rounded-md p-1.5 hover:bg-slate-100">
          <ChevronDown size={15} />
        </button>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {cfg.kind === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[5, 5, 0, 0]} />
            </BarChart>
          ) : cfg.kind === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
            </LineChart>
          ) : cfg.kind === 'area' ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#dbeafe" />
            </AreaChart>
          ) : cfg.kind === 'scatter' ? (
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" tick={{ fontSize: 10 }} />
              <YAxis type="number" dataKey="y" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Scatter data={data} fill="#2563eb" />
            </ScatterChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.map((_: any, index: number) => (
                  <Cell
                    key={index}
                    fill={['#2563eb', '#64748b', '#0f766e', '#7c3aed', '#ea580c'][index % 5]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AnalyticsTab({
  tab,
  rows,
  info,
  ai,
  quality,
}: {
  tab: string;
  rows: Row[];
  info: any[];
  ai: string[];
  quality: number;
}) {
  if (tab === 'EDA') {
    return (
      <div className="card p-5">
        <h2 className="text-xl font-bold">Automatic EDA</h2>
        <p className="mt-1 text-sm text-slate-500">
          Statistical profile generated from detected numeric fields.
        </p>
        <div className="mt-5 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Field', 'Mean', 'Median', 'Min', 'Max', 'Std. proxy'].map((label) => (
                  <th key={label} className="border-b p-3 text-left text-slate-500">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {info
                .filter((column: any) => column.type === 'number')
                .map((column: any) => {
                  const stats = summarize(rows, column.name);
                  if (!stats) return null;
                  return (
                    <tr key={column.name}>
                      <td className="border-b p-3 font-medium">{column.name}</td>
                      <td className="border-b p-3">{stats.mean.toFixed(2)}</td>
                      <td className="border-b p-3">{stats.median.toFixed(2)}</td>
                      <td className="border-b p-3">{stats.min.toFixed(2)}</td>
                      <td className="border-b p-3">{stats.max.toFixed(2)}</td>
                      <td className="border-b p-3">{(Math.abs(stats.max - stats.min) / 4).toFixed(2)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (tab === 'SQL') return <SQLPanel info={info} />;
  if (tab === 'Feature Engineering') return <FeaturePanel info={info} />;

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Sparkles className="text-blue-600" /> AI Insights
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[
          ...ai,
          `Data Quality Score is ${quality}/100.`,
          `Detected ${info.length} fields across numeric, categorical, date and text types.`,
        ].map((item, index) => (
          <div key={index} className="rounded-xl border bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-400">Finding {index + 1}</div>
            <div className="mt-2 text-sm leading-6">{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SQLPanel({ info }: { info: any[] }) {
  const numberColumn = info.find((column) => column.type === 'number');
  const categoryColumn = info.find((column) => column.type === 'category');

  const query =
    numberColumn && categoryColumn
      ? `SELECT ${categoryColumn.name}, SUM(${numberColumn.name}) AS total_${numberColumn.name}\nFROM dataset\nGROUP BY ${categoryColumn.name}\nORDER BY total_${numberColumn.name} DESC;`
      : 'SELECT * FROM dataset LIMIT 100;';

  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Code2 /> SQL Analysis
      </h2>
      <p className="mt-1 text-sm text-slate-500">Generated query based on detected dimensions and measures.</p>
      <pre className="mt-5 overflow-auto rounded-xl bg-slate-950 p-5 text-sm text-slate-100">{query}</pre>
      <button
        onClick={() => navigator.clipboard?.writeText(query)}
        className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Copy SQL
      </button>
    </div>
  );
}

function FeaturePanel({ info }: { info: any[] }) {
  const dateColumn = info.find((column) => column.type === 'date');
  const numberColumn = info.find((column) => column.type === 'number');

  const features = [
    dateColumn && ['Year', `YEAR(${dateColumn.name})`, 'Time-series grouping'],
    dateColumn && ['Month', `MONTH(${dateColumn.name})`, 'Monthly trend analysis'],
    numberColumn && ['Normalized Value', `(${numberColumn.name} - mean) / std`, 'Scale numeric variation'],
  ].filter(Boolean) as string[][];

  return (
    <div className="card p-5">
      <h2 className="text-xl font-bold">Feature Engineering</h2>
      <p className="mt-1 text-sm text-slate-500">Meaningful derived features suggested from the detected schema.</p>
      <div className="mt-5 space-y-3">
        {features.map((feature) => (
          <div key={feature[0]} className="flex items-center gap-4 rounded-xl border p-4">
            <input type="checkbox" defaultChecked />
            <div className="flex-1">
              <div className="font-semibold">{feature[0]}</div>
              <div className="mt-1 text-xs text-slate-500">
                Formula: {feature[1]} · Reason: {feature[2]}
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">derived</span>
          </div>
        ))}
      </div>
    </div>
  );
}
