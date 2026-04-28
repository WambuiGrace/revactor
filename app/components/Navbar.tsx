/*
  Step 3: Navbar — Server Component (no "use client" needed).
  In the App Router, components are Server Components by default.
  We only add "use client" when we need browser APIs or React hooks.
*/
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-border">
      <nav className="container flex items-center justify-between py-4">

        {/* Logo */}
        <Link href="/" className="text-accent font-bold text-base tracking-tight">
          <span className="text-muted mr-1">&gt;</span> revactor
        </Link>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="text-sm bg-accent text-bg font-bold px-4 py-1.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>

      </nav>
    </header>
  );
}
