import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { DestinationsSection } from "@/components/home/DestinationsSection";
// import { PromoSection } from "@/components/home/PromoSection";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <TrendingSection />
        <DestinationsSection />
        {/* <PromoSection /> */}
        <WhyChooseSection />
      </main>
      <Footer />
    </div>
  );
}
