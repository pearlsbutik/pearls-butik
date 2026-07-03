import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Heart, Gift, Star } from 'lucide-react';

interface CollectionSectionProps {
  onSelectCollection: (collectionName: string) => void;
}

export default function CollectionSection({ onSelectCollection }: CollectionSectionProps) {
  const collections = [
    {
      title: "Bridal Collection",
      tag: "Royal Heavies",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800",
      description: "Opulent crimson silk lehengas with gold-threaded handwork.",
      gridClass: "lg:col-span-8 lg:row-span-2",
      icon: <Star className="w-4 h-4 text-[#D4AF37]" />
    },
    {
      title: "Festival Collection",
      tag: "Celebration Special",
      image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=600",
      description: "Chaniya cholis and layered kalidaar suits in vibrant ethnic hues.",
      gridClass: "lg:col-span-4 lg:row-span-1",
      icon: <Gift className="w-4 h-4 text-[#E75480]" />
    },
    {
      title: "Designer Picks",
      tag: "Pratibha's Signature",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600",
      description: "Curated blouse neckline trends with kundan hand borders.",
      gridClass: "lg:col-span-4 lg:row-span-1",
      icon: <Sparkles className="w-4 h-4 text-[#D4AF37]" />
    },
    {
      title: "Latest Collection",
      tag: "Summer Ethno-Chic",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600",
      description: "Light pastel organzas and sheer georgettes.",
      gridClass: "lg:col-span-6 lg:row-span-1",
      icon: <Sparkles className="w-4 h-4 text-[#E75480]" />
    },
    {
      title: "Trending Designs",
      tag: "Indo-Western",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600",
      description: "Saree-gowns and palazzo sets popular in modern Maharashtrian weddings.",
      gridClass: "lg:col-span-6 lg:row-span-1",
      icon: <Heart className="w-4 h-4 text-[#D4AF37]" />
    }
  ];

  return (
    <section id="collections" className="relative bg-[#F5F2ED] py-24 text-[#111111] border-t border-[#D4AF37]/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase flex items-center justify-center gap-2 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Seasonal Lookbook
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#111111]">
            Curated <span className="text-[#D4AF37] italic">Collections</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-600 text-xs md:text-sm font-light">
            Drape yourself in luxury. Explore our distinct hand-crafted boutique lines, custom assembled for grand festivities and bridal timelines.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[240px]">
          {collections.map((col, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.6 }}
              onClick={() => onSelectCollection(col.title)}
              className={`relative rounded-3xl overflow-hidden border border-[#D4AF37]/20 bg-[#121212] group cursor-pointer ${col.gridClass} flex flex-col justify-end p-6 hover:border-[#D4AF37]/65 transition-all shadow-md hover:shadow-xl`}
            >
              {/* Cover Image */}
              <div className="absolute inset-0 overflow-hidden bg-neutral-900">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Visual shade overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90" />
              </div>

              {/* Floating top tag */}
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#D4AF37]/20 text-[10px] font-mono tracking-widest uppercase text-stone-800 shadow-sm font-bold">
                {col.icon}
                <span>{col.tag}</span>
              </div>

              {/* Card content aligned to bottom */}
              <div className="relative z-10 space-y-2 max-w-md">
                <h4 className="font-serif text-lg md:text-xl text-white group-hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                  {col.title}
                </h4>
                <p className="text-stone-300 text-xs font-light leading-relaxed">
                  {col.description}
                </p>
                
                {/* Arrow link reveal */}
                <div className="flex items-center gap-1 text-[#D4AF37] text-[10px] uppercase font-mono tracking-widest font-bold pt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all">
                  <span>Inquire fitting options</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
