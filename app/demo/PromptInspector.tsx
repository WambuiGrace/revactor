'use client';

/*
  PromptInspector — modal that reveals the exact prompt sent to Claude.
  Opened by either PROMPT button in DemoWorkspace.

  Concepts shown here:
  • Controlled modal: parent passes onClose, this component doesn't manage
    its own visibility (single source of truth stays in DemoWorkspace).
  • Click-outside-to-close: compare e.target === e.currentTarget on the overlay.
  • Clipboard API: navigator.clipboard.writeText (browser-only, hence "use client").
  • Simple syntax colouring without a library: classify each line by its first char.
*/

import { useState } from 'react';

// ── Props ──────────────────────────────────────────────────────────

interface Props {
  onClose:  () => void;
  onReRun:  () => void;  // "EDIT & RE-RUN" closes modal then triggers a review
}

// ── The prompt text that would be sent to Claude ───────────────────

const PROMPT_TEXT = `<system>
You are a senior staff engineer reviewing TypeScript. Be specific, cite line numbers, prefer correctness > performance > style. Output findings as { severity, line, title, body }. No filler.
</system>

<context language="typescript" path="src/util/fetchAll.ts">
// fetchAll.ts — batch fetch with cache
import type { Item } from './types';

interface Fetcher<T> {
  (id: string): Promise<T>;
}

export async function fetchAll<T>(
  ids: string[],
  fetcher: Fetcher<T>
): Promise<Record<string, T>> {
  const pending = new Set<string>();
–
</context>

<task>
Identify bugs and code smells. Suggest a refactor that preserves behavior. Score readability, performance, maintainability, security on a 0-10 scale. Be willing to disagree with the author.
</task>`;

// ── Syntax colouring ───────────────────────────────────────────────

/*
  Three categories:
    tag      — lines starting with <   → accent (amber)
    truncated — the "–" ellipsis line  → muted
    content   — everything else        → light text
*/
type LineKind = 'tag' | 'truncated' | 'content';

function classifyLine(line: string): LineKind {
  if (line.startsWith('<'))    return 'tag';
  if (line === '–' || line === '-') return 'truncated';
  return 'content';
}

const KIND_CLASS: Record<LineKind, string> = {
  tag:       'text-accent',
  truncated: 'text-muted',
  content:   'text-[#e2e8e2]',
};

// ── Component ──────────────────────────────────────────────────────

export default function PromptInspector({ onClose, onReRun }: Props) {
  const [copied, setCopied] = useState(false);
  const [saved,  setSaved]  = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(PROMPT_TEXT).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleSavePreset() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleEditAndReRun() {
    onClose();
    onReRun();
  }

  const lines = PROMPT_TEXT.split('\n');

  return (
    /*
      Fixed overlay — bg-black/60 dims the workspace behind the modal.
      onClick on the overlay itself (not children) triggers close.
    */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div className="w-full max-w-xl bg-surface border border-border rounded-sm flex flex-col max-h-[85vh] shadow-2xl">

        {/* ── Header ── */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Brand mark */}
            <span className="text-accent font-bold text-sm leading-none">
              <span className="text-muted">&gt;</span> R
            </span>
            <span className="text-muted text-xs">Prompt inspector</span>
            {/* Model badge */}
            <span className="bg-card border border-border text-accent text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wide">
              CLAUDE-HAIKU-4.5
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-[10px] border border-border text-muted px-2.5 py-1 rounded-sm hover:text-[#e2e8e2] hover:border-muted transition-colors min-w-[52px] text-center"
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
            {/* Close button — × */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-6 h-6 flex items-center justify-center border border-border text-muted hover:text-[#e2e8e2] hover:border-muted rounded-sm transition-colors text-sm leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* ── Prompt content (scrollable) ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 font-mono text-xs leading-6">
          {lines.map((line, i) => {
            const kind = classifyLine(line);
            return (
              /*
                Non-breaking space on empty lines prevents the div from
                collapsing to zero height, which would break visual spacing.
              */
              <div key={i} className={KIND_CLASS[kind]}>
                {line || ' '}
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-border">
          {/* Token / cost stats */}
          <span className="text-[10px] text-muted">
            input: 312 tok &middot; output: 988 tok &middot; cost: $0.0042
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEditAndReRun}
              className="text-[10px] border border-border text-muted px-3 py-1 rounded-sm hover:text-[#e2e8e2] hover:border-muted transition-colors"
            >
              EDIT &amp; RE-RUN
            </button>
            <button
              onClick={handleSavePreset}
              className="text-[10px] bg-accent text-bg font-bold px-3 py-1 rounded-sm hover:opacity-90 transition-opacity min-w-[84px] text-center"
            >
              {saved ? 'SAVED!' : 'SAVE PRESET'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
