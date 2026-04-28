/*
  Step 5: Features section — "Three primitives".
  Driving the cards from a data array keeps the JSX minimal.
  Each feature only needs an icon (inline SVG), title, body, and link.
*/
import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Review Code",
    body:  "Review local feedback in under three seconds. Filled line numbers, severity tags, and context hints — never again.",
    href:  "#",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Explain Logic",
    body:  "Point to legacy code, get a step-by-step breakdown. Each line explained against its original context — no guessing.",
    href:  "#",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Refactor Cleanly",
    body:  "Get a refactor with fewer lines. Pattern-match across the PR. After you review it, you can actually think.",
    href:  "#",
  },
];

export default function Features() {
  return (
    <section className="border-t border-border py-20 lg:py-28">
      <div className="container">

        {/* Section label — code-comment style */}
        <p className="text-muted text-xs mb-4">// HOW IT WORKS</p>

        <h2 className="text-2xl lg:text-3xl font-bold mb-12 max-w-sm">
          Three primitives.{" "}
          <span className="text-muted">Composed however you want.</span>
        </h2>

        {/* Card grid — 1 col on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map(({ icon, title, body, href }) => (
            <article
              key={title}
              className="border border-border bg-card rounded-sm p-6 flex flex-col gap-4"
            >
              {/* Icon */}
              <span className="text-accent">{icon}</span>

              <div className="flex-1">
                <h3 className="font-bold text-sm mb-2">{title}</h3>
                <p className="text-muted text-xs leading-relaxed">{body}</p>
              </div>

              {/* Card CTA */}
              {/* <Link
                href={href}
                className="text-xs text-accent hover:underline mt-auto"
              >
                learn more &rarr;
              </Link> */}
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
