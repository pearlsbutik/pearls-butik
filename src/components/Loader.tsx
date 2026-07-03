import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 800); // Allow exit transition to finish
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="boutique-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090909] text-white"
        >
          {/* Ambient Glowing Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-rose-500/5 blur-[100px] rounded-full" />
          </div>

          {/* Logo Container */}
          <div className="relative flex flex-col items-center justify-center px-4 text-center max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-72 h-72 mb-6"
            >
              <Logo showText={false} />
            </motion.div>

            {/* Title / Slogan with elegant reveal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-2"
            >
              <h1 className="font-serif text-3xl tracking-[0.25em] font-light text-white uppercase">
                PEARLS <span className="text-[#D4AF37] font-normal">BUTIK</span>
              </h1>
              <p className="text-[#E75480] text-xs tracking-[0.3em] uppercase font-mono">
                PRATIBHA INGOLE
              </p>
              <p className="text-neutral-500 text-[10px] tracking-widest mt-1 font-light italic">
                Stitch Your Style, Wear Your Confidence
              </p>
            </motion.div>

            {/* Elegant luxury loading bar */}
            <div className="w-48 h-[2px] bg-neutral-800 mt-8 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
