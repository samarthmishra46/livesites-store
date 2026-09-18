import { BenefitsStrip } from "@/components/home/BenefitsStrip";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeroSection } from "@/components/home/HeroSection";
import { RecommendationCard } from "@/components/home/RecommendationCard";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BenefitsStrip />
      <FeaturedProducts />
      <RecommendationCard />
    </>
  );
}
