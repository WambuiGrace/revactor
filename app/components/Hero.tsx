/*
  Step 4: Hero section.
  Two columns: headline + CTAs on the left, a fake terminal on the right.
  The terminal uses <pre> with coloured <span>s — no third-party syntax
  library needed for a static mockup.
*/
import Link from "next/link";

/* ── Terminal mockup ────────────────────────────────────────── */

const codeLines = [
  { text: "// auth/login.ts",                     color: "text-muted" },
  { text: 'import { z }  from "zod"',             color: "text-[#e2e8e2]" },
  { text: 'import { db } from "@/lib/db"',        color: "text-[#e2e8e2]" },
  { text: "",                                      color: "" },
  { text: "export async function loginUser(",      color: "text-[#e2e8e2]" },
  { text: "  email: string,",                      color: "text-[#e2e8e2]" },
  { text: "  pass:  string",                       color: "text-[#e2e8e2]" },
  { text: ") {",                                   color: "text-[#e2e8e2]" },
  { text: "  const sql = `SELECT * FROM users",    color: "text-danger/80 bg-danger/10" },
  { text: "    WHERE email = '${email}'`",         color: "text-danger/80 bg-danger/10" },
  { text: "  const user = await db.raw(sql)",      color: "text-[#e2e8e2]" },
  { text: "  return user?.data",                   color: "text-[#e2e8e2]" },
  { text: "}",                                     color: "text-[#e2e8e2]" },
];

function TerminalMockup() {
  return (
    <div className="rounded-md border border-border bg-surface overflow-hidden text-xs font-mono shadow-2xl">

      {/* Window chrome — the three coloured dots */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-card border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-4 text-muted text-[10px] tracking-wide">
          revactor.dev/review — auth/login.ts
        </span>
      </div>

      {/* Code panel + review panel side-by-side */}
      <div className="flex divide-x divide-border">

        {/* Left: code with line numbers */}
        <div className="flex-1 p-4 leading-6 overflow-x-auto">
          {codeLines.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-muted select-none w-4 shrink-0 text-right">
                {line.text ? i + 1 : ""}
              </span>
              <span className={`${line.color} whitespace-pre`}>{line.text}</span>
            </div>
          ))}
        </div>

        {/* Right: AI review annotations */}
        <div className="w-44 shrink-0 p-4 leading-5 text-[11px] space-y-4">
          <div>
            <p className="text-danger font-bold mb-1">[ERRORS]  1</p>
            <p className="text-muted">
              <span className="text-[#e2e8e2]">⚠ Lines 9–10</span>
              <br />
              SQL injection via template literal. Use parameterised queries.
            </p>
          </div>
          <div>
            <p className="text-accent font-bold mb-1">[WARNINGS] 1</p>
            <p className="text-muted">
              <span className="text-[#e2e8e2]">• Line 6</span>
              <br />
              Missing email validation. Run zod.parse() before querying.
            </p>
          </div>
          <div className="pt-2 border-t border-border text-muted">
            <span className="text-success">✓</span> 8 lines clean
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Hero section ───────────────────────────────────────────── */

export default function Hero() {
  return (
    <section className="container py-20 lg:py-28">
      <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

        {/* Left column: headline, subtitle, CTAs */}
        <div className="flex-1 max-w-xl">

          {/* Version badge
          <span className="inline-flex items-center gap-2 text-xs border border-border text-muted px-3 py-1 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            v0.4 — PUBLIC BETA
          </span> */}

          {/* Main headline — note the last line is accent-coloured */}
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight uppercase mb-6">
            AI Code Review<br />
            That Thinks Like<br />
            A<br />
            <span className="text-accent">Senior Engineer.</span>
          </h1>

          <p className="text-muted text-sm leading-relaxed mb-8 max-w-md">
            Instantly review, explain, debug, and refactor code with Claude.
            Catch the bugs your team&apos;s already tired of finding.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Link
              href="/demo"
              className="bg-accent text-bg font-bold text-sm px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            <Link
              href="#"
              className="border border-border text-sm text-[#e2e8e2] px-5 py-2.5 rounded-sm hover:border-muted transition-colors"
            >
              View on GitHub &rarr;
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-muted text-xs">
            <span className="text-[#e2e8e2]">dev reviewing</span>
            &nbsp;&middot;&nbsp;
            no signup. no wait.
          </p>
        </div>

        {/* Right column: terminal mockup */}
        <div className="w-full lg:flex-1">
          <TerminalMockup />
        </div>

      </div>
    </section>
  );
}
