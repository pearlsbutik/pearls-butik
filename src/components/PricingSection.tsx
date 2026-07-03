import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Info, Sparkles, Star, Tag } from 'lucide-react';
import { PricingPlan } from '../types';

interface PricingSectionProps {
  onAction: (itemName: string) => void;
}

export default function PricingSection({ onAction }: PricingSectionProps) {
  const [pricingType, setPricingType] = useState<'course' | 'stitching'>('course');

  const coursePlans: PricingPlan[] = [
    {
      id: 'p1',
      name: 'Basic Dress Designing Course',
      price: '₹5,000',
      period: 'Full Course Fee',
      level: 'Beginner',
      features: [
        'Fundamental machine handling & care',
        'Body measurements math and ease calculations',
        'Straight suit cutting & stitching techniques',
        'Sleeve attaching & simple necks drafting',
        'Small batch limit of 10 students',
        'Practical on-fabric practice models'
      ],
      popular: false,
      type: 'course'
    },
    {
      id: 'p2',
      name: 'Advanced Dress Designing Course',
      price: '₹10,000',
      period: 'Full Course Fee',
      level: 'Intermediate to Pro',
      features: [
        'Anarkali & Kalidaar heavy drapes drafting',
        'Trendy collars & cowl necks stitching',
        'Indo-western crop tops & cigarette pants',
        'Fine lining attachments & edge finishings',
        'Pratibha Ingole’s bespoke fitting blueprints',
        'Course completion certificate'
      ],
      popular: true,
      type: 'course'
    },
    {
      id: 'p3',
      name: 'Blouse Designing Special Course',
      price: '₹3,500',
      period: 'Full Course Fee',
      level: 'Specialization',
      features: [
        'Princess, Katori & High collar cuts',
        'Plunging back neck adjustments',
        'Lace patching & hand borders layout',
        'Bridal heavy pad placement formulas',
        'Professional paper template cutting',
        'Specialty certificate'
      ],
      popular: false,
      type: 'course'
    },
    {
      id: 'p4',
      name: 'Pattern Making Course',
      price: '₹2,500',
      period: 'Full Course Fee',
      level: 'Skill Focus',
      features: [
        'Master paper template drafting rules',
        'Bust & waist ease math calculations',
        'Armhole curve & sleeve hole math',
        'Grade sizing and margin templates',
        'Pattern placement on varied width fabrics'
      ],
      popular: false,
      type: 'course'
    },
    {
      id: 'p5',
      name: 'Cutting & Stitching Course',
      price: '₹4,500',
      period: 'Full Course Fee',
      level: 'Practical Core',
      features: [
        'Clean & straight fabric cutting ratios',
        'Optimum fabric layout to reduce waste',
        'Premium interlocking seams finishing',
        'Canvas neck collars & piping detailing',
        '100% hands-on practical lab hours'
      ],
      popular: false,
      type: 'course'
    },
    {
      id: 'p6',
      name: 'Fabric Knowledge & Finishing',
      price: '₹2,000',
      period: 'Full Course Fee',
      level: 'Skill Focus',
      features: [
        'Understanding grainlines, stretch & drapes',
        'Drape & fall calculations for varied fabrics',
        'Invisible seams & clean hand hemming',
        'Professional steam creasing & pressing rules',
        'Sourcing guide for boutique fabrics'
      ],
      popular: false,
      type: 'course'
    },
    {
      id: 'p7',
      name: 'Complete Professional Course (6 Months)',
      price: '₹18,000',
      period: '6-Month Master',
      level: 'Career Path',
      features: [
        'All 6 specialized syllabus modules integrated',
        'Elite bridal heavywear & lehenga panels',
        'Boutique cataloging & live client projects',
        'Cost estimation & boutique business pricing',
        'Direct support for government-certified syllabus'
      ],
      popular: false,
      type: 'course'
    }
  ];

  const stitchingPlans: PricingPlan[] = [
    {
      id: 'ps1',
      name: 'Designer Blouse Stitching',
      price: '₹600',
      period: 'Starting Est.',
      level: 'Custom Tailored',
      features: [
        'Precise personalized measurements session',
        'High-quality lining additions',
        'Sweetheart, Princess or Katori patterns',
        'No shoulders falling guarantee',
        'Dori & simple hook details included',
        'Turnaround in 3-5 days'
      ],
      popular: false,
      type: 'stitching'
    },
    {
      id: 'ps2',
      name: 'Heavy Bridal Lehenga Set',
      price: '₹3,500',
      period: 'Starting Est.',
      level: 'Luxury Couture',
      features: [
        'Full 3D posture mapping measurement',
        'Bespoke canvas lining for heavy flares',
        'Double piping & customized sleeve cuts',
        'Heavy tassel back string stitching',
        'Includes dupatta setting/lace layout',
        'Exclusive trial fitting adjustment session'
      ],
      popular: true,
      type: 'stitching'
    },
    {
      id: 'ps3',
      name: 'Punjabi Salwar & Kurtis',
      price: '₹800',
      period: 'Starting Est.',
      level: 'Custom Tailored',
      features: [
        'Anarkali, Patiala or Straight Kurti suit',
        'Palazzo, churidar or straight pants bottom',
        'Interlocking seams finishing',
        'Side zip & neck canvas stitching',
        'Perfect necklines alignment',
        'Quick modifications adjustments'
      ],
      popular: false,
      type: 'stitching'
    }
  ];

  const activePlans = pricingType === 'course' ? coursePlans : stitchingPlans;

  return (
    <section id="pricing" className="relative bg-[#F5F2ED] py-24 text-[#111111] border-t border-[#D4AF37]/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08)_0,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase flex items-center justify-center gap-2 font-bold">
            <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
            Pricing Transparency
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#111111]">
            Honest <span className="text-[#D4AF37] italic">Pricing Plans</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-600 text-xs md:text-sm font-light">
            We provide affordable designing courses and pristine stitching quotes. No hidden costs. Quality craftsmanship guaranteed.
          </p>
        </div>

        {/* Pricing Toggle Tabs */}
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-full border border-stone-200 flex items-center shadow-sm">
            <button
              onClick={() => setPricingType('course')}
              className={`text-xs md:text-sm uppercase tracking-wider px-6 py-2.5 rounded-full font-bold transition-all cursor-pointer ${
                pricingType === 'course'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black shadow-md'
                  : 'text-stone-500 hover:text-[#111111]'
              }`}
            >
              Designing Academy Courses
            </button>
            <button
              onClick={() => setPricingType('stitching')}
              className={`text-xs md:text-sm uppercase tracking-wider px-6 py-2.5 rounded-full font-bold transition-all cursor-pointer ${
                pricingType === 'stitching'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black shadow-md'
                  : 'text-stone-500 hover:text-[#111111]'
              }`}
            >
              Boutique Stitching Estimates
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${pricingType === 'course' ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-8`}>
          {activePlans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`relative rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                plan.popular
                  ? 'bg-white border-[#D4AF37] border-2 shadow-[0_10px_40px_rgba(212,175,55,0.12)]'
                  : 'bg-white border-stone-200 hover:border-[#D4AF37]/50 hover:shadow-lg shadow-sm'
              }`}
            >
              {/* Popular Tag Badge */}
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black text-[9px] font-mono font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black" /> Popular Option
                </span>
              )}

              {/* Header card details */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">{plan.level}</span>
                  <h4 className="font-serif text-base text-[#111111] font-bold leading-snug">{plan.name}</h4>
                </div>

                <div className="flex items-baseline gap-1 py-2 border-y border-stone-100">
                  <span className="text-3xl font-serif font-bold text-[#D4AF37]">{plan.price}</span>
                  <span className="text-stone-500 text-[10px] uppercase font-mono tracking-wider">/ {plan.period}</span>
                </div>

                {/* Features list */}
                <ul className="space-y-3 pt-3">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="text-stone-600 font-light leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-stone-100">
                <button
                  onClick={() => onAction(plan.name)}
                  className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:shadow-[0_4px_15px_rgba(212,175,55,0.25)] text-black'
                      : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-[#111111] hover:text-[#D4AF37] hover:border-[#D4AF37]'
                  }`}
                >
                  {pricingType === 'course' ? 'Enroll In Course' : 'Book Fitting Slot'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing Notice */}
        <div className="flex items-center gap-3 bg-white border border-[#D4AF37]/30 p-4 rounded-xl max-w-2xl mx-auto text-xs text-stone-600 shadow-sm">
          <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <p className="leading-relaxed font-light">
            <strong>Note:</strong> Stitching pricing depends on the complexity of lace work, custom linings, and back dori adjustments. We recommend booking a <strong>Fashion Consultation</strong> slot first to discuss materials.
          </p>
        </div>

      </div>
    </section>
  );
}
