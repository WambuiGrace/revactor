/*
  Step 8: page.tsx — the root route (/).
  In the App Router this file maps directly to the "/" URL.
  It's a Server Component that composes every section in order.
  No logic lives here — just structure.
*/
import Navbar       from "./components/Navbar";
import Hero         from "./components/Hero";
import Features     from "./components/Features";
import ScoreSection from "./components/ScoreSection";
import Footer       from "./components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ScoreSection />
      </main>
      <Footer />
    </>
  );
}
