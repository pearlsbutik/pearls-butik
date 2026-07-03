import React from 'react';
import { motion } from 'motion/react';
import { Scissors, Sparkles, Heart, Compass, Star, Smile, Sparkle, RefreshCw } from 'lucide-react';

interface ServicesSectionProps {
  onBookAppointment: () => void;
}

export default function ServicesSection({ onBookAppointment }: ServicesSectionProps) {
  const services = [
    {
      title: "Bridal Wear Couture",
      description: "Magnificent bridal lehengas, heavy designer sarees, and reception gowns. Embellished with premium zardozi, hand-stitched kundan, and pearl embroidery.",
      details: ["Luxury Wedding Lehengas", "Heavy Saree Borders", "Bridal Reception Gowns", "Custom Trousseau Designing"],
      icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600"
    },
    {
      title: "Designer Blouse Stitching",
      description: "Master-crafted blouses with absolute fit guarantees. Specialized in complex pattern layouts, necklines, and luxury handwork fittings.",
      details: ["Princess & Katori Cuts", "Deep Back & High Collar Backs", "Sabyasachi-style Plunging", "Sheer Net & Patch Embroideries"],
      icon: <Scissors className="w-5 h-5 text-[#E75480]" />,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600"
    },
    {
      title: "Custom Dress Stitching",
      description: "Flawless measurements and tailoring of Punjabi suits, anarkalis, kurtis, churidars, and palazzo sets fitted to your unique posture.",
      details: ["Anarkali & Kalidaar Suits", "Tailored Patiala Suits", "Palazzo & Cigarette Pants", "Designer Kurtis & Tunics"],
      icon: <Scissors className="w-5 h-5 text-[#D4AF37]" />,
      image: "https://images.unsplash.com/photo-1528570220961-947990d4f134?q=80&w=600"
    },
    {
      title: "Traditional & Festive Wear",
      description: "Stitch gorgeous traditional dresses for Diwali, Eid, Ganesh Chaturthi, and family puja ceremonies using vibrant ethnic fabrics.",
      details: ["Navratri Chaniya Cholis", "Traditional Ghagras", "Festival Kurti Ensembles", "Custom Silk Sarees Setups"],
      icon: <Star className="w-5 h-5 text-[#E75480]" />,
      image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=600"
    },
    {
      title: "One Piece Dresses & Gowns",
      description: "Modern minimalist to royal dramatic long gowns. Perfect for cocktail nights, anniversaries, and western events.",
      details: ["A-line Evening Gowns", "Western Indo-Western Gowns", "Maternity Gowns", "Modern One-Piece Indo-Westerns"],
      icon: <Heart className="w-5 h-5 text-[#D4AF37]" />,
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600"
    },
    {
      title: "Kids Ethnic Wear",
      description: "Comfort-focused premium kids wear. Lightweight silks and cottons with hidden seams to protect delicate skin.",
      details: ["Kids Lehengas & Gowns", "Infant Ethnic Frocks", "Cute Dhoti-Saras", "Comfort Lining Guarantee"],
      icon: <Smile className="w-5 h-5 text-[#E75480]" />,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600"
    },
    {
      title: "Expert Alterations",
      description: "Transform your loose or unfitted store-bought garments into masterfully tailored outfits with quick turnaround times.",
      details: ["Sizing & Length Adjustments", "Shoulder & Bust Tapering", "Lining Additions", "Zip & Hook Refurbishing"],
      icon: <RefreshCw className="w-5 h-5 text-[#D4AF37]" />,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400"
    },
    {
      title: "Fashion Consultation",
      description: "Speak directly to Pratibha Ingole. Plan fabrics, necklines, colors, and accessories custom-tailored to your skin tone and body type.",
      details: ["Fabric Recommendation", "Silhouette Analysis", "Occasion Designing Blueprint", "Accessory & Drape Tips"],
      icon: <Compass className="w-5 h-5 text-[#E75480]" />,
      image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=400"
    }
  ];

  return (
    <section id="services" className="relative bg-[#F5F2ED] py-24 text-[#111111] border-t border-[#D4AF37]/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08)_0,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase font-bold">
            Signature Stitching & Styling
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#111111]">
            Tailoring <span className="text-[#D4AF37] italic">Services</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-600 text-xs md:text-sm font-light">
            Pearls Butik is synonymous with styling precision. From royal bridal heavywear to minimal modern silhouettes, every piece is sewn to fit your personality.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {services.map((ser, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: (idx % 4) * 0.1, duration: 0.6 }}
              className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:border-[#D4AF37]/65 transition-all group flex flex-col h-full"
            >
              {/* Card Image Cover with overlay */}
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={ser.image}
                  alt={ser.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shadow-sm">
                  {ser.icon}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h4 className="font-serif text-lg text-[#111111] group-hover:text-[#D4AF37] transition-colors">
                    {ser.title}
                  </h4>
                  <p className="text-stone-600 text-xs leading-relaxed font-light">
                    {ser.description}
                  </p>
                  
                  {/* Detailed features */}
                  <ul className="space-y-1.5 pt-2">
                    {ser.details.map((det, dIdx) => (
                      <li key={dIdx} className="text-[11px] text-stone-600 font-light flex items-center gap-2">
                        <Sparkle className="w-2.5 h-2.5 text-[#D4AF37] shrink-0" />
                        <span>{det}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onBookAppointment}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-700 hover:bg-[#111111] hover:text-[#D4AF37] hover:border-[#D4AF37] py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
                >
                  Book fitting / Consult
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Stylist bento teaser banner */}
        <div className="bg-white border border-[#D4AF37]/35 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-serif text-xl text-[#111111]">Need custom dimensions & fabric choice suggestions?</h4>
            <p className="text-stone-600 text-xs font-light max-w-xl">
              Get an instant luxurious dress silhouette proposal. Pratibha's digital styling engine uses fabric properties and posture styles to design the ultimate sketch layout for you.
            </p>
          </div>
          <button
            onClick={onBookAppointment}
            className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-[0_4px_15px_rgba(212,175,55,0.3)] transition-all whitespace-nowrap cursor-pointer"
          >
            Launch AI Stylist
          </button>
        </div>

      </div>
    </section>
  );
}
