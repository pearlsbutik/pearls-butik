import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MapPin, Calendar, Clock, CheckCircle2, MessageSquare, Compass, Award } from 'lucide-react';

interface ContactSectionProps {
  initialServicePreset?: string;
}

export default function ContactSection({ initialServicePreset = '' }: ContactSectionProps) {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [service, setService] = useState(initialServicePreset || 'Designer Blouse Stitching');
  const [message, setMessage] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [error, setError] = useState('');

  // Update preset if it changes externally
  React.useEffect(() => {
    if (initialServicePreset) {
      setService(initialServicePreset);
    }
  }, [initialServicePreset]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !service) {
      setError('Please fill in your Name, Phone Number, and select a Service.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, date, service, message }),
      });

      if (!response.ok) {
        throw new Error('Our scheduling system is currently busy. Please call +91 9511668617 directly.');
      }

      const data = await response.json();
      if (data.success) {
        setSuccessData(data.appointment);
        // Clear Form
        setName('');
        setEmail('');
        setPhone('');
        setDate('');
        setMessage('');
      } else {
        throw new Error(data.error || 'Booking failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const servicesList = [
    'Bridal Wear Couture',
    'Designer Blouse Stitching',
    'Custom Dress Stitching',
    'Traditional & Festive Wear',
    'One Piece Dresses & Gowns',
    'Basic Dress Designing Course',
    'Advanced Dress Designing Course',
    'Specialized Blouse Designing Course',
    'Couture Business Master Course',
    'General Fashion Consultation'
  ];

  return (
    <section id="contact" className="relative bg-[#070707] py-24 text-white border-t border-stone-900">
      <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#E75480] text-xs font-mono tracking-[0.25em] uppercase flex items-center justify-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            Atelier Fittings
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-wide text-white">
            Book <span className="text-[#D4AF37] italic">Appointment</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          <p className="text-stone-400 text-xs md:text-sm font-light">
            Plan your custom measurement fitting session or reserve your bench in our next academy batch. Direct coordination with Pratibha Ingole.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left: Contact Info & Mock Map */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-serif text-2xl tracking-wide text-white">
                Pearls Butik Studio
              </h3>

              {/* Info Elements */}
              <div className="space-y-4 text-xs md:text-sm font-light">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-stone-800 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-white font-medium mb-0.5">Location Address</h5>
                    <p className="text-stone-400">Pearls Butik, Sinchan Nagar, Parbhani - 431401</p>
                    <p className="text-[#E75480] font-mono text-[10px] uppercase mt-0.5 tracking-wider">Maharashtra, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-stone-800 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-white font-medium mb-0.5">Telephone & WhatsApp</h5>
                    <p className="text-stone-400">+91 9511668617</p>
                    <p className="text-stone-500 text-[10px] uppercase font-mono tracking-wider">Pratibha Ingole (Primary)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-stone-800 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-white font-medium mb-0.5">Email Support</h5>
                    <p className="text-stone-400">pearlsbutik@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-stone-800 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-white font-medium mb-0.5">Studio Operating Hours</h5>
                    <p className="text-stone-400">Monday - Saturday: 10:00 AM - 08:30 PM</p>
                    <p className="text-[#D4AF37] text-[10px] uppercase font-mono tracking-wider mt-0.5">Sunday: By Fitting Appointment Only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Interactive Mock Map vector of Sinchan Nagar, Parbhani */}
            <div className="h-56 rounded-2xl border border-stone-900 bg-[#0d0d0d] overflow-hidden relative shadow-inner p-4 flex flex-col justify-between group">
              {/* Decorative grid representing map roads */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-stone-600" />
                <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-stone-600" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#D4AF37]" />
                <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-stone-600" />
                <div className="absolute left-3/4 top-0 bottom-0 w-[1px] bg-stone-600" />
                {/* Curved lanes */}
                <div className="absolute top-4 left-4 w-44 h-44 rounded-full border border-dashed border-stone-700" />
              </div>

              {/* Map pin */}
              <div className="absolute top-[45%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-[#E75480] absolute -top-1 animate-ping" />
                <MapPin className="w-8 h-8 text-[#D4AF37] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform cursor-pointer" />
                <span className="bg-black/90 backdrop-blur-md text-[9px] font-mono uppercase text-white tracking-widest px-2 py-1 rounded border border-[#D4AF37]/30 mt-1 whitespace-nowrap shadow-lg">
                  PEARLS BUTIK
                </span>
              </div>

              {/* Bottom tag details */}
              <div className="relative z-10 flex justify-between items-end mt-auto text-[10px] text-stone-500 font-mono tracking-wider">
                <span>SINCHAN NAGAR, PARBHANI</span>
                <a
                  href="https://maps.google.com/?q=Sinchan+Nagar,+Parbhani"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>

          {/* Right: Appointment booking form / success ticket */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-stone-900 rounded-3xl p-6 md:p-10 shadow-lg relative flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
              {!successData ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleBooking}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg text-white">Fittings Schedule Request</h4>
                    <p className="text-stone-500 text-xs">Fill in your preferred coordinates, and we will follow up via phone to confirm your custom measurements hour.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-950/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* Name and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., Anjali Deshmukh"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#141414] text-white border border-stone-800 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-stone-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400">WhatsApp / Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="E.g., 9511668617"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#141414] text-white border border-stone-800 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-stone-700"
                      />
                    </div>
                  </div>

                  {/* Email & Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400">Email Address <span className="text-stone-600 font-normal">(Optional)</span></label>
                      <input
                        type="email"
                        placeholder="E.g., client@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#141414] text-white border border-stone-800 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-stone-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400">Preferred Fitting Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-[#141414] text-white border border-stone-800 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] transition-colors text-stone-400"
                      />
                    </div>
                  </div>

                  {/* Service type drop down */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400">Select Desired Service</label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full bg-[#141414] text-white border border-stone-800 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] transition-colors text-stone-300"
                    >
                      {servicesList.map((ser) => (
                        <option key={ser} value={ser}>{ser}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message / Design details */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400">Styling Instructions / Batch Query</label>
                    <textarea
                      placeholder="Tell us about your fabric choice, specific occasion dates, or any designing course batches preferences..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-[#141414] text-white border border-stone-800 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] transition-colors resize-none placeholder-stone-700"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing reservation details...' : 'Confirm Fitting Appointment Slot'}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 text-center py-6"
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/5 border border-green-500/20 flex items-center justify-center text-green-500 animate-bounce">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl text-white">Fitting Appointment Confirmed!</h3>
                    <p className="text-stone-400 text-xs md:text-sm max-w-md mx-auto">
                      Thank you for choosing <strong>Pearls Butik</strong>. Pratibha Ingole has reserved a slot for your creative session.
                    </p>
                  </div>

                  {/* Custom Ticket Receipt Detail Card */}
                  <div className="border border-[#D4AF37]/35 rounded-2xl bg-black/50 p-6 text-left max-w-md mx-auto relative overflow-hidden space-y-4">
                    {/* Golden ticket header */}
                    <div className="flex justify-between items-center border-b border-stone-900 pb-3">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-[#D4AF37] tracking-widest">Atelier Pass</span>
                        <p className="font-serif text-stone-200 text-sm">Pearls Butik Fitting</p>
                      </div>
                      <span className="text-[#E75480] font-mono text-xs font-bold px-2 py-1 bg-[#E75480]/5 rounded border border-[#E75480]/20">
                        {successData.id}
                      </span>
                    </div>

                    {/* Receipt Details */}
                    <div className="space-y-2.5 text-xs font-light">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Client Name:</span>
                        <span className="text-stone-200 font-medium">{successData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Coordinate Phone:</span>
                        <span className="text-stone-200">{successData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Service Area:</span>
                        <span className="text-[#D4AF37] font-medium">{successData.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Fitting Date:</span>
                        <span className="text-stone-200">{successData.date || 'TBD (We will call you)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Slot Status:</span>
                        <span className="text-green-400 flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                          Confirmed
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-900 flex items-center gap-2 text-[10px] text-stone-500 leading-relaxed italic">
                      <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>Please carry any fabrics/designs you wish to drape.</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSuccessData(null)}
                    className="text-xs text-stone-500 hover:text-white transition-colors uppercase tracking-widest border-b border-stone-800 pb-1 cursor-pointer"
                  >
                    Schedule another fitting slot
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
