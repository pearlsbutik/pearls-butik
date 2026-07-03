import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = '9511668617';
    const encodedText = encodeURIComponent(
      message.trim() || 'Hello Pearls Butik, I would like to inquire about your custom dress stitching and designing classes!'
    );
    window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div id="whatsapp-widget" className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-72 bg-[#0d0d0d] border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] p-4 text-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-serif font-bold text-sm">
                    PI
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Pratibha Ingole</h4>
                  <p className="text-[10px] text-stone-800">Online | Chief Designer</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-black/10 rounded-full cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto bg-[#0a0a0a] text-xs">
              <div className="bg-[#141414] text-stone-300 p-3 rounded-2xl rounded-tl-none border border-stone-900 leading-relaxed">
                Namaste! Welcome to <strong>Pearls Butik</strong>. 🌸 
                <br /><br />
                How can I assist you today? 
                Whether you need a custom bridal dress, designer blouse, or want to join our fashion classes, I am here to help!
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-3 bg-[#0a0a0a] border-t border-stone-900 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-stone-900 text-white rounded-full px-3 py-2 text-xs border border-stone-800 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:opacity-90 p-2 rounded-full text-black transition-opacity cursor-pointer"
                aria-label="Send WhatsApp message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-full shadow-[0_8px_24px_rgba(34,197,94,0.3)] flex items-center justify-center cursor-pointer relative"
        aria-label="Open WhatsApp chat support"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E75480] text-[8px] font-bold flex items-center justify-center text-white animate-bounce">
          1
        </span>
      </motion.button>
    </div>
  );
}
