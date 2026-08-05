import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { MetricsShowcase } from "@/components/landing/metrics-showcase";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(224,71%,4%)]">
      <LandingNavbar />
      <Hero />
      <Features />
      <MetricsShowcase />
      <Testimonials />
      <CTA />
      <LandingFooter />
    </div>
  );
}
