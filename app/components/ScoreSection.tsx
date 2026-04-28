/*
  Step 6: Score section — "Every review comes with receipts."
  Three columns: description | circular gauge | metric grid.

  The .score-ring class (in globals.css) uses conic-gradient:
    77% filled  →  7.7 / 10 score
  The inner circle is a plain dark div overlaid to fake a donut shape.
*/

const metrics = [
  { label: "OVERALL",         value: "8.4", trend: "up"   },
  { label: "RELEVANCE",       value: "7.1", trend: "down" },
  { label: "MAINTAINABILITY", value: "9.0", trend: "up"   },
  { label: "QUALITY",         value: "6.8", trend: "down" },
];

function TrendArrow({ direction }: { direction: "up" | "down" }) {
  return direction === "up" ? (
    <span className="text-success text-xs">&#x2191;</span>
  ) : (
    <span className="text-danger text-xs">&#x2193;</span>
  );
}

export default function ScoreSection() {
  return (
    <section className="border-t border-border py-20 lg:py-28">
      <div className="container">

        {/* Section label */}
        <p className="text-muted text-xs mb-4">// ANALYSIS SCORES</p>

        {/* Three-column layout */}
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

          {/* Column 1: description */}
          <div className="flex-1 max-w-xs">
            <h2 className="text-2xl font-bold mb-4">
              Every review comes with receipts.
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              Each analysis generates a shareable score card with line-level
              citations. Share the file so your whole team can view the
              reference at any time — no context lost in Slack threads.
            </p>
          </div>

          {/* Column 2: circular gauge */}
          <div className="flex flex-col items-center gap-3">
            {/*
              Outer ring: conic-gradient fills 77% in accent colour.
              Inner circle: same bg as page, creates the donut effect.
            */}
            <div className="score-ring w-36 h-36 flex items-center justify-center">
              <div
                className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
                style={{ backgroundColor: "var(--color-bg)" }}
              >
                <span className="text-2xl font-bold text-accent">7.7</span>
                <span className="text-[10px] text-muted">/10</span>
              </div>
            </div>
            <span className="text-xs text-muted tracking-widest uppercase">maintaining</span>
          </div>

          {/* Column 3: 2×2 metric grid */}
          <div className="grid grid-cols-2 gap-3">
            {metrics.map(({ label, value, trend }) => (
              <div
                key={label}
                className="border border-border bg-card rounded-sm px-4 py-3 min-w-[120px]"
              >
                <p className="text-[10px] text-muted tracking-wider mb-1">{label}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold">{value}</span>
                  <TrendArrow direction={trend as "up" | "down"} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
