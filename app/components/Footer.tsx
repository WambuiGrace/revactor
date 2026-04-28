/*
  Step 7: Footer.
  Left: brand + copyright.  Right: three link columns.
  Using the same data-array pattern as Features keeps it easy to extend.
*/
import Link from "next/link";

const columns = [
  {
    heading: "Product",
    links: ["home", "pricing", "docs", "status"],
  },
  {
    heading: "Open Source",
    links: ["api", "cli", "github", "discord"],
  },
  {
    heading: "Legal",
    links: ["terms", "privacy", "dpa", "security"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">

          {/* Brand block */}
          <div className="flex-1 max-w-xs">
            <p className="text-accent font-bold mb-2">
              <span className="text-muted mr-1">&gt;</span> revactor
            </p>
            <p className="text-muted text-xs leading-relaxed mb-4">
              AI code review for teams that ship.
            </p>
            <p className="text-muted text-[11px]">&copy; 2024 revactor.</p>
          </div>

          {/* Link columns */}
          <div className="flex gap-10 md:gap-16">
            {columns.map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-[11px] text-[#e2e8e2] font-bold tracking-wider mb-3">
                  {heading}
                </p>
                <ul className="space-y-2 list-none">
                  {links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-xs text-muted hover:text-[#e2e8e2] transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
