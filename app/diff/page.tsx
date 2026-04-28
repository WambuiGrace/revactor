'use client';

/*
  /diff — Before / After split-diff page.
  "use client" is required for the SPLIT ↔ UNIFIED toggle (useState).

  Concepts introduced here:
  • Diff data model — each row carries independent before/after slots
    (num | null, code, type). null num = filler row for alignment in split view.
  • Conditional rendering on a toggle — same data, two render paths.
  • Derived unified view — built from the same split rows so the data
    is never duplicated.
  • SVG inline in JSX — the "R" logomark reused from other pages.
*/

import { useState } from 'react';
import Link from 'next/link';

// ── Data model ────────────────────────────────────────────────────

type LineType = 'context' | 'removed' | 'added';

interface DiffSide {
  num:  number | null; // null  = filler / alignment spacer
  code: string;
  type: LineType;
}

interface SplitRow {
  before: DiffSide;
  after:  DiffSide;
}

// helpers so the data declarations stay compact
const ctx  = (n: number, code: string): DiffSide => ({ num: n,    code, type: 'context' });
const del_ = (n: number, code: string): DiffSide => ({ num: n,    code, type: 'removed' });
const add_ = (n: number, code: string): DiffSide => ({ num: n,    code, type: 'added'   });
const fill = (): DiffSide                          => ({ num: null, code: '',   type: 'context' });

// ── Diff rows ─────────────────────────────────────────────────────
//
// Each SplitRow pairs one "before" slot with one "after" slot.
// When a hunk removes more lines than it adds (or vice-versa), the
// shorter side gets fill() rows so the two panels stay aligned.

const ROWS: SplitRow[] = [
  // ── comment (modified) ──────────────────────────────────────
  { before: del_(1,  "// fetchAll.ts — batch fetch with cache"),
    after:  add_(1,  "// fetchAll.ts — batch fetch with cache (refactored)") },

  // ── import + interface (unchanged) ──────────────────────────
  { before: ctx(2,  "import type { Item } from './types';"),
    after:  ctx(2,  "import type { Item } from './types';") },
  { before: ctx(3,  ""),                  after: ctx(3,  "") },
  { before: ctx(4,  "interface Fetcher<T> {"),
    after:  ctx(4,  "interface Fetcher<T> {") },
  { before: ctx(5,  "  (id: string): Promise<T>;"),
    after:  ctx(5,  "  (id: string): Promise<T>;") },
  { before: ctx(6,  "}"),                 after: ctx(6,  "}") },
  { before: ctx(7,  ""),                  after: ctx(7,  "") },

  // ── fetchAll signature ───────────────────────────────────────
  { before: ctx(8,  "export async function fetchAll<T>("),
    after:  ctx(8,  "export async function fetchAll<T>(") },
  { before: del_(9,  "  ids: string[],"),
    after:  add_(9,  "  ids: readonly string[],") },
  { before: ctx(10, "  fetcher: Fetcher<T>"),
    after:  ctx(10, "  fetcher: Fetcher<T>") },
  { before: ctx(11, "): Promise<Record<string, T>> {"),
    after:  ctx(11, "): Promise<Record<string, T>> {") },

  // ── fetchAll body: 9 removed → 5 added ──────────────────────
  { before: del_(12, "  const pending = new Set<string>();"),
    after:  add_(12, "  const unique = [...new Set(ids)];") },
  { before: del_(13, "  const out: Record<string, T> = {};"),
    after:  add_(13, "  const entries = await Promise.all(") },
  { before: del_(14, ""),
    after:  add_(14, "    unique.map(async id => [id, await fetcher(id)] as const)") },
  { before: del_(15, "  for (const id of ids) {"),
    after:  add_(15, "  );") },
  { before: del_(16, "    if (pending.has(id)) continue;"),
    after:  add_(16, "  return Object.fromEntries(entries);") },
  { before: del_(17, "    pending.add(id);"),     after: fill() },
  { before: del_(18, "    out[id] = await fetcher(id);"), after: fill() },
  { before: del_(19, "  }"),                       after: fill() },
  { before: del_(20, "  return out;"),              after: fill() },

  // ── closing brace + blank (context) ─────────────────────────
  { before: ctx(21, "}"),   after: ctx(17, "}") },
  { before: ctx(22, ""),    after: ctx(18, "")  },

  // ── parseConfig header (context) ────────────────────────────
  { before: ctx(23, "export function parseConfig(raw: string) {"),
    after:  ctx(19, "export function parseConfig(raw: string) {") },

  // ── parseConfig body: 1 removed → 5 added ───────────────────
  { before: del_(24, "  const cfg = JSON.parse(raw);"),
    after:  add_(20, "  let parsed: unknown;") },
  { before: fill(),  after: add_(21, "  try { parsed = JSON.parse(raw); }") },
  { before: fill(),  after: add_(22, "  catch { throw new Error(`Invalid config: ${raw.slice(0,40)}`); }") },
  { before: fill(),  after: add_(23, "") },
  { before: fill(),  after: add_(24, "  const cfg = parsed as Record<string, unknown>;") },

  // ── return block ─────────────────────────────────────────────
  { before: ctx(25, "  return {"),   after: ctx(25, "  return {") },
  { before: del_(26, "    retries: cfg.retries ?? 3,"),
    after:  add_(26, "    retries: typeof cfg.retries === 'number' ? cfg.retries : 3,") },
  { before: del_(27, "    timeout: parseInt(cfg.timeout),"),
    after:  add_(27, "    timeout: parseInt(String(cfg.timeout ?? '5000'), 10),") },
  { before: del_(28, "    hosts: cfg.hosts || [],"),
    after:  add_(28, "    hosts:   Array.isArray(cfg.hosts) ? (cfg.hosts as string[]) : [],") },
  { before: ctx(29, "  };"),  after: ctx(29, "  };") },
  { before: ctx(30, "}"),     after: ctx(30, "}") },
  { before: ctx(31, ""),      after: ctx(31, "") },

  // ── findDuplicates ───────────────────────────────────────────
  { before: ctx(32, "export function findDuplicates(a: string[], b: string[]) {"),
    after:  ctx(32, "export function findDuplicates(a: string[], b: string[]) {") },
  { before: del_(33, "  return a.map(x => b.includes(x) ? x : null)"),
    after:  add_(33, "  const setB = new Set(b);") },
  { before: del_(34, "    .filter(Boolean);"),
    after:  add_(34, "  return a.filter(x => setB.has(x));") },
  { before: ctx(35, "}"), after: ctx(35, "}") },
];

// ── Stats (derived) ───────────────────────────────────────────────

const removed = ROWS.filter(r => r.before.type === 'removed' && r.before.num !== null).length;
const added   = ROWS.filter(r => r.after.type  === 'added'   && r.after.num  !== null).length;

// ── Line styling ──────────────────────────────────────────────────

const LINE_STYLE: Record<LineType, string> = {
  removed: 'bg-red-500/10',
  added:   'bg-green-500/10',
  context: '',
};

const GUTTER_STYLE: Record<LineType, string> = {
  removed: 'bg-red-500/20   text-red-400/70',
  added:   'bg-green-500/20 text-green-400/70',
  context: 'bg-surface      text-muted',
};

const PREFIX: Record<LineType, string> = { removed: '-', added: '+', context: ' ' };

// ── Sub-components ────────────────────────────────────────────────

function GutterNum({ num, type }: { num: number | null; type: LineType }) {
  return (
    <div className={`shrink-0 w-10 text-right pr-3 py-0.5 text-[10px] leading-5 select-none ${GUTTER_STYLE[type]}`}>
      {num ?? ''}
    </div>
  );
}

function CodeCell({ code, type }: { code: string; type: LineType }) {
  return (
    <div className={`flex-1 px-3 py-0.5 text-[11px] leading-5 font-mono whitespace-pre overflow-hidden text-ellipsis ${LINE_STYLE[type]} ${type === 'context' ? 'text-[#e2e8e2]' : type === 'removed' ? 'text-red-300' : 'text-green-300'}`}>
      {code || ' '}
    </div>
  );
}

// ── Split view ────────────────────────────────────────────────────

function SplitView() {
  return (
    <div className="flex divide-x divide-border overflow-x-auto">
      {/* Before panel */}
      <div className="flex-1 min-w-0">
        {ROWS.map((row, i) => (
          <div key={i} className="flex">
            <GutterNum num={row.before.num} type={row.before.type} />
            <CodeCell  code={row.before.code} type={row.before.type} />
          </div>
        ))}
      </div>

      {/* After panel */}
      <div className="flex-1 min-w-0">
        {ROWS.map((row, i) => (
          <div key={i} className="flex">
            <GutterNum num={row.after.num} type={row.after.type} />
            <CodeCell  code={row.after.code} type={row.after.type} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Unified view ──────────────────────────────────────────────────
/*
  Derive unified lines from split rows:
  • context → show once (before side)
  • removed (before.num !== null) → show with '-' prefix
  • fill (before.num === null) → skip
  • added  (after.num  !== null) → show with '+' prefix
  • fill (after.num === null)  → skip
*/
function UnifiedView() {
  const lines: Array<{ num: number; code: string; type: LineType; prefix: string }> = [];
  let uNum = 0;

  for (const row of ROWS) {
    if (row.before.type === 'context' && row.before.num !== null) {
      uNum++;
      lines.push({ num: uNum, code: row.before.code, type: 'context', prefix: ' ' });
    } else {
      if (row.before.num !== null) {
        uNum++;
        lines.push({ num: uNum, code: row.before.code, type: 'removed', prefix: '-' });
      }
      if (row.after.num !== null) {
        uNum++;
        lines.push({ num: uNum, code: row.after.code, type: 'added', prefix: '+' });
      }
    }
  }

  return (
    <div>
      {lines.map((line, i) => (
        <div key={i} className={`flex text-[11px] leading-5 font-mono ${LINE_STYLE[line.type]}`}>
          <div className={`shrink-0 w-10 text-right pr-3 py-0.5 select-none text-[10px] ${GUTTER_STYLE[line.type]}`}>
            {line.num}
          </div>
          <div className={`shrink-0 w-5 py-0.5 text-center select-none ${line.type === 'removed' ? 'text-red-400' : line.type === 'added' ? 'text-green-400' : 'text-muted'}`}>
            {line.prefix}
          </div>
          <div className={`flex-1 px-2 py-0.5 whitespace-pre ${line.type === 'removed' ? 'text-red-300' : line.type === 'added' ? 'text-green-300' : 'text-[#e2e8e2]'}`}>
            {line.code || ' '}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function DiffPage() {
  const [mode,        setMode]        = useState<'split' | 'unified'>('split');
  const [patchCopied, setPatchCopied] = useState(false);

  function applyPatch() {
    setPatchCopied(true);
    setTimeout(() => setPatchCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-bg font-mono text-[#e2e8e2] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">

        {/* ── Page header (outside the panel) ──────────────── */}
        <div className="mb-6">
          <Link href="/demo" className="text-muted text-xs hover:text-[#e2e8e2] transition-colors">
            A · Split diff
          </Link>
          <h1 className="text-2xl font-bold mt-2">Before / After</h1>
          <p className="text-muted text-xs mt-1">Refactor diff with Claude commentary</p>
        </div>

        {/* ── Diff panel ───────────────────────────────────── */}
        <div className="border border-border bg-surface rounded-sm overflow-hidden">

          {/* Panel header */}
          <div className="flex items-center justify-between px-4 h-11 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              {/* Logo mark */}
              <span className="text-accent font-bold text-sm">
                <span className="text-muted">&gt;</span> R
              </span>
              <span className="text-xs text-[#e2e8e2]">fetchAll.ts</span>
              <span className="text-muted text-xs">→</span>
              <span className="text-xs text-accent">refactor</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-sm overflow-hidden text-[10px] font-bold">
                <button
                  onClick={() => setMode('split')}
                  className={`px-3 py-1 transition-colors ${mode === 'split' ? 'bg-accent text-bg' : 'text-muted hover:text-[#e2e8e2]'}`}
                >
                  SPLIT
                </button>
                <button
                  onClick={() => setMode('unified')}
                  className={`px-3 py-1 border-l border-border transition-colors ${mode === 'unified' ? 'bg-accent text-bg' : 'text-muted hover:text-[#e2e8e2]'}`}
                >
                  UNIFIED
                </button>
              </div>
              <button
                onClick={applyPatch}
                className="text-[10px] border border-border text-muted px-3 py-1 rounded-sm hover:text-[#e2e8e2] transition-colors"
              >
                {patchCopied ? 'PATCH COPIED!' : 'APPLY PATCH...'}
              </button>
            </div>
          </div>

          {/* Stats + branch row */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border text-[10px] text-muted">
            <div className="flex items-center gap-1">
              <span className="text-green-400">+{added}</span>
              <span>·</span>
              <span className="text-red-400">-{removed}</span>
              <span>· {added - removed > 0 ? added - removed : removed - added} net lines saved · same behavior</span>
            </div>
            <span className="text-muted">{ROWS.filter(r => r.before.num !== null).length} lines</span>
          </div>

          {/* Branch indicators */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card/50 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              <span className="text-muted">before · main</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted">after</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            </div>
          </div>

          {/* Diff content */}
          <div className="overflow-x-auto">
            {mode === 'split' ? <SplitView /> : <UnifiedView />}
          </div>

          {/* Claude commentary bar */}
          <div className="border-t border-border px-4 py-3 bg-card/50 flex items-start gap-3">
            <span className="text-accent font-bold text-xs shrink-0 mt-0.5">claude:</span>
            <p className="text-muted text-[11px] leading-5">
              The original ran fetches sequentially via{' '}
              <code className="text-[#e2e8e2] bg-border/50 px-1 rounded-sm">await</code>{' '}
              in a for-loop. The refactor parallelizes with{' '}
              <code className="text-[#e2e8e2] bg-border/50 px-1 rounded-sm">Promise.all</code>,
              dedupes via{' '}
              <code className="text-[#e2e8e2] bg-border/50 px-1 rounded-sm">Set</code>,
              and surfaces JSON parse failures explicitly.
              Behavior identical for valid input; throws earlier on malformed config.
            </p>
          </div>

        </div>

        {/* ── Back link ─────────────────────────────────────── */}
        <div className="mt-6">
          <Link href="/demo" className="text-xs text-muted hover:text-[#e2e8e2] transition-colors">
            ← back to workspace
          </Link>
        </div>

      </div>
    </div>
  );
}
