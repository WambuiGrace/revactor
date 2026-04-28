# Building revactor — An AI Code Review App with Next.js and TailwindCSS v4

## 1. Title & Objective

**Technology chosen:** Next.js 16 (App Router) + TailwindCSS v4 + TypeScript

**Why these?**
Next.js was chosen because it provides server-side rendering and the App Router model out of the box — meaning pages load fast and SEO works without extra configuration. TailwindCSS v4 was chosen because it removes config boilerplate (no `tailwind.config.js`) and lets you define design tokens directly in CSS via `@theme`, which keeps styling co-located and readable.

**End goal:** A fully styled, multi-page AI code review product — a landing page with hero, features, and score sections, plus an interactive demo workspace where users can paste code and see simulated AI review feedback.

---

## 2. Quick Summary of the Technology

### Next.js
Next.js is a React framework built by Vercel that adds routing, server rendering, and production optimisations on top of React. With the App Router (introduced in Next.js 13), every file inside `app/` is a **Server Component** by default — meaning it renders on the server and ships zero client-side JS unless you opt in with `"use client"`.

**Used everywhere:** Vercel (the company behind it) runs Next.js in production. Companies like Hulu, TikTok, and GitHub's Copilot dashboard use it.

### TailwindCSS v4
TailwindCSS is a utility-first CSS framework. Instead of writing `.card { padding: 1rem; border-radius: 4px; }` in a separate file, you write `className="p-4 rounded"` directly in your JSX. Version 4 replaces the JavaScript config file with a CSS-native `@theme` block, and replaces `@tailwind base/components/utilities` directives with a single `@import "tailwindcss"`.

**Used everywhere:** Stripe, GitHub, Shopify, and most modern SaaS dashboards use TailwindCSS for their UIs.

---

## 3. System Requirements

| Requirement | Version |
|---|---|
| OS | Windows 10/11, macOS 12+, or Linux |
| Node.js | 20+ (LTS recommended) |
| Package manager | pnpm 9+ (this project uses pnpm) |
| Editor | VS Code (recommended) with the Tailwind CSS IntelliSense extension |

> **Why pnpm?** pnpm uses a content-addressable store so `node_modules` is smaller and installs are faster than npm. It is the package manager this project was scaffolded with.

---

## 4. Installation & Setup Instructions

### Step 1 — Clone the repository

```bash
git clone https://github.com/WambuiGrace/revactor.git
cd revactor
```

### Step 2 — Install dependencies

```bash
pnpm install
```

Expected output:
```
Packages: +312
Progress: resolved 312, reused 310, downloaded 2, added 312
Done in 4.2s
```

### Step 3 — Start the development server

```bash
pnpm dev
```

Expected output:
```
  ▲ Next.js 16.2.4
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 1842ms
```

### Step 4 — Open the app

Navigate to `http://localhost:3000` in your browser. You should see the revactor landing page with a dark green theme, hero section, and feature cards.

### How TailwindCSS v4 is wired up

Unlike v3, there is **no `tailwind.config.js`**. Instead:

1. `postcss.config.mjs` loads the Tailwind PostCSS plugin:
```js
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

2. `app/globals.css` imports Tailwind and defines all design tokens in a single `@theme` block:
```css
/* replaces the old @tailwind base/components/utilities */
@import "tailwindcss";

@theme {
  --color-accent:  #d4a420;   /* maps to bg-accent, text-accent, etc. */
  --color-border:  #1e3020;   /* maps to border-border */
  --color-muted:   #5a7058;   /* maps to text-muted */
  --color-danger:  #f87171;
  --color-success: #4ade80;
}
```

---

## 5. Minimal Working Example

### What it does
The `Hero` component renders the landing page headline alongside a terminal mockup that shows a code snippet with AI review annotations (SQL injection warning, missing validation notice). It uses only Tailwind utility classes — no external component library.

### Code (simplified)

```tsx
// app/components/Hero.tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="container py-20">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* Left: headline and CTAs */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold uppercase mb-6">
            AI Code Review<br />
            <span className="text-accent">That Thinks Like A Senior Engineer.</span>
          </h1>
          <Link
            href="/demo"
            className="bg-accent text-bg font-bold px-5 py-2.5 rounded-sm"
          >
            Try the demo →
          </Link>
        </div>

        {/* Right: terminal mockup (bg-surface, border-border, text-danger) */}
        <div className="flex-1 rounded-md border border-border bg-surface font-mono text-xs p-4">
          <p className="text-danger/80">⚠ SQL injection via template literal.</p>
          <p className="text-muted">Use parameterised queries instead.</p>
        </div>

      </div>
    </section>
  );
}
```

### Expected output
A two-column section: the left side shows the headline with the last line in gold (`text-accent`), and the right side shows a dark terminal panel with a red SQL injection warning. On mobile the columns stack vertically.

---

## 6. AI Prompt Journal

### Prompt 1 — Scaffolding the project

**Prompt used:**
> "Give me a step-by-step guide to initialize a Next.js 16 project with TailwindCSS v4, TypeScript, and the App Router. Use pnpm."

**AI response summary:**
The AI explained that TailwindCSS v4 no longer needs `npx tailwindcss init` — instead you install `tailwindcss` and `@tailwindcss/postcss`, then add a single `@import "tailwindcss"` to your CSS file. It also warned that the `@tailwind` directives from v3 are removed.


---

### Prompt 2 — Designing the `@theme` token system

**Prompt used:**
> "How do I define custom colour tokens in TailwindCSS v4 so they map to utility classes like `bg-accent` and `text-muted`?"

**AI response summary:**
The AI showed the `@theme` block syntax inside `globals.css`. It explained that any `--color-X` variable defined there automatically generates the full set of Tailwind utilities (`bg-X`, `text-X`, `border-X`, `ring-X`, etc.) with no plugin needed.

**Helpfulness:** Essential. The `@theme` API is a v4-only feature not covered in most tutorials, so the AI's explanation saved significant research time.

---

### Prompt 3 — Server vs Client components in the App Router

**Prompt used:**
> "In Next.js App Router, when do I need `'use client'` and when should I keep a component as a Server Component? Give me a concrete example."

**AI response summary:**
The AI explained that Server Components (the default) can fetch data and render HTML but cannot use React hooks or browser APIs. Client Components (`"use client"`) can use `useState`, `useEffect`, and event handlers but add JavaScript to the bundle. The pattern it recommended: keep route files as Server Components, push interactivity into leaf components marked `"use client"`.

**Helpfulness:** Directly shaped the architecture — `app/demo/page.tsx` stays a Server Component that just wraps `DemoWorkspace.tsx`, which is the `"use client"` interactive layer.

---

## 7. Common Issues & Fixes

### Issue 1 — `@tailwind` directives not recognised

**Error:**
```
Unknown at rule @tailwindcss
```

**Cause:** Using TailwindCSS v4 with v3 syntax. v4 removed `@tailwind base`, `@tailwind components`, and `@tailwind utilities`.

**Fix:** Replace all three directives with:
```css
@import "tailwindcss";
```

---

### Issue 2 — Custom colour tokens not generating utility classes

**Error:** `bg-accent` applied no styles in the browser.

**Cause:** In v4, custom colours must be declared inside an `@theme {}` block as `--color-*` variables. Declaring them as plain CSS custom properties (`--accent: #d4a420`) outside `@theme` does not register them with Tailwind.

**Fix:**
```css
/* Wrong — Tailwind doesn't see this */
:root {
  --accent: #d4a420;
}

/* Correct — Tailwind generates bg-accent, text-accent, etc. */
@theme {
  --color-accent: #d4a420;
}
```

---

### Issue 3 — `next/font` causing a hydration mismatch

**Error:**
```
Warning: Prop `className` did not match. Server: "..." Client: "..."
```

**Cause:** Font variable class names were applied inconsistently between server and client renders.

**Fix:** Apply the font variables on the `<html>` element in `layout.tsx` (not `<body>`), and use `Readonly<{ children: React.ReactNode }>` for the layout prop type to satisfy the Next.js 16 type constraints.

---

### Issue 4 — `pnpm dev` fails with `ENOENT` on `node_modules/.pnpm`

**Cause:** Cloning the repo without running `pnpm install` first.

**Fix:** Always run `pnpm install` before `pnpm dev`. If `node_modules` exists but is corrupted, delete it and reinstall:
```bash
rm -rf node_modules
pnpm install
```

---

## 8. References

### Official Documentation
- [Next.js Docs — App Router](https://nextjs.org/docs/app) — routing, layouts, Server vs Client Components
- [TailwindCSS v4 Docs](https://tailwindcss.com/docs) — `@theme`, utility class reference, PostCSS setup
- [React 19 Docs](https://react.dev) — hooks, Server Components, Suspense

### TailwindCSS v4 Migration
- [TailwindCSS v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide) — covers the removal of `tailwind.config.js` and `@tailwind` directives

### Helpful Articles
- "What's new in Tailwind CSS v4" — CSS-Tricks
- "Next.js App Router: Server vs Client Components explained" — Vercel Blog
- "Why pnpm?" — pnpm.io/motivation

### Tools Used
- [VS Code Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) — autocomplete for utility classes inside JSX
- [Next.js GitHub repository](https://github.com/vercel/next.js) — source and issue tracker
