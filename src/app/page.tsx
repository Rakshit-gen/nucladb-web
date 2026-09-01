import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { ProductSection } from "@/components/product-section";
import { ArchitectureSection } from "@/components/architecture-section";
import { BenchmarksSection } from "@/components/benchmarks-section";
import { DesignDecisionsSection } from "@/components/design-decisions-section";
import { ClusterSection } from "@/components/cluster-section";
import { CredibilitySection } from "@/components/credibility-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProductSection />
        <ArchitectureSection />
        <BenchmarksSection />
        <DesignDecisionsSection />
        <ClusterSection />
        <CredibilitySection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
