import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import HomeSection from './components/HomeSection';
import AboutSection from './components/AboutSection';
import CollectionSection from './components/CollectionSection';
import ServicesSection from './components/ServicesSection';
import ClassesSection from './components/ClassesSection';
import AiStylist from './components/AiStylist';
import GallerySection from './components/GallerySection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import BlogSection from './components/BlogSection';
import FaqSection from './components/FaqSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ScrollToTop from './components/ScrollToTop';
import AcademyPortal from './components/AcademyPortal';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [activePresetService, setActivePresetService] = useState('');
  const [showAcademy, setShowAcademy] = useState(false);

  // Initial luxury loader delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Intersection observer to automatically update navbar highlighting as user scrolls
  useEffect(() => {
    if (loading) return;

    const sections = ['home', 'about', 'services', 'classes', 'gallery', 'pricing', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the middle of screen
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);

  const handleScrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleActionWithPreset = (serviceName: string) => {
    // Check if the service name corresponds to an academy course
    let presetName = serviceName;
    if (serviceName.includes('Course') || serviceName.includes('Designing') || serviceName.includes('Master')) {
      if (!serviceName.endsWith('Course')) {
        presetName = `${serviceName} Course`;
      }
    }
    setActivePresetService(presetName);
    handleScrollToSection('contact');
  };

  return (
    <div className="relative bg-[#F5F2ED] min-h-screen font-sans selection:bg-[#D4AF37]/30 selection:text-[#111111] antialiased text-[#111111]">
      
      {/* Luxury Initial Loader Page */}
      <AnimatePresence mode="wait">
        {loading && <Loader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col min-h-screen"
        >
          {/* Header & Sticky Glass Navbar */}
          <Navbar 
            activeSection={activeSection} 
            onNavigate={handleScrollToSection} 
            onOpenAcademy={() => setShowAcademy(true)} 
          />

          <main className="flex-grow">
            {/* 1. Hero Landing Section */}
            <div id="home">
              <HomeSection onNavigate={handleScrollToSection} />
            </div>

            {/* About Section */}
            <AboutSection />

            {/* 2. Bento Style Collage Collections */}
            <CollectionSection onSelectCollection={handleActionWithPreset} />

            {/* 3. Custom Fitting Tailoring Services */}
            <ServicesSection onBookAppointment={() => handleActionWithPreset('Designer Blouse Stitching')} />

            {/* 4. Vocational Dress Designing Academy */}
            <ClassesSection onEnroll={handleActionWithPreset} />

            {/* 5. Gemini AI Virtual Stylist Atelier */}
            <AiStylist />

            {/* 6. Pinterest-Style Masonry Showcase */}
            <GallerySection />

            {/* 7. Google Business Star Testimonials */}
            <TestimonialsSection />

            {/* 8. Transparant course fees and estimates */}
            <PricingSection onAction={handleActionWithPreset} />

            {/* 9. Fashion Tips Journal Entries */}
            <BlogSection />

            {/* 10. Expanding Accordion FAQs */}
            <FaqSection />

            {/* 11. Appointment Scheduling and Address Maps */}
            <ContactSection initialServicePreset={activePresetService} />
          </main>

          {/* Luxury Detailed Footer & Newsletter Desk */}
          <Footer onNavigate={handleScrollToSection} />

          {/* Core Interactive Floating Widgets */}
          <FloatingWhatsApp />
          <ScrollToTop />

          {/* Academy Portal Overlay View */}
          <AnimatePresence>
            {showAcademy && (
              <AcademyPortal onClose={() => setShowAcademy(false)} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
