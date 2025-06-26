import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { TeamSection } from '@/components/home/TeamSection';
import { AboutSection } from '@/components/home/AboutSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <TeamSection />
      <AboutSection />
      <Footer />
    </main>
  );
}