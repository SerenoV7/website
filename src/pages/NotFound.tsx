import GradientBackground from "@/components/GradientBackground";
import { cn } from "@/lib/utils";

export default function Home() {

  return (
    <div className="home">
      {/* Layer 0 – background */}
      <GradientBackground animated />
      {/* Layer 1 – blur */}
      <div className="layer-blur" aria-hidden="true" />
      {/* Layer 2 – content */}
      <main className="layer-content">

        <h1 className="name">404</h1>
        <p className="tagline">Page not found</p>
        <a href="/" className="button">
          Go back to homepage
        </a>

      </main>
    </div>
  );
}
