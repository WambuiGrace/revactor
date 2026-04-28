/*
  /report — quality report page. Fully static, so it's a Server Component
  (no "use client" needed). All rendering happens on the server; the SVG
  maths run at request time, not in the browser.

  Key concepts:
  • SVG circular gauge — two <circle> elements: track + progress arc.
    strokeDasharray / strokeDashoffset control how much of the arc is visible.
    A <filter> with feGaussianBlur adds the glow around the amber arc.
  • SVG area chart — a <path> for the filled area, another for the line,
    and <circle> dots. A linearGradient gives the purple fade-out fill.
  • Smooth bezier line — cubic C commands via control points at mid-x,
    which avoids the jagged look of straight L segments.
*/

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'fetchAll.ts — Quality Report · revactor',
};

// ── Data ──────────────────────────────────────────────────────────

const OVERALL    = 7.7;
const REVIEW_ID  = '#R-K9A2X';

const METRICS = [
  { label: 'Readability',     score: 8.4, delta: +0.6, note: 'clear naming, low cognitive load',  color: '#4ade80' },
  { label: 'Performance',     score: 7.1, delta: -0.2, note: 'one O(n²) hot path · L31',          color: '#f59e0b' },
  { label: 'Maintainability', score: 9.0, delta: +1.1, note: 'small, focused, well-typed',         color: '#4ade80' },
  { label: 'Security',        score: 6.5, delta: +0.4, note: 'unvalidated JSON.parse · L22',       color: '#d4a420' },
];

const TREND = [7.3, 7.2, 7.4, 7.3, 7.5, 7.4, 7.5, 7.6, 7.5, 7.6, 7.7, 7.7];

// ── Circular gauge ────────────────────────────────────────────────

/*
  The gauge is a 140×140 SVG viewBox.
  The ring sits at cx=70 cy=70 with r=52 and strokeWidth=10.
  circumference  = 2 × π × r  ≈ 326.7 px
  strokeDashoffset controls the "gap" — we leave (1 - score/10) of the
  circumference unfilled.
  rotate(-90) moves the start of the arc to the 12-o'clock position.
*/
function CircularGauge({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;           // ≈ 326.7
  const offset = circ * (1 - score / 10); // gap length

  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg
        width="144" height="144"
        viewBox="0 0 144 144"
        className="absolute inset-0"
        aria-hidden="true"
      >
        <defs>
          {/* Glow: blur a copy of the amber arc and merge it under the sharp copy */}
          <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx="72" cy="72" r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="10"
        />

        {/* Progress arc — amber with glow */}
        <circle
          cx="72" cy="72" r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 72 72)"
          filter="url(#arcGlow)"
        />
      </svg>

      {/* Score text, centred over the SVG */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl font-bold text-accent leading-none">{score}</span>
          <span className="text-sm text-muted">/10</span>
        </div>
        <span className="text-[10px] text-[#e2e8e2] uppercase tracking-widest">OVERALL</span>
        <span className="text-[9px] text-muted">weighted average</span>
      </div>
    </div>
  );
}

// ── Metric row ────────────────────────────────────────────────────

function MetricRow({
  label, score, delta, note, color,
}: {
  label: string; score: number; delta: number; note: string; color: string;
}) {
  const pct = `${score * 10}%`;
  const up  = delta >= 0;

  return (
    <div className="grid grid-cols-[120px_48px_1fr_48px] items-center gap-4">
      {/* Label */}
      <span className="text-xs text-[#e2e8e2]">{label}</span>

      {/* Score */}
      <span className="text-sm font-bold text-right" style={{ color }}>{score}</span>

      {/* Bar + note */}
      <div className="flex flex-col gap-1">
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: pct, backgroundColor: color }}
          />
        </div>
        <span className="text-[10px] text-muted">{note}</span>
      </div>

      {/* Delta */}
      <span
        className="text-[11px] font-bold text-right"
        style={{ color: up ? 'var(--color-success)' : 'var(--color-danger)' }}
      >
        {up ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
      </span>
    </div>
  );
}

// ── Trend chart ───────────────────────────────────────────────────

/*
  Pure SVG area chart — no library needed for this simple case.
  The line uses cubic bezier (C command) with mid-point control handles,
  which smooths out the kinks between segments naturally.
*/
function TrendChart({ data }: { data: number[] }) {
  const W = 800, H = 90;
  const padX = 8, padY = 12;

  // Y domain — a little breathing room above and below the data range
  const minV = 7.0, maxV = 8.0;

  const toX = (i: number) =>
    padX + (i / (data.length - 1)) * (W - padX * 2);
  const toY = (v: number) =>
    H - padY - ((v - minV) / (maxV - minV)) * (H - padY * 2);

  const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }));

  // Smooth cubic bezier line: control points sit at the horizontal midpoint
  const lineD = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const mx   = (prev.x + p.x) / 2;
      return `C ${mx} ${prev.y} ${mx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(' ');

  // Area: trace the line, drop to the bottom, close back to start
  const areaD = `${lineD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  const last = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: '90px' }}
      aria-label="Score trend over last 12 reviews"
    >
      <defs>
        {/* Purple-to-transparent gradient fills the area below the line */}
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"    />
        </linearGradient>

        {/* Subtle glow on the line itself */}
        <filter id="lineGlow" x="-10%" y="-100%" width="120%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Filled area */}
      <path d={areaD} fill="url(#areaFill)" />

      {/* Line */}
      <path
        d={lineD}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        filter="url(#lineGlow)"
      />

      {/* Data-point dots */}
      {pts.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--color-accent)" />
      ))}

      {/* Terminal dot — slightly larger to emphasise current position */}
      <circle cx={last.x} cy={last.y} r="5" fill="var(--color-accent)" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function ReportPage() {
  const trendDelta = (TREND[TREND.length - 1] - TREND[0]).toFixed(1);

  return (
    <div className="min-h-screen bg-bg font-mono text-[#e2e8e2] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Page header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* Review reference */}
            <p className="text-muted text-xs mb-2">
              <Link href="/demo" className="hover:text-[#e2e8e2] transition-colors">
                // REVIEW
              </Link>
              {' · '}
              <span className="text-accent">{REVIEW_ID}</span>
            </p>

            {/* Filename + report label */}
            <h1 className="text-2xl font-bold mb-1">
              <span className="text-success">fetchAll.ts</span>
              <span className="text-muted font-normal"> · </span>
              <span className="text-muted font-normal italic">quality report</span>
            </h1>

            {/* File meta */}
            <p className="text-muted text-xs">
              48 LOC · typescript · reviewed 2.1s ago
            </p>
          </div>

          {/* Status badge */}
          <span className="shrink-0 text-xs border border-accent text-accent font-bold px-3 py-1 rounded-sm">
            COMPLETE
          </span>
        </div>

        {/* ── Score card ───────────────────────────────────────── */}
        <div className="border border-border bg-surface rounded-sm p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

            {/* Left: circular gauge */}
            <CircularGauge score={OVERALL} />

            {/* Right: metric rows */}
            <div className="flex-1 min-w-0 space-y-4 w-full">
              {METRICS.map(m => (
                <MetricRow key={m.label} {...m} />
              ))}
            </div>

          </div>
        </div>

        {/* ── Trend chart card ─────────────────────────────────── */}
        <div className="border border-border bg-surface rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted text-[10px] uppercase tracking-widest">
              Trend · last 12 reviews
            </p>
            <p className="text-[10px] text-success">
              ↑ {trendDelta} over baseline
            </p>
          </div>

          <TrendChart data={TREND} />
        </div>

        {/* ── Back link ────────────────────────────────────────── */}
        <div className="pt-2">
          <Link
            href="/demo"
            className="text-xs text-muted hover:text-[#e2e8e2] transition-colors"
          >
            ← back to workspace
          </Link>
        </div>

      </div>
    </div>
  );
}
