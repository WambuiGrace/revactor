/*
  Step 3: Navbar — Server Component (no "use client" needed).
  In the App Router, components are Server Components by default.
  We only add "use client" when we need browser APIs or React hooks.
*/
import Link from "next/link";

const navLinks = [
  { label: "product",   href: "#" },
  { label: "pricing",   href: "#" },
  { label: "docs",      href: "#" },
  { label: "changelog", href: "#" },
];

export default function Navbar() {
  return (
    <header className="border-b border-border">
      <nav className="container flex items-center justify-between py-4">

        {/* Logo */}
        <Link href="/" className="text-accent font-bold text-base tracking-tight">
          <span className="text-muted mr-1">&gt;</span> revactor
        </Link>

        {/* Centre links — hidden on small screens */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted list-none">
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="hover:text-[#e2e8e2] transition-colors duration-150">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="text-sm text-muted hover:text-[#e2e8e2] transition-colors px-3 py-1.5"
          >
            log in
          </Link>
          <Link
            href="#"
            className="text-sm bg-accent text-bg font-bold px-4 py-1.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            get free
          </Link>
        </div>

      </nav>
    </header>
  );
}
