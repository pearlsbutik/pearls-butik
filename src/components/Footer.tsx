import React, { useState } from 'react';
import { Mail, Send, Phone, MapPin, Instagram, Facebook, Award, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Our letter desk is busy. Please try again soon.');
      }

      const data = await response.json();
      if (data.success) {
        setSubscribed(true);
        setCouponCode(data.coupon);
        setEmail('');
      } else {
        throw new Error(data.error || 'Subscription failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About Us', id: 'about' },
    { name: 'Our Services', id: 'services' },
    { name: 'Designing Classes', id: 'classes' },
    { name: 'Bespoke Gallery', id: 'gallery' },
    { name: 'Transparant Pricing', id: 'pricing' },
    { name: 'Atelier Contact', id: 'contact' },
  ];

  const coursesList = [
    'Basic Dress Designing',
    'Advanced Dress Designing',
    'Blouse Designing Special',
    'Pattern Making Course',
    'Cutting & Stitching',
    'Fabric Knowledge & Finishing',
    'Complete Professional Course'
  ];

  const servicesList = [
    'Bridal Wear Couture',
    'Designer Blouse Stitching',
    'Custom Dress Stitching',
    'Traditional & Festive Wear',
    'One Piece Dresses & Gowns',
    'Expert Garment Alterations'
  ];

  return (
    <footer className="bg-[#111111] text-stone-400 border-t border-[#D4AF37]/25 pt-20 pb-8 relative overflow-hidden">
      
      {/* Decorative ambient lights */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 relative z-10">
        
        {/* Newsletter Subscription Row */}
        <div className="bg-stone-950 border border-[#D4AF37]/20 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3 text-center lg:text-left">
            <span className="text-[#D4AF37] text-xs font-mono uppercase tracking-widest flex items-center justify-center lg:justify-start gap-1.5 font-bold">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              Pearls Journal
            </span>
            <h4 className="font-serif text-2xl text-white">Subscribe to design news</h4>
            <p className="text-stone-500 text-xs font-light max-w-sm">
              Subscribe to get exclusive festival discount updates, seasonal fabric catalogs, and drafting tutorial tips from Pratibha Ingole.
            </p>
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email coordinates..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-[#161616] text-white rounded-xl px-5 py-4 text-xs md:text-sm border border-stone-800 focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-stone-600"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_4px_15px_rgba(212,175,55,0.25)] transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      {loading ? 'Subscribing...' : 'Subscribe'}
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {error && <p className="text-red-400 text-xs font-light">{error}</p>}
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-amber-500/5 border border-dashed border-[#D4AF37]/35 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-green-400 text-xs font-medium flex items-center justify-center sm:justify-start gap-1">
                      ✓ Successfully subscribed!
                    </span>
                    <p className="text-stone-300 text-xs font-light">Your exclusive welcome coupon is active.</p>
                  </div>

                  <div className="bg-black/60 border border-[#D4AF37]/30 px-5 py-3 rounded-xl text-center">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-0.5">Voucher Code</p>
                    <span className="text-[#D4AF37] font-mono font-bold tracking-widest text-base">
                      {couponCode}
                    </span>
                    <p className="text-[8px] text-stone-500 mt-0.5">Use on your next custom stitching</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Links grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 text-xs font-light">
          
          {/* Logo & Bio column */}
          <div className="lg:col-span-4 space-y-6">
            <Logo className="h-10" />
            <p className="text-stone-500 leading-relaxed pr-4">
              Pearls Butik is Parbhani’s premier ladies’ dress studio and vocational stitching academy led by expert couturier Pratibha Ingole.
            </p>
            {/* Trust highlights */}
            <div className="flex gap-4 text-[10px] text-stone-600 font-mono uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                100% Fit Guarantee
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                Govt-Syllabus Academy
              </span>
            </div>
          </div>

          {/* Navigation links column */}
          <div className="lg:col-span-2 space-y-4">
            <h5 className="font-serif text-[#D4AF37] font-medium uppercase tracking-wider text-sm">Quick Navigation</h5>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-stone-400 hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses list column */}
          <div className="lg:col-span-2 space-y-4">
            <h5 className="font-serif text-[#D4AF37] font-medium uppercase tracking-wider text-sm">Academy Syllabuses</h5>
            <ul className="space-y-2.5">
              {coursesList.map((course) => (
                <li key={course}>
                  <button
                    onClick={() => onNavigate('classes')}
                    className="text-stone-400 hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                  >
                    {course}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services list column */}
          <div className="lg:col-span-2 space-y-4">
            <h5 className="font-serif text-[#D4AF37] font-medium uppercase tracking-wider text-sm">Tailoring Services</h5>
            <ul className="space-y-2.5">
              {servicesList.map((service) => (
                <li key={service}>
                  <button
                    onClick={() => onNavigate('services')}
                    className="text-stone-400 hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details column */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h5 className="font-serif text-[#D4AF37] font-medium uppercase tracking-wider text-sm">Coordinates</h5>
            <div className="space-y-3.5 text-stone-400 leading-relaxed">
              <div className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Sinchan Nagar, Parbhani, Maharashtra - 431401</span>
              </div>
              <div className="flex gap-2 items-center">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>+91 9511668617</span>
              </div>
              <div className="flex gap-2 items-center">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>pearlsbutik@gmail.com</span>
              </div>
            </div>
            {/* Social icons */}
            <div className="flex gap-3 pt-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                aria-label="Instagram Page"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                aria-label="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright, credits and local disclaimer bottom bar */}
        <div className="border-t border-stone-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-stone-600 font-mono tracking-widest uppercase">
          <p>© {new Date().getFullYear()} Pearls Butik. All Rights Reserved.</p>
          <p className="flex items-center gap-1 text-[10px] lowercase normal-case italic font-sans text-stone-500">
            <span>Stitched with</span>
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span>in Parbhani, Maharashtra</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
