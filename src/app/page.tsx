import React from "react";
import UrgencyTopBar from "@/components/UrgencyTopBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import FeaturesSection from "@/components/FeaturesSection";
import SavingsCalculator from "@/components/SavingsCalculator";
import PackagesSection from "@/components/PackagesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import UrgencyBanner from "@/components/UrgencyBanner";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* 1. Urgency Top Banner */}
      <UrgencyTopBar />

      {/* 2. Main Navigation Bar */}
      <Navbar />

      {/* 3. Hero Section (Above the fold) */}
      <HeroSection />

      {/* 4. Stats Metrics Strip (Inspired by reference image) */}
      <StatsBar />

      {/* 5. Four Core Features (Inspired by reference image) */}
      <FeaturesSection />

      {/* 6. Interactive Solar Savings Calculator */}
      <SavingsCalculator />

      {/* 7. Package Plans (Inspired by reference image) */}
      <PackagesSection />

      {/* 8. Verified Testimonials (Inspired by reference image) */}
      <TestimonialsSection />

      {/* 9. Scarcity & Urgency Wide Banner */}
      <UrgencyBanner />

      {/* 10. Lead Capture Form with Phone Verification Step */}
      <LeadCaptureForm />

      {/* 11. FAQ Accordion (Inspired by reference image) */}
      <FaqSection />

      {/* 12. Complete Trust Footer */}
      <Footer />
    </main>
  );
}
