import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryItem } from '../types';
import { Camera, Eye, Plus, Sparkles } from 'lucide-react';

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Designer Dresses',
    'Bridal Collection',
    'Blouses',
    'Student Work',
    'Boutique Collection',
    'Classroom',
    'Fashion Shows'
  ];

  const galleryItems: GalleryItem[] = [
    {
      id: 'g1',
      title: 'Royal Banarasi Leheriya',
      category: 'Bridal Collection',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
      description: 'Traditional heavy gold-threaded bridal lehenga in deep crimson.'
    },
    {
      id: 'g2',
      title: 'Embroidered Back Blouse',
      category: 'Blouses',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800',
      description: 'Intricate floral motif hand-zardozi with delicate kundan work.'
    },
    {
      id: 'g3',
      title: 'Pastel Organza Gown',
      category: 'Designer Dresses',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800',
      description: 'Elegant sheer pastel pink gown with hand-painted floral borders.'
    },
    {
      id: 'g4',
      title: 'Fashion Illustration Croquis',
      category: 'Student Work',
      image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=800',
      description: 'An advanced pattern pencil sketching layout by our student.'
    },
    {
      id: 'g5',
      title: 'Silk Draping Workshop',
      category: 'Classroom',
      image: 'https://images.unsplash.com/photo-1528570220961-947990d4f134?q=80&w=800',
      description: 'Students learning the science of silk thread density drapes.'
    },
    {
      id: 'g6',
      title: 'Premium Handloom Kurtis',
      category: 'Boutique Collection',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800',
      description: 'Pure cotton summer collection styled with custom floral borders.'
    },
    {
      id: 'g7',
      title: 'Bespoke Evening Saree Gown',
      category: 'Designer Dresses',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800',
      description: 'Indo-western fusion silhouette for modern cocktail events.'
    },
    {
      id: 'g8',
      title: 'Premium Silk Threads Sourcing',
      category: 'Classroom',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600',
      description: 'Interactive fabric identification lessons in progress.'
    },
    {
      id: 'g9',
      title: 'Kanchipuram Silk Bridal Saree',
      category: 'Bridal Collection',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600',
      description: 'Classic crimson red and rich mustard gold weave with customized border lace.'
    }
  ];

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <section id="gallery" className="relative bg-[#F5F2ED] py-24 text-[#111111] border-t border-[#D4AF37]/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(212,175,55,0.06)_0,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#D4AF37] text-xs font-mono tracking-[0.25em] uppercase flex items-center justify-center gap-2 font-bold">
            <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
            Couture Showcase
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-[#111111]">
            Bespoke <span className="text-[#D4AF37] italic">Gallery</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-600 text-xs md:text-sm font-light">
            An illustrative archive of our hand-stitched bridal wear, custom-tailored designer blouses, and the brilliant creations of our dress designing institute alumni.
          </p>
        </div>

        {/* Category Filter Slider Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-2 border-b border-stone-200 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs uppercase tracking-widest px-4 py-2.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black border-[#D4AF37] font-semibold shadow-[0_5px_15px_rgba(212,175,55,0.25)]'
                  : 'bg-white border-stone-200 text-stone-600 hover:text-[#111111] hover:border-stone-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Pinterest Style Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="break-inside-avoid relative rounded-2xl overflow-hidden border border-[#D4AF37]/15 group shadow-md bg-white flex flex-col cursor-pointer hover:border-[#D4AF37]/50 hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="relative overflow-hidden w-full h-auto bg-neutral-50">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Glassmorphic hover details */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6" />
                </div>

                {/* Always visible header, layout detail under image */}
                <div className="p-4 bg-white border-t border-stone-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/25 font-bold">
                      {item.category}
                    </span>
                    <Sparkles className="w-3 h-3 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-serif text-sm text-[#111111] font-medium group-hover:text-[#D4AF37] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 font-light truncate">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
