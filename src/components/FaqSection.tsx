import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';
import { FAQ } from '../types';

export default function FaqSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: 'f1',
      question: 'Where is Pearls Butik located, and how can I reach the studio?',
      answer: 'Our physical atelier is situated at Sinchan Nagar, Parbhani, Maharashtra - 431401. You can call us directly on +91 9511668617 or tap our floating WhatsApp button to coordinate directions.'
    },
    {
      id: 'f2',
      question: 'What is the standard turnaround time for custom dress or blouse stitching?',
      answer: 'For a designer blouse, our standard stitching and trial turnaround is 3 to 5 operating days. For heavy bridal lehengas, we recommend booking an appointment at least 15 to 20 days ahead of your event date.'
    },
    {
      id: 'f3',
      question: 'Do I need my own sewing machine to enroll in the dress designing academy?',
      answer: 'No prior equipment or experience is needed! Our academy is fully equipped with modern, professional sewing machines, paper drafting templates, and practice fabrics for every student. Just bring your passion.'
    },
    {
      id: 'f4',
      question: 'What are the batch timings and student limits for the classes?',
      answer: 'We operate small-batch modules limit to 10-12 students maximum to ensure Pratibha Ingole can provide individual pattern-cutting attention. We run morning (10:00 AM - 12:00 PM) and evening batches (04:00 PM - 06:00 PM).'
    },
    {
      id: 'f5',
      question: 'Do you provide business support for students looking to start a boutique?',
      answer: 'Yes, absolutely! Our 6-Month Couture Business Master Course includes a dedicated 1-Month module on fabric bulk sourcing (direct from Surat/Mumbai wholesalers), pricing/costing spreadsheets, local boutique registration/licensing, and live client drapes handling.'
    }
  ];

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <section id="faqs" className="relative bg-[#070707] py-24 text-white border-t border-stone-900">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#E75480] text-xs font-mono tracking-[0.25em] uppercase flex items-center justify-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            FAQ Atelier
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-white">
            Common <span className="text-[#D4AF37] italic">Questions</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-400 text-xs md:text-sm font-light">
            Have questions about our couture fittings, designing certificates, or fee payment structures? We have gathered answers to help you plan.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-stone-900 rounded-2xl bg-[#0c0c0c] overflow-hidden hover:border-stone-800 transition-colors"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif text-sm md:text-base text-stone-200 hover:text-white cursor-pointer transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#D4AF37] shrink-0 transition-transform duration-300 ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm font-light text-stone-400 leading-relaxed border-t border-stone-900/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="text-center pt-4">
          <p className="text-xs text-stone-500 font-light flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#E75480]" />
            <span>Still have questions? Ring us on <strong>+91 9511668617</strong> for immediate answers.</span>
          </p>
        </div>

      </div>
    </section>
  );
}
