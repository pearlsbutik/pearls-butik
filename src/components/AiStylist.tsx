import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Scissors, Palette, Compass, GraduationCap, Quote, RefreshCw } from 'lucide-react';
import { StylistResponse } from '../types';
import { resolveApiUrl } from '../lib/api';

export default function AiStylist() {
  const [occasion, setOccasion] = useState('Bridal Collection');
  const [fabric, setFabric] = useState('Banarasi Brocade');
  const [style, setStyle] = useState('Traditional Royalty');
  const [preference, setPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<StylistResponse | null>(null);
  const [error, setError] = useState('');

  const loadingSteps = [
    "Opening Pratibha Ingole's couture journal...",
    "Analyzing drapery and fabric density for pure silk/brocade...",
    "Drafting modern designer silhouettes on digital mannequin...",
    "Balancing color palettes, necklines, and sleeve patterns...",
    "Finalizing bespoke sketch details and stylist recommendations..."
  ];

  const occasions = [
    'Bridal Wear',
    'Festival Celebration',
    'Sangeet & Mehendi Night',
    'High-Society Cocktail Party',
    'Traditional Puja Ceremony',
    'Designer Blouse Stitching',
    'One-Piece Reception Gown'
  ];

  const fabrics = [
    'Pure Kanchipuram Silk',
    'Banarasi Brocade & Organza',
    'Flowing Georgette & Chiffon',
    'Premium Velvet & Netting',
    'Handloom Cotton & Linen'
  ];

  const styles = [
    'Traditional Royalty',
    'Modern Minimalist Chic',
    'Bohemian Indo-Western',
    'Royal Sabyasachi Vibe',
    'Elegant Avant-Garde'
  ];

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Dynamic loading text step interval
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch(resolveApiUrl('/api/consultation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          occasion,
          fabric,
          style,
          preference,
        }),
      });

      if (!response.ok) {
        throw new Error('Our design room is currently busy. Please try again soon.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <div id="ai-stylist-consultant" className="bg-white border border-[#D4AF37]/30 rounded-3xl p-6 md:p-10 shadow-[0_15px_50px_rgba(212,175,55,0.06)] relative overflow-hidden">
      {/* Visual luxury ambient background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Left Side: Setup Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase flex items-center gap-2 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              AI Couture Consultation
            </span>
            <h3 className="font-serif text-2xl md:text-3xl tracking-wide text-[#111111]">
              Bespoke Design Consultant
            </h3>
            <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
              Unlock a customized fashion blueprint. Tell us your occasion and fabric choice, and our AI design engine will draft a luxury stitching recommendation in Pratibha Ingole's signature style.
            </p>
          </div>

          <form onSubmit={handleConsultation} className="space-y-4">
            {/* Occasion Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-colors"
              >
                {occasions.map((occ) => (
                  <option key={occ} value={occ} className="text-stone-900">{occ}</option>
                ))}
              </select>
            </div>

            {/* Fabric Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">Fabric Material</label>
              <select
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-colors"
              >
                {fabrics.map((fab) => (
                  <option key={fab} value={fab} className="text-stone-900">{fab}</option>
                ))}
              </select>
            </div>

            {/* Style Concept */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">Design Style Vibe</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-colors"
              >
                {styles.map((sty) => (
                  <option key={sty} value={sty} className="text-stone-900">{sty}</option>
                ))}
              </select>
            </div>

            {/* Custom preferences text box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Personal Notes / Preferences <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <textarea
                placeholder="E.g., High-neck front collar, full sheer sleeves, heavy floral handwork on borders..."
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                rows={3}
                className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-colors resize-none placeholder-stone-400"
              />
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] disabled:opacity-50 text-black py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating sketch blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Receive Design Recommendation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Results Showcase */}
        <div className="lg:col-span-7 h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[380px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#D4AF37]/35 rounded-2xl bg-stone-50/50"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/10 border-t-[#D4AF37] animate-spin" />
                  <Scissors className="w-6 h-6 text-[#D4AF37] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <motion.p
                  key={loadingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-stone-800 font-serif text-sm tracking-wide"
                >
                  {loadingSteps[loadingStep]}
                </motion.p>
                <p className="text-[10px] text-[#D4AF37] tracking-wider uppercase mt-3 font-mono font-bold">
                  Pearls Butik Digital Atelier
                </p>
              </motion.div>
            )}

            {!loading && !result && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-[380px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-stone-200 rounded-2xl bg-stone-50/40"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-stone-200 flex items-center justify-center mb-4 shadow-sm">
                  <Compass className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h4 className="font-serif text-lg text-stone-800 mb-2 font-medium">Your Bespoke Recommendation Awaits</h4>
                <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">
                  Fill in your preferred event theme, fabrics, and design features on the left to create a customized design roadmap.
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-[380px] flex flex-col items-center justify-center text-center p-8 border border-red-500/20 rounded-2xl bg-red-50/50"
              >
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={handleConsultation}
                  className="text-xs text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 px-4 py-2 rounded-full cursor-pointer"
                >
                  Retry Consultation
                </button>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-[#D4AF37]/30 rounded-2xl bg-[#FDFBF7] p-6 space-y-6 shadow-sm"
              >
                {/* Result Header */}
                <div className="border-b border-stone-100 pb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">Bespoke Formula</span>
                    <h4 className="font-serif text-xl md:text-2xl text-[#111111] font-medium leading-tight mt-1">
                      {result.concept}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-[#D4AF37]/30 bg-white flex items-center justify-center text-[#D4AF37] shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#D4AF37]/15 shadow-sm">
                    <span className="text-[#D4AF37] font-semibold tracking-wide flex items-center gap-1 uppercase font-mono text-[10px]">
                      <Scissors className="w-3.5 h-3.5" /> Silhouette & Cut
                    </span>
                    <p className="text-stone-700 leading-relaxed font-light">{result.silhouette}</p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#D4AF37]/15 shadow-sm">
                    <span className="text-[#D4AF37] font-semibold tracking-wide flex items-center gap-1 uppercase font-mono text-[10px]">
                      <Compass className="w-3.5 h-3.5" /> Neck & Sleeves
                    </span>
                    <p className="text-stone-700 leading-relaxed font-light">{result.necklineSleeves}</p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#D4AF37]/15 shadow-sm">
                    <span className="text-[#D4AF37] font-semibold tracking-wide flex items-center gap-1 uppercase font-mono text-[10px]">
                      <Palette className="w-3.5 h-3.5" /> Color Coordinates
                    </span>
                    <p className="text-stone-700 leading-relaxed font-light">{result.colorPalette}</p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#D4AF37]/15 shadow-sm">
                    <span className="text-[#D4AF37] font-semibold tracking-wide flex items-center gap-1 uppercase font-mono text-[10px]">
                      <Sparkles className="w-3.5 h-3.5" /> Hand Embellishments
                    </span>
                    <p className="text-stone-700 leading-relaxed font-light">{result.embellishments}</p>
                  </div>
                </div>

                {/* Owner's Stylist Quote */}
                <div className="relative border-l-2 border-[#D4AF37] bg-white border border-[#D4AF37]/10 p-4 rounded-r-xl shadow-sm">
                  <Quote className="w-8 h-8 text-stone-100 absolute -top-2 -right-1 pointer-events-none transform scale-x-[-1]" />
                  <p className="text-stone-700 text-xs leading-relaxed italic pr-4">
                    "{result.stylistTip}"
                  </p>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-mono mt-2 text-right font-bold">
                    — Pratibha Ingole, Owner
                  </p>
                </div>

                {/* Course Recommendation */}
                <div className="flex items-start gap-3 bg-[#D4AF37]/5 border border-[#D4AF37]/25 p-3.5 rounded-xl text-xs">
                  <GraduationCap className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#111111] font-bold">Interested in drafting this yourself?</span>
                    <p className="text-stone-600 font-light mt-0.5">{result.courseSuggestion}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
