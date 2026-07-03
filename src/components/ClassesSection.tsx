import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Award, Calendar, BookOpen, CheckCircle, ChevronRight, Check } from 'lucide-react';

interface ClassesSectionProps {
  onEnroll: (courseName: string) => void;
}

export default function ClassesSection({ onEnroll }: ClassesSectionProps) {
  const courses = [
    {
      title: "Basic Dress Designing Course",
      duration: "2 Months",
      level: "Beginner",
      desc: "For absolute beginners. Master the core mechanics of sewing, fabric properties, body measurements math, and cutting straight outfits like salwars and simple kurtis.",
      curriculum: ["Machine Operation & Care", "Straight Cutting & Stitching", "Basic Necklines & Facing", "Simple Salwar Suits & Leggings"],
      badge: "Self-Paced"
    },
    {
      title: "Advanced Dress Designing Course",
      duration: "3 Months",
      level: "Intermediate",
      desc: "Elevate your design precision. Dive into complex styling patterns like Anarkali suits, custom drapes, Western crop tops, collars, and professional pleating.",
      curriculum: ["Kalidaar & Anarkali Cuts", "Collar Patterns & Cowls", "Indo-Western Crop Tops", "Custom Drapes & Pleating"],
      badge: "Popular"
    },
    {
      title: "Blouse Designing Special Course",
      duration: "1.5 Months",
      level: "Specialization",
      desc: "A highly demanded, specialized course focusing on the architectural engineering of ladies blouses. Master princess cuts, katori fits, deep backs, and pad placement.",
      curriculum: ["Princess & Sabyasachi Cuts", "Deep Neck Fit Adjustment", "Padded Blouse Formulation", "Dori, Tassels & Back Detailing"],
      badge: "Hot Choice"
    },
    {
      title: "Pattern Making Course",
      duration: "1.5 Months",
      level: "Skill Focus",
      desc: "Learn to build professional paper layouts before cutting fabric. This minimizes material waste and creates perfect design symmetry. Essential for custom styling.",
      curriculum: ["Drafting on Craft Paper", "Bust & Waist Ease Math", "Sleeve Hole Calculation", "Grade Sizing Adjustments"],
      badge: "Core Skill"
    },
    {
      title: "Cutting & Stitching Course",
      duration: "2 Months",
      level: "Practical Core",
      desc: "A pure hands-on practice course designed to master clean fabric cutting ratios, lining attachments, interlock seam finishing, and professional stitching details.",
      curriculum: ["Fabric Fold Optimization", "Lining & Facing Attachment", "Piping & Edge Seaming", "Interlocking Finishing"],
      badge: "Most Popular"
    },
    {
      title: "Fabric Knowledge & Finishing",
      duration: "1 Month",
      level: "Skill Focus",
      desc: "Understand various fabric characteristics, stretch properties, drape flows, fall behaviors, and premium finishing touches like professional ironing and invisible stitches.",
      curriculum: ["Fabric Grain & Weave Behavior", "Drape & Fall Calculations", "Invisible Stitching (Hemming)", "Professional Steam Creasing"],
      badge: "Essential"
    },
    {
      title: "Complete Professional Course (6 Months)",
      duration: "6 Months",
      level: "Career Master",
      desc: "Our comprehensive, premier business program. Combines advanced stitching, bridal heavywear, boutique catalog designing, costing, client handling, and shop licensing guide.",
      curriculum: ["Bespoke Bridal Wear", "Heavy Zardozi Embellishments", "Costing & Boutique Licensing", "Direct Live Client Projects"],
      badge: "Business Suite"
    }
  ];

  const benefits = [
    "Authorized Course Certification",
    "Small Batch Limits (Max 10-12) for Individual Attention",
    "100% Practical Hands-On Learning",
    "Pratibha Ingole's Exclusive Designing Secrets",
    "Full Boutique Business Support & Setup Guidance",
    "Affordable Fees with Flexible Installments",
    "Live Projects using Boutique Clients Designs",
    "Free Fabric Sourcing & Sewing Kit Guide"
  ];

  return (
    <section id="classes" className="relative bg-[#F5F2ED] py-24 text-[#111111] border-t border-[#D4AF37]/25">
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-20">
        
        {/* Hero Section of classes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase flex items-center gap-2 font-bold">
              <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
              Pearls Dress Designing Institute
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-wide leading-tight text-[#111111]">
              Stitch Your Own <br />
              <span className="text-[#D4AF37] italic">Fashion Empire</span>
            </h2>
            <div className="w-16 h-0.5 bg-[#D4AF37] mb-4" />
            <p className="text-stone-700 text-sm font-light leading-relaxed">
              Why rely on store-bought outfits when you can draft, cut, and sew your own custom clothing? Our institute has helped over <strong>1500+ ladies</strong> learn the art of professional dress designing, converting passion into highly profitable boutique businesses.
            </p>
            
            {/* Quick specifications */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 font-mono text-xs">
              <div className="border-l-2 border-[#D4AF37] pl-3 space-y-1">
                <p className="text-stone-500 uppercase tracking-widest text-[9px]">Batches</p>
                <p className="text-[#111111] font-bold">Morning & Evening</p>
              </div>
              <div className="border-l-2 border-[#D4AF37] pl-3 space-y-1">
                <p className="text-stone-500 uppercase tracking-widest text-[9px]">Class Limit</p>
                <p className="text-[#111111] font-bold">10 Students Only</p>
              </div>
              <div className="border-l-2 border-[#D4AF37] pl-3 space-y-1">
                <p className="text-stone-500 uppercase tracking-widest text-[9px]">Prerequisite</p>
                <p className="text-[#111111] font-bold">No prior sewing needed</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#8A6B0E] rounded-2xl blur-md opacity-25" />
            <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 bg-white p-2">
              <div className="w-full h-full rounded-[0.9rem] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800"
                  alt="Pearls Designing Institute Sewing Classroom"
                  className="w-full aspect-[4/3] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-stone-800 text-[#D4AF37]">
                    Parbhani, Sinchan Nagar
                  </span>
                  <span className="text-black bg-[#D4AF37] px-2 py-0.5 rounded font-mono font-bold">Live Atelier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Catalog Grid */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-widest uppercase font-bold">The Syllabus</span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#111111]">Professional Curriculums</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 hover:border-[#D4AF37]/60 hover:shadow-lg transition-all flex flex-col justify-between group h-full"
              >
                <div className="space-y-4">
                  {/* Badge & Duration */}
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-stone-500 font-bold">{course.level}</span>
                    <span className="text-[#D4AF37] bg-[#D4AF37]/5 px-2.5 py-1 rounded border border-[#D4AF37]/30 font-semibold">
                      {course.duration}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-lg text-[#111111] group-hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                    {course.title}
                  </h4>

                  <p className="text-stone-600 text-xs leading-relaxed font-light">
                    {course.desc}
                  </p>

                  {/* Highlights checklist */}
                  <div className="space-y-2 pt-3 border-t border-stone-100">
                    <p className="text-[9px] font-mono tracking-wider uppercase text-stone-500 font-bold">Key Syllabus Units</p>
                    <ul className="space-y-1.5">
                      {course.curriculum.map((curr, cIdx) => (
                        <li key={cIdx} className="text-[11px] text-stone-700 font-light flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{curr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-100">
                  <button
                    onClick={() => onEnroll(course.title)}
                    className="w-full bg-stone-50 hover:bg-[#111111] text-stone-700 hover:text-[#D4AF37] border border-stone-200 hover:border-[#D4AF37] py-3 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Request Admission details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Panel */}
        <div className="bg-white border border-[#D4AF37]/30 rounded-3xl p-8 md:p-12 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[#D4AF37] text-xs font-mono uppercase tracking-widest font-bold">Why Pearls Academy?</span>
              <h4 className="font-serif text-2xl md:text-3xl text-[#111111]">Student Enrollment Benefits</h4>
              <p className="text-stone-600 text-xs md:text-sm font-light leading-relaxed">
                We believe that premium vocational education must be simple, transparent, and completely empowering. Every student at our Parbhani institute receives expert guidance directly on custom sewing models.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((ben, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="text-stone-700 font-light leading-relaxed">{ben}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
