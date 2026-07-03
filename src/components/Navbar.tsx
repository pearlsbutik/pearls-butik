import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Calendar, Phone, Instagram, ShieldCheck, GraduationCap } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAcademy: () => void;
}

export default function Navbar({ activeSection, onNavigate, onOpenAcademy }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Classes', id: 'classes' },
    { name: 'Gallery', id: 'gallery' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Contact', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      {/* Top micro announcement bar */}
      <div className="bg-[#111111] text-[11px] py-2 text-center text-stone-300 tracking-[0.15em] border-b border-[#D4AF37]/25 flex justify-center items-center gap-4 px-4">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          Dress Designing Institute Admissions Open for 2026!
        </span>
        <span className="hidden sm:inline text-stone-600">|</span>
        <span className="hidden sm:flex items-center gap-1">
          <Phone className="w-3 h-3 text-[#D4AF37]" />
          Call +91 9511668617
        </span>
      </div>

      <header
        className={`fixed top-9 left-0 right-0 z-40 transition-all duration-500 px-4 md:px-8`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-500 border ${
            isScrolled
              ? 'bg-white/80 backdrop-blur-md border-[#D4AF37]/25 py-2 shadow-[0_10px_30px_rgba(212,175,55,0.06)]'
              : 'bg-[#F5F2ED]/40 backdrop-blur-sm border-[#D4AF37]/10 py-4'
          }`}
        >
          <div className="flex items-center justify-between px-6">
            {/* Brand Logo */}
            <div className="cursor-pointer" onClick={() => handleLinkClick('home')}>
              <Logo className="h-10 md:h-11 w-auto" light={true} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer relative py-2 ${
                    activeSection === link.id
                      ? 'text-[#D4AF37] font-semibold'
                      : 'text-stone-700 hover:text-[#111111]'
                  }`}
                >
                  {link.name}
                  {activeSection === link.id && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={onOpenAcademy}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-5 py-2.5 text-xs tracking-widest text-black font-bold uppercase transition-all duration-300 hover:shadow-[0_4px_15px_rgba(212,175,55,0.35)] cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academy Portal</span>
              </button>
              
              <button
                onClick={() => handleLinkClick('contact')}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#111111] px-5 py-2.5 text-xs tracking-widest text-[#D4AF37] border border-[#D4AF37] font-semibold uppercase transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#111111] cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                <span>Book Appointment</span>
              </button>

              {/* Owner Profile Quick Look */}
              <div className="flex items-center gap-2 border-l border-stone-200/60 pl-3 ml-1">
                <div className="relative group flex items-center gap-2">
                  <div className="w-8.5 h-8.5 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-sm bg-stone-100 shrink-0">
                    <img 
                      src="/src/assets/images/pratibha_ingole_1783094406828.jpg" 
                      alt="Pratibha Ingole (Owner)" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] font-bold text-stone-900 leading-tight">Pratibha I.</span>
                    <span className="text-[8px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold mt-0.5">Owner</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-stone-700 hover:text-[#111111] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-[#111111]/80 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-[#F5F2ED] border-l border-[#D4AF37]/30 p-6 flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.1)]"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo className="h-8" showText={false} light={true} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-stone-600 hover:text-[#111111] border border-stone-300 rounded-full cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-5 my-auto">
                {navLinks.map((link, idx) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleLinkClick(link.id)}
                    className={`text-left text-lg tracking-[0.2em] uppercase py-2 border-b border-stone-200 transition-colors ${
                      activeSection === link.id
                        ? 'text-[#D4AF37] border-[#D4AF37]/30'
                        : 'text-stone-700 hover:text-[#D4AF37]'
                    }`}
                  >
                    {link.name}
                  </motion.button>
                ))}
              </div>

              {/* Owner greeting in Mobile drawer */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200/60 mt-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37] shadow-sm bg-stone-50 shrink-0">
                  <img 
                    src="/src/assets/images/pratibha_ingole_1783094406828.jpg" 
                    alt="Pratibha Ingole" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-left leading-none">
                  <p className="text-xs font-bold text-stone-900 leading-tight">Pratibha Ingole</p>
                  <p className="text-[9px] text-[#D4AF37] font-mono tracking-wider uppercase font-bold mt-0.5">Owner & Chief Designer</p>
                </div>
              </div>

              {/* Extra Mobile Details */}
              <div className="mt-auto pt-4 border-t border-stone-200 space-y-3 text-center">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAcademy();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black py-3 text-sm tracking-widest font-bold uppercase hover:shadow-lg transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Academy Portal</span>
                </button>

                <button
                  onClick={() => handleLinkClick('contact')}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#111111] border border-[#D4AF37] text-[#D4AF37] py-3 text-sm tracking-widest font-bold uppercase hover:bg-[#D4AF37] hover:text-[#111111] transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </button>

                <div className="text-[10px] text-stone-500 tracking-wider">
                  <p>Parbhani, Maharashtra</p>
                  <p className="mt-1 text-[#D4AF37] font-medium">+91 9511668617</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
