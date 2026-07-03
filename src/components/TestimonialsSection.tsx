import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, Heart, Award, ShieldAlert, Sparkles, Smile } from 'lucide-react';
import { Testimonial } from '../types';

export default function TestimonialsSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'student'>('all');

  const testimonials: Testimonial[] = [
    {
      id: 't1',
      name: 'Anjali Deshmukh',
      role: 'Customer',
      rating: 5,
      comment: 'Pratibha did an absolutely amazing job on my wedding lehenga! The fit was exceptionally flawless, and the velvet hand-embroidery of pearls and gold zari made me feel like royalty. Highly recommend Pearls Butik!',
      date: 'May 2026',
      avatar: 'AD'
    },
    {
      id: 't2',
      name: 'Vaishali Kulkarni',
      role: 'Student',
      rating: 5,
      comment: 'Joining the Advanced Dress Designing Course was the best decision of my life. Pratibha Ingole explains every pattern mathematically and with so much patience. I have already opened my own home boutique in Parbhani!',
      date: 'April 2026',
      avatar: 'VK'
    },
    {
      id: 't3',
      name: 'Megha Pathak',
      role: 'Customer',
      rating: 5,
      comment: 'The designer blouse stitching here is unbeatable. I gave them a very complex back neck design, and they executed it with laser-like precision. The sweetheart neck is perfect. No shoulders falling off!',
      date: 'June 2026',
      avatar: 'MP'
    },
    {
      id: 't4',
      name: 'Sneha Shinde',
      role: 'Student',
      rating: 5,
      comment: 'The Blouse Designing class is 100% practical. We cut on paper templates before touching the actual sarees, which gave me immense confidence. Highly professional training environment!',
      date: 'March 2026',
      avatar: 'SS'
    },
    {
      id: 't5',
      name: 'Pooja Joshi',
      role: 'Customer',
      rating: 5,
      comment: 'Outstanding dress stitching and quick alteration times. I had my daughter’s first frock and my silk anarkali custom stitched within 5 days for the Ganesh festival. Pratibha Ingole is truly gifted.',
      date: 'September 2025',
      avatar: 'PJ'
    },
    {
      id: 't6',
      name: 'Rupali Gawande',
      role: 'Student',
      rating: 5,
      comment: 'Affordable fees structure and lifetime mentorship. Pratibha ma’am doesn’t just teach you sewing; she teaches you the marketing math of how to run a commercial boutique. Empowering for women!',
      date: 'December 2025',
      avatar: 'RG'
    }
  ];

  const filteredReviews = activeTab === 'all'
    ? testimonials
    : testimonials.filter(review => review.role.toLowerCase() === activeTab);

  return (
    <section id="testimonials" className="relative bg-[#070707] py-24 text-white border-t border-stone-900">
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#E75480] text-xs font-mono tracking-[0.25em] uppercase flex items-center justify-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#E75480]" />
            Client & Student Love
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-white">
            Our <span className="text-[#D4AF37] italic">Testimonials</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-400 text-xs md:text-sm font-light">
            Real feedback from our boutique customers and certified fashion student alumni. Verified local reviews in Parbhani.
          </p>
        </div>

        {/* Google Ratings and Quick Badges row */}
        <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-[#0e0e0e] border border-stone-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold font-serif text-[#D4AF37]">4.9</div>
            <div className="space-y-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">Google Business Rating</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-stone-300 text-xs font-light">Based on <strong>250+ Verified Submissions</strong></p>
            <p className="text-[10px] text-[#E75480] font-mono uppercase tracking-widest mt-1">"The Best Tailor-Fit Boutique in Parbhani"</p>
          </div>
        </div>

        {/* Filters Tabs Links */}
        <div className="flex justify-center gap-2 border-b border-stone-900 pb-3 max-w-xs mx-auto">
          {['all', 'customer', 'student'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'bg-stone-900 border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-transparent border-transparent text-stone-500 hover:text-stone-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Testimonials Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReviews.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="bg-[#0c0c0c] border border-stone-900 rounded-2xl p-6 relative flex flex-col justify-between hover:border-stone-800 transition-colors group"
            >
              <Quote className="w-8 h-8 text-stone-900 absolute top-4 right-4 group-hover:text-[#D4AF37]/10 transition-colors pointer-events-none" />

              <div className="space-y-4 relative z-10">
                {/* Rating stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>

                <p className="text-stone-300 text-xs md:text-sm leading-relaxed font-light italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Author Info footer */}
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-stone-900">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E75480]/20 border border-[#D4AF37]/30 flex items-center justify-center font-serif text-xs text-white font-bold">
                  {item.avatar}
                </div>
                <div>
                  <h5 className="font-serif text-sm text-stone-200 font-medium">{item.name}</h5>
                  <div className="flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest text-stone-500">
                    <span className={item.role === 'Student' ? 'text-[#E75480]' : 'text-[#D4AF37]'}>
                      {item.role}
                    </span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
