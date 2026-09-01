import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { PlaygroundSection } from "@/components/playground-section";
import { ProductSection } from "@/components/product-section";
import { ArchitectureSection } from "@/components/architecture-section";
import { BenchmarksSection } from "@/components/benchmarks-section";
import { DesignDecisionsSection } from "@/components/design-decisions-section";
import { ClusterSection } from "@/components/cluster-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PlaygroundSection />
        <ProductSection />
        <ArchitectureSection />
        <BenchmarksSection />
        <DesignDecisionsSection />
        <ClusterSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
