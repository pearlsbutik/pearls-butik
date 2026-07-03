import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Users, Star, Award, GraduationCap, Target, Eye } from 'lucide-react';

export default function AboutSection() {
  const highlights = [
    {
      icon: <Award className="w-5 h-5 text-[#D4AF37]" />,
      title: "Women's Fashion Specialists",
      description: "Expertly tailored silhouettes engineered exclusively for women's apparel from traditional Indian ethnics to western gowns."
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-[#D4AF37]" />,
      title: "Creative Fashion Academy",
      description: "Parbhani's premier dress designing academy offering hand-on cutting, drafting, and stitching certifications."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />,
      title: "10+ Years Legacy",
      description: "Founded and led by Pratibha Ingole, providing premium garment finishings and bespoke design consultation."
    },
    {
      icon: <Users className="w-5 h-5 text-[#D4AF37]" />,
      title: "Experienced Faculty",
      description: "Individual attention in small batches with real-world practical client garments and live design projects."
    }
  ];

  const timelineEvents = [
    { year: '2016', title: 'The Genesis', desc: 'Pratibha Ingole opens Pearls Butik in Parbhani, Maharashtra with a mission to bring premium tailor-cut ladies ethnic dresses.' },
    { year: '2019', title: 'Dress Designing Institute Launch', desc: 'Expanding from boutique to academy, introducing structured vocational classes for women seeking financial independence.' },
    { year: '2022', title: '1000+ Alumni Milestone', desc: 'Honored as the leading local institute for skilled fashion development and creative pattern drafting.' },
    { year: '2026', title: 'The Digital Atelier', desc: 'Integrating high-end tech-driven couture consultations and welcoming students from neighboring regions.' }
  ];

  return (
    <section id="about" className="relative bg-[#F5F2ED] py-24 text-[#111111] overflow-hidden border-t border-[#D4AF37]/25">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-24">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase font-bold">
            Our Legacy & Story
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#111111]">
            About <span className="text-[#D4AF37] italic">Pearls Butik</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-600 text-xs md:text-sm font-light">
            An elite combination of a high-fashion boutique and an authorized dress designing institute. Masterminded by chief designer Pratibha Ingole.
          </p>
        </div>

        {/* Part 1: Owner Profile Section - Pratibha Ingole */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#D4AF37] to-[#8A6B0E] rounded-3xl blur-md opacity-20 group-hover:opacity-35 transition-all duration-500" />
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-[#D4AF37]/35 bg-white p-2">
              <div className="w-full h-full overflow-hidden rounded-[1.4rem] relative">
                <img
                  src="/src/assets/images/pratibha_ingole_1783094406828.jpg"
                  alt="Pratibha Ingole - Owner of Pearls Butik"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[#D4AF37] font-serif text-xl font-semibold">Pratibha Ingole</p>
                  <p className="text-[10px] text-stone-300 font-mono tracking-widest uppercase mt-0.5">Founder & Creative Director</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-[#D4AF37] text-xs uppercase font-mono tracking-widest font-bold">Behind the Scissors</span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#111111] font-light tracking-wide leading-tight">
              Crafting Confidence Through Precision Tailoring
            </h3>
            
            <p className="text-stone-700 text-sm font-light leading-relaxed">
              Founded by <strong>Pratibha Ingole</strong>, Pearls Butik began in Parbhani as a dream to create impeccable customized clothing that fits like a second skin. Pratibha believes that fashion is not just about expensive fabrics, but about the math behind pattern cutting, the precision of seams, and the soul inside the stitching.
            </p>
            <p className="text-stone-600 text-sm font-light leading-relaxed">
              Recognizing a massive gap in professional skill-based training for women, she established the <strong>Pearls Dress Designing Institute</strong>. Today, the academy empowers hundreds of women yearly with financial sovereignty, teaching them advanced blouse patterns, dress drafting, and complete boutique setup skills.
            </p>

            {/* Signature Quote */}
            <div className="border-l-4 border-[#D4AF37] bg-white border border-[#D4AF37]/15 p-5 rounded-r-xl italic text-xs text-stone-700 leading-relaxed max-w-xl shadow-sm">
              "We don't just cut cloth; we architecture dreams. Every seam we stitch is a promise of quality, and every student we train is a step towards self-reliant women entrepreneurs."
              <span className="block mt-2 font-mono text-[9px] uppercase tracking-wider text-[#D4AF37] font-bold not-italic">— Pratibha Ingole</span>
            </div>
          </div>
        </div>

        {/* Part 2: Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all group space-y-4 shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-xl text-[#111111] font-medium">Our Mission</h4>
            <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-light">
              To provide bespoke, premium boutique wear of unmatched standard while educating and mentoring the next generation of fashion designers and dressmakers with industry-recognized entrepreneurship skills.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all group space-y-4 shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-xl text-[#111111] font-medium">Our Vision</h4>
            <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-light">
              To establish Pearls Butik as Parbhani's ultimate benchmark of clothing refinement, creating a sustainable ecosystem of women-led boutique start-ups across Maharashtra.
            </p>
          </div>
        </div>

        {/* Part 3: Highlights Grid (Why Choose Us) */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-widest uppercase font-bold">The Pearls Guarantee</span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#111111]">Why Choose Pearls Butik?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 hover:shadow-md transition-all space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/20">
                  {item.icon}
                </div>
                <h5 className="font-serif text-base text-[#111111] font-medium">{item.title}</h5>
                <p className="text-stone-600 text-xs leading-relaxed font-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Part 4: Story Timeline */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-widest uppercase font-bold">Chronicle of Style</span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#111111]">Our Decadal Journey</h3>
          </div>

          <div className="relative border-l border-stone-300 ml-4 md:ml-12 space-y-8 max-w-4xl mx-auto">
            {timelineEvents.map((ev, idx) => (
              <div key={idx} className="relative pl-8 group">
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-stone-300 group-hover:bg-[#D4AF37] border border-[#F5F2ED] group-hover:scale-125 transition-all" />
                
                <div className="space-y-1">
                  <span className="text-[#D4AF37] font-serif text-lg font-bold">{ev.year}</span>
                  <h5 className="font-serif text-base text-[#111111] font-medium">{ev.title}</h5>
                  <p className="text-stone-600 text-xs leading-relaxed font-light">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
