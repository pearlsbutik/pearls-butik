import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, BookOpen, ChevronDown } from 'lucide-react';

interface HomeSectionProps {
  onNavigate: (sectionId: string) => void;
}

export default function HomeSection({ onNavigate }: HomeSectionProps) {
  const stats = [
    { value: '5000+', label: 'Happy Customers' },
    { value: '1500+', label: 'Students Trained' },
    { value: '10+', label: 'Years Experience' },
    { value: '100%', label: 'Satisfaction' },
  ];

  return (
    <section id="home-section" className="relative min-h-screen flex flex-col justify-center bg-[#F5F2ED] pt-24 overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12)_0,transparent_65%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06)_0,transparent_50%)] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-12">
        
        {/* Left: Branding & Headlines */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs text-[#111111] uppercase tracking-[0.2em] font-mono mx-auto lg:mx-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
            <span className="font-semibold text-[10px] md:text-xs">Premium Boutique & Designing Academy</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#111111] font-light tracking-tight leading-[1.1]"
            >
              Design Your <span className="text-[#D4AF37] font-normal italic">Dreams</span> <br />
              Into Stitching <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#8A6B0E] font-normal">Reality</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-stone-700 text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              Pearls Butik is a luxury ladies' dress designing studio & premium coaching academy founded by expert couturier <strong>Pratibha Ingole</strong>. Experience custom bridal wears, designer blouses, and professional fashion certifications.
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase font-mono border-l-2 border-[#D4AF37] pl-4 italic max-w-md mx-auto lg:mx-0"
          >
            "Stitch Your Style, Wear Your Confidence"
          </motion.p>

          {/* Action Call To Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
          >
            <button
              onClick={() => onNavigate('classes')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-[0_10px_25px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Join Academy Classes</span>
            </button>
            
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto bg-[#111111] border border-[#D4AF37]/30 hover:bg-neutral-900 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Book Appointment</span>
            </button>
          </motion.div>
        </div>

        {/* Right: Immersive Fashion Collage with overlapping assets */}
        <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="relative w-80 sm:w-96 aspect-[3/4] rounded-[2rem] overflow-hidden border-2 border-[#D4AF37]/30 shadow-[0_20px_50px_rgba(212,175,55,0.08)] bg-white p-2"
          >
            {/* Owner Showcase Image */}
            <div className="w-full h-full rounded-[1.8rem] overflow-hidden relative">
              <img
                src="/src/assets/images/pratibha_ingole_1783094406828.jpg"
                alt="Pratibha Ingole - Owner of Pearls Butik"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

              {/* Bottom floating tag in picture */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#111111]/90 backdrop-blur-md border border-[#D4AF37]/30 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[#D4AF37] font-serif text-sm">Pratibha Ingole</p>
                  <p className="text-[10px] text-stone-300 font-mono tracking-widest uppercase">Founder & Chief Couturier</p>
                </div>
                <span className="text-[10px] bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-2.5 py-1 rounded text-black font-mono font-bold uppercase">Owner</span>
              </div>
            </div>
          </motion.div>

          {/* Mini overlay image to make it look like a high-fashion editorial */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="absolute -bottom-8 -right-4 lg:-right-10 w-44 aspect-[3/4] rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(212,175,55,0.1)] hidden sm:block"
          >
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400"
              alt="Designer Saree Blouse Back Detailing"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </div>

      {/* Stats Ribbon Container - Dark, prestigious banner styled like the footer in the design */}
      <div className="border-y-2 border-[#D4AF37] bg-[#111111] relative z-10 py-10 mt-12 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="space-y-1"
            >
              <h3 className="font-serif text-3xl md:text-4xl text-[#D4AF37] font-bold tracking-wide">
                {stat.value}
              </h3>
              <p className="text-stone-300 text-[10px] md:text-xs tracking-widest uppercase font-mono">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Down arrow link indicator */}
      <div className="flex justify-center py-6">
        <motion.button
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => onNavigate('about')}
          className="text-stone-600 hover:text-[#D4AF37] transition-colors cursor-pointer"
          aria-label="Scroll down to About Us section"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.button>
      </div>
    </section>
  );
}
