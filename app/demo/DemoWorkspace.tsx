'use client';

/*
  DemoWorkspace — the full interactive code review IDE.

  "use client" is required here because we use:
    • useState  — track code content, review state, active tab, cursor pos
    • event handlers — textarea edits, button clicks, cursor tracking
    • setTimeout — simulate the AI review latency

  Everything below this file can be a Server Component;
  this single 'use client' boundary is enough.
*/

import { useState } from 'react';
import Link from 'next/link';
import PromptInspector from './PromptInspector';

// ── Types ──────────────────────────────────────────────────────────

type ReviewState = 'idle' | 'loading' | 'complete';
type ActiveTab   = 'review' | 'explain' | 'bugs' | 'refactor';
type Severity    = 'CRITICAL' | 'WARNING' | 'NOTE';

interface ReviewItem {
  type:  Severity;
  title: string;
  line:  number;
  body:  string;
}

// ── Static demo data ───────────────────────────────────────────────

const DEMO_CODE = `// fetchAll.ts — batch fetch with cache
import type { Item } from './types';

interface Fetcher<T> {
  (id: string): Promise<T>;
}

export async function fetchAll<T>(
  ids: string[],
  fetcher: Fetcher<T>
): Promise<Record<string, T>> {
  const pending = new Set<string>();
  const out: Record<string, T> = {};

  for (const id of ids) {
    if (pending.has(id)) continue;
    pending.add(id);
    out[id] = await fetcher(id);
  }
  return out;
}

export function parseConfig(raw: string) {
  const cfg = JSON.parse(raw);
  return {
    retries: cfg.retries ?? 3,
    timeout: parseInt(cfg.timeout),
    hosts: cfg.hosts || [],
  };
}

export function findDuplicates(a: string[], b: string[]) {
  return a.map(x => b.includes(x) ? x : null)
    .filter(Boolean);
}

// usage
const ids = ['a', 'b', 'a', 'c'];`;

const REVIEW_SUMMARY =
  "Solid skeleton. Two correctness issues, one perf footgun, and a couple of senior-engineer nits.";

const REVIEW_ITEMS: ReviewItem[] = [
  {
    type:  'CRITICAL',
    title: "Race condition on 'pending' set",
    line:  14,
    body:  "Two concurrent calls mutate 'pending' without a lock. Use a 'Map(string, Promise)' to coalesce in-flight work instead.",
  },
  {
    type:  'WARNING',
    title: 'Silent fallthrough on parse error',
    line:  22,
    body:  "'JSON.parse' throws on malformed input — caller assumes an empty object. Wrap in try/catch and surface the failure.",
  },
  {
    type:  'WARNING',
    title: 'O(n²) on large arrays',
    line:  33,
    body:  "'includes' inside 'map' makes this quadratic. Build a Set once, then probe.",
  },
  {
    type:  'NOTE',
    title: "Prefer 'readonly' for the input",
    line:  8,
    body:  "'ids' is never mutated — mark it 'readonly string[]' so callers can pass tuples.",
  },
];

const EXPLAIN_TEXT = [
  "This module exports three standalone utilities.",
  "fetchAll<T> batch-fetches IDs with a caller-supplied Fetcher. It deduplicates via a Set but runs requests sequentially — each await blocks the next iteration. A Promise.all over deduplicated IDs would be significantly faster under concurrent load.",
  "parseConfig parses a raw JSON string into a config struct. It assumes JSON.parse will succeed and that all keys are present. Neither assumption is safe in production.",
  "findDuplicates returns elements of a that also appear in b. Calling b.includes inside Array.map is O(n²) — building a Set from b first reduces this to O(n).",
];

const REFACTOR_CODE = `// fetchAll.ts — refactored
import type { Item } from './types';

interface Fetcher<T> {
  (id: string): Promise<T>;
}

export async function fetchAll<T>(
  ids: readonly string[],
  fetcher: Fetcher<T>
): Promise<Record<string, T>> {
  const unique = [...new Set(ids)];
  const entries = await Promise.all(
    unique.map(async id => [id, await fetcher(id)] as const)
  );
  return Object.fromEntries(entries);
}

export function parseConfig(raw: string) {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch { throw new Error(\`Invalid config: \${raw.slice(0, 40)}\`); }

  const cfg = parsed as Record<string, unknown>;
  return {
    retries: typeof cfg.retries === 'number' ? cfg.retries : 3,
    timeout: parseInt(String(cfg.timeout ?? '5000'), 10),
    hosts:   Array.isArray(cfg.hosts) ? (cfg.hosts as string[]) : [],
  };
}

export function findDuplicates(a: string[], b: string[]) {
  const setB = new Set(b);
  return a.filter(x => setB.has(x));
}`;

// ── Severity badge + border colours ──────────────────────────────

const SEVERITY_STYLES: Record<Severity, { badge: string; borderColor: string }> = {
  CRITICAL: { badge: 'bg-danger   text-bg',           borderColor: 'var(--color-danger)' },
  WARNING:  { badge: 'bg-accent   text-bg',           borderColor: 'var(--color-accent)' },
  NOTE:     { badge: 'border border-muted text-muted', borderColor: 'var(--color-muted)'  },
};

// ── Small reusable sub-components ─────────────────────────────────

function ReviewCard({ item }: { item: ReviewItem }) {
  const { badge, borderColor } = SEVERITY_STYLES[item.type];
  return (
    <div
      className="border border-border bg-card rounded-sm p-4"
      style={{ borderLeftWidth: '2px', borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${badge}`}>
            {item.type}
          </span>
          <span className="text-xs font-semibold">{item.title}</span>
        </div>
        <span className="text-[10px] text-muted shrink-0">L{item.line}</span>
      </div>
      <p className="text-xs text-muted leading-relaxed">{item.body}</p>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="flex gap-1.5">
        {[0, 150, 300].map(delay => (
          <div
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted">Analyzing with claude...</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function DemoWorkspace() {
  const [code,        setCode]        = useState(DEMO_CODE);
  const [reviewState, setReviewState] = useState<ReviewState>('complete');
  const [activeTab,   setActiveTab]   = useState<ActiveTab>('review');
  const [cursorLine,  setCursorLine]  = useState(1);
  const [cursorCol,   setCursorCol]   = useState(1);
  const [showPrompt,  setShowPrompt]  = useState(false);

  const lines     = code.split('\n');
  const bugCount  = REVIEW_ITEMS.filter(i => i.type !== 'NOTE').length;

  function runReview() {
    setReviewState('loading');
    setActiveTab('review');
    setTimeout(() => setReviewState('complete'), 1800);
  }

  // Tracks cursor position for the status bar
  function updateCursor(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const ta     = e.currentTarget;
    const before = ta.value.slice(0, ta.selectionStart ?? 0);
    const ls     = before.split('\n');
    setCursorLine(ls.length);
    setCursorCol((ls[ls.length - 1]?.length ?? 0) + 1);
  }

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'review',   label: 'REVIEW'   },
    { id: 'explain',  label: 'EXPLAIN'  },
    { id: 'bugs',     label: 'BUGS'     },
    { id: 'refactor', label: 'REFACTOR' },
  ];

  return (
    // h-screen + overflow-hidden pins the whole UI to the viewport
    <div className="flex flex-col h-screen bg-bg text-[#e2e8e2] font-mono overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-4 h-11 border-b border-border bg-surface">

        <div className="flex items-center gap-4">
          <Link href="/" className="text-accent font-bold text-sm whitespace-nowrap">
            <span className="text-muted mr-0.5">&gt;</span> revactor.
          </Link>
          <span className="text-muted text-xs hidden sm:block">
            untitled /{' '}
            <span className="text-[#e2e8e2]">fetchAll.ts</span>
            {' '}· unsaved
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select className="bg-card border border-border text-xs text-muted px-2 py-1 rounded-sm outline-none cursor-pointer">
            <option>typescript</option>
            <option>javascript</option>
            <option>python</option>
            <option>go</option>
            <option>rust</option>
          </select>

          <button className="text-xs border border-border text-muted px-3 py-1 rounded-sm hover:text-[#e2e8e2] hover:border-muted transition-colors">
            UPLOAD
          </button>
          <button
            onClick={() => setShowPrompt(true)}
            className="text-xs border border-border text-muted px-3 py-1 rounded-sm hover:text-[#e2e8e2] hover:border-muted transition-colors"
          >
            PROMPT
          </button>

          {/* Primary CTA — triggers the review */}
          <button
            onClick={runReview}
            disabled={reviewState === 'loading'}
            className="flex items-center gap-1.5 text-xs bg-accent text-bg font-bold px-4 py-1 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            REVIEW CODE
            <span className="text-[9px] opacity-60 font-normal">⌘↵</span>
          </button>
        </div>
      </header>

      {/* ── Main split: editor | review ────────────────────────── */}
      <div className="flex flex-1 min-h-0 divide-x divide-border">

        {/* ── Left: code editor ─── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* File tab strip */}
          <div className="shrink-0 flex items-center justify-between px-4 h-9 border-b border-border bg-surface">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs">fetchAll.ts</span>
            </div>
            <span className="text-[10px] text-muted">
              {lines.length} lines · {code.length} chars
            </span>
          </div>

          {/* Editor: line numbers + textarea */}
          <div className="flex flex-1 overflow-auto min-h-0">

            {/* Line numbers — non-selectable, syncs with textarea rows */}
            <div className="shrink-0 bg-surface border-r border-border px-3 pt-4 pb-4 text-right text-muted text-xs leading-6 select-none">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/*
              The textarea sits directly next to the line numbers.
              bg-transparent makes the surface colour show through.
              whitespace-pre preserves indentation — critical for code.
            */}
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyUp={updateCursor}
              onClick={updateCursor}
              className="flex-1 bg-transparent text-xs leading-6 px-4 pt-4 pb-4 outline-none resize-none text-[#e2e8e2] whitespace-pre"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>

        {/* ── Right: review panel ─── */}
        <div className="flex flex-col w-115 shrink-0 min-h-0">

          {/* Tab bar */}
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-surface">
            <div className="flex">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 h-9 text-xs font-bold tracking-wider transition-colors ${
                    activeTab === id
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-muted hover:text-[#e2e8e2]'
                  }`}
                >
                  {label}
                  {id === 'bugs' && (
                    <span className="ml-1.5 bg-danger text-bg text-[9px] font-bold px-1 py-0.5 rounded-sm">
                      {bugCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 pr-3">
              <button
                onClick={() => setShowPrompt(true)}
                className="text-[10px] text-muted border border-border px-2 py-0.5 rounded-sm hover:text-[#e2e8e2] transition-colors"
              >
                PROMPT
              </button>
              <button className="text-[10px] text-muted border border-border px-2 py-0.5 rounded-sm hover:text-[#e2e8e2] transition-colors">
                EXPORT
              </button>
            </div>
          </div>

          {/* Review content — scrolls independently */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4">
            {reviewState === 'loading' ? (
              <LoadingDots />
            ) : reviewState === 'idle' ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted text-xs">Click REVIEW CODE to analyse your file.</p>
              </div>
            ) : (
              <div className="space-y-3">

                {/* Run metadata row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-sm border text-success"
                      style={{ borderColor: 'var(--color-success)', backgroundColor: 'rgba(74,222,128,0.1)' }}
                    >
                      COMPLETE
                    </span>
                    <span className="text-[10px] text-muted">claude · 1,247 tok · 2.1s</span>
                  </div>
                  <button
                    onClick={runReview}
                    className="text-[10px] text-muted border border-border px-2 py-0.5 rounded-sm hover:text-[#e2e8e2] transition-colors"
                  >
                    ↺ RE-RUN
                  </button>
                </div>

                {/* REVIEW tab */}
                {activeTab === 'review' && (
                  <>
                    <div className="bg-card border border-border rounded-sm p-4">
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Summary</p>
                      <p className="text-xs leading-relaxed">{REVIEW_SUMMARY}</p>
                    </div>
                    {REVIEW_ITEMS.map(item => (
                      <ReviewCard key={item.title} item={item} />
                    ))}
                  </>
                )}

                {/* EXPLAIN tab */}
                {activeTab === 'explain' && (
                  <div className="bg-card border border-border rounded-sm p-4 space-y-3">
                    <p className="text-[10px] text-muted uppercase tracking-wider">Explanation</p>
                    {EXPLAIN_TEXT.map((para, i) => (
                      <p key={i} className="text-xs text-muted leading-relaxed">{para}</p>
                    ))}
                  </div>
                )}

                {/* BUGS tab — critical + warnings only */}
                {activeTab === 'bugs' && (
                  <>
                    <div className="bg-card border border-border rounded-sm p-4">
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Summary</p>
                      <p className="text-xs leading-relaxed">
                        {bugCount} issues require attention before shipping.
                      </p>
                    </div>
                    {REVIEW_ITEMS.filter(i => i.type !== 'NOTE').map(item => (
                      <ReviewCard key={item.title} item={item} />
                    ))}
                  </>
                )}

                {/* REFACTOR tab */}
                {activeTab === 'refactor' && (
                  <div className="bg-card border border-border rounded-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                      <p className="text-[10px] text-muted uppercase tracking-wider">Suggested refactor</p>
                      <span className="text-[10px] text-success">&minus;8 lines</span>
                    </div>
                    <pre className="text-xs text-[#e2e8e2] leading-6 p-4 overflow-x-auto">{REFACTOR_CODE}</pre>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────── */}
      <footer className="shrink-0 flex items-center justify-between px-4 h-6 bg-surface border-t border-border text-[10px] text-muted">
        <div className="flex items-center gap-3">
          <span><span className="text-success">●</span> connected</span>
          <span>claude</span>
        </div>
        <div className="flex items-center gap-3">
          <span>L{cursorLine} : C{cursorCol}</span>
          <span>UTF-8</span>
          <span>spaces: 2</span>
        </div>
      </footer>

      {/* ── Prompt inspector modal ──────────────────────────────── */}
      {showPrompt && (
        <PromptInspector
          onClose={() => setShowPrompt(false)}
          onReRun={() => { setShowPrompt(false); runReview(); }}
        />
      )}

    </div>
  );
}
