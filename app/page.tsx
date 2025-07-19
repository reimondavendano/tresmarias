import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { TeamSection } from '@/components/home/TeamSection';
import { AboutSection } from '@/components/home/AboutSection';
import CreateAdmin from '@/components/admin/CreateAdmin';
import { GallerySection } from '@/components/home/GallerySection';
import { FloatingMessengerButton } from '@/components/floatingMessengerButton';
import { ServiceBannerModal } from '@/components/serviceBanner';




export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      {/* <CreateAdmin /> */}
      <ServicesSection />
      <GallerySection/>
      <TeamSection />
      <AboutSection />
      <div className="fixed bottom-6 right-6 z-50"> {/* Re-apply fixed positioning here */}
        <FloatingMessengerButton />
      </div>
      <Footer />
      <ServiceBannerModal /> {/* Place the modal here */}
    </main>
  );
}