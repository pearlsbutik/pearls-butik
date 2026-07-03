import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Calendar, Clock, ArrowRight, Sparkle } from 'lucide-react';
import { BlogPost } from '../types';

export default function BlogSection() {
  const posts: BlogPost[] = [
    {
      id: 'b1',
      title: '5 Secrets to the Perfect Sweetheart Neckline Blouse',
      excerpt: 'Achieving a plunging sweetheart neckline that doesn’t slip or buckle requires precise math. Pratibha Ingole explains the sewing architecture.',
      content: 'Necklines define the posture of your saree drape. For sweethearts, the central depth must align with the bust apex within a 0.5-inch ease, supported by heavy canvas fusing rather than simple thread bias strips.',
      category: 'Blouse Designing',
      date: 'June 28, 2026',
      readTime: '4 Min Read',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600'
    },
    {
      id: 'b2',
      title: 'Silk vs Organza: Selecting Festive Fabrics with Great Falls',
      excerpt: 'Stitching an Anarkali suit? Choosing the correct fabric weight defines whether your skirt flares majestically or hangs loosely.',
      content: 'Silk carries a structural weight that holds pleats, while Organza provides airy volume suitable for high-society panel flares. Mix silk linings under organza outer layers for the perfect visual balance.',
      category: 'Fabric Knowledge',
      date: 'May 15, 2026',
      readTime: '6 Min Read',
      image: 'https://images.unsplash.com/photo-1528570220961-947990d4f134?q=80&w=600'
    },
    {
      id: 'b3',
      title: 'Navigating Bridal Trends: Moving Beyond Sabyasachi Crimson Red',
      excerpt: 'Modern Maharashtrian brides are exploring champagne gold, royal velvet wines, and powder pastels for their wedding look.',
      content: 'Pastels offer a refreshing contrast in morning events under natural daylight, while deep wines or emerald green velvets look rich during reception spotlights. Coordinate your lehenga borders with warm gold lace.',
      category: 'Styling Tips',
      date: 'April 09, 2026',
      readTime: '5 Min Read',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600'
    }
  ];

  return (
    <section id="blog" className="relative bg-[#090909] py-24 text-white border-t border-stone-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(231,84,128,0.01)_0,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#E75480] text-xs font-mono tracking-[0.25em] uppercase flex items-center justify-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            Pratibha’s Design Journal
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-white">
            Fashion <span className="text-[#D4AF37] italic">Tips Blog</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-400 text-xs md:text-sm font-light">
            Stay updated with expert styling guides, sewing masterclasses summaries, and fabric draping tips written directly by our founder.
          </p>
        </div>

        {/* Blog Post Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="bg-[#0c0c0c] border border-stone-900 rounded-2xl overflow-hidden hover:border-stone-800 transition-colors flex flex-col justify-between group"
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-black/75 backdrop-blur-sm border border-stone-800 text-[9px] uppercase font-mono tracking-widest text-[#D4AF37] px-3 py-1.5 rounded-full font-medium">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {post.readTime}
                    </span>
                  </div>

                  <h4 className="font-serif text-base text-stone-200 group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-stone-400 text-xs leading-relaxed font-light">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read more footer */}
                <div className="pt-4 border-t border-stone-900 flex items-center gap-1.5 text-xs text-[#E75480] font-mono uppercase tracking-widest font-semibold group-hover:text-[#D4AF37] transition-colors">
                  <span>Read full entry</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
