import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Fingerprint, ScanFace, ShieldCheck, ArrowRight, UserPlus, MapPin, Briefcase, FileSpreadsheet, Calendar, User, CheckCircle2, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoginPage({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [loginStep, setLoginStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  
  // Generic Handlers
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone) setLoginStep('otp');
  };

  return (
    <div className="w-full h-screen bg-[#0A0E17] flex items-center justify-center relative overflow-hidden font-body text-white p-4">
      {/* Background Ambient Glows */}
      <div className="absolute top-[10%] -left-32 w-[500px] h-[500px] bg-[#4EDE63]/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className={cn(
          "relative z-10 w-full transition-all duration-500", 
          isRegistering ? "max-w-4xl" : "max-w-md"
        )}
      >
        <div className="bg-[#181B25]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Edge Highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#4EDE63]/50 to-transparent"></div>
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#181B25] to-[#0A0E17] border border-white/5 flex items-center justify-center shadow-xl relative group">
                <div className="absolute inset-0 bg-[#4EDE63]/20 rounded-xl blur-lg group-hover:bg-[#4EDE63]/30 transition-colors"></div>
                <ShieldCheck className="w-6 h-6 text-[#4EDE63] relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-br from-[#4EDE63] to-[#009264] bg-clip-text text-transparent font-manrope tracking-tight">Sahayak</h1>
                <p className="text-gray-400 font-label text-[10px] uppercase tracking-[0.15em] font-bold">
                  {isRegistering ? "One-Time Onboarding" : "Returning User"}
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-[#0A0E17]/60 border border-white/5 rounded-lg px-3 py-2 cursor-pointer hover:border-white/10 transition-colors">
              <Globe className="w-4 h-4 text-gray-400" />
              <select className="bg-transparent text-xs font-semibold text-gray-300 outline-none cursor-pointer appearance-none">
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isRegistering ? (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* LOGIN SCREEN */}
                <form onSubmit={loginStep === 'phone' ? handleSendOtp : handleAuthSubmit} className="space-y-5">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Smartphone className="h-5 w-5 text-gray-500 group-focus-within:text-[#4EDE63] transition-colors" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#4EDE63]/50 focus:border-[#4EDE63]/50 transition-all font-inter text-sm"
                      placeholder="Enter Mobile Number (Primary ID)"
                    />
                  </div>

                  {loginStep === 'otp' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="relative group"
                    >
                      <input
                        type="text"
                        required
                        className="block w-full text-center tracking-[1em] font-bold text-xl py-4 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#4EDE63]/50 focus:border-[#4EDE63]/50 transition-all"
                        placeholder="••••"
                        maxLength={4}
                      />
                      <p className="text-[10px] text-center text-[#4EDE63] mt-2 font-bold uppercase tracking-wider cursor-pointer hover:underline">Resend OTP</p>
                    </motion.div>
                  )}

                  {loginStep === 'phone' ? (
                    <div className="flex flex-col gap-3 mt-6">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl font-bold text-sm bg-surface-container-highest text-white border border-white/10 hover:bg-white/10 transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                        Request OTP SMS
                      </button>
                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-semibold uppercase tracking-widest">OR USE BIOMETRICS</span>
                        <div className="flex-grow border-t border-white/10"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={handleAuthSubmit} className="flex items-center justify-center gap-2 py-3.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                          <ScanFace className="w-5 h-5" />
                          <span className="text-xs font-bold">Face ID</span>
                        </button>
                        <button type="button" onClick={handleAuthSubmit} className="flex items-center justify-center gap-2 py-3.5 bg-[#4EDE63]/10 border border-[#4EDE63]/30 text-[#4EDE63] rounded-xl hover:bg-[#4EDE63]/20 transition-all shadow-[0_0_15px_rgba(78,222,99,0.1)]">
                          <Fingerprint className="w-5 h-5" />
                          <span className="text-xs font-bold">Thumbprint</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <SubmitButton loading={loading} text="Verify & Secure Login" />
                  )}
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                  <p className="text-gray-400 text-sm font-medium">
                    New to Sahayak?{' '}
                    <button onClick={() => setIsRegistering(true)} className="text-[#4EDE63] font-bold hover:underline">
                      Create an Account
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* REGISTRATION SCREEN (ONBOARDING) */}
                <form onSubmit={handleAuthSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Section: Personal Identity */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><User className="w-4 h-4 text-indigo-400" /> Personal Identity</h3>
                      <input type="text" required placeholder="Full Name" className="w-full px-4 py-3.5 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <input type="tel" required placeholder="Phone Number (AES-Encrypted)" className="w-full px-4 py-3.5 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-indigo-400/50 text-gray-300" />
                        <input type="date" required className="w-full px-4 py-3.5 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-indigo-400/50 text-gray-400" />
                      </div>
                      
                      <select required className="w-full px-4 py-3.5 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-indigo-400/50 text-gray-400 appearance-none">
                        <option value="">Gender...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Section: KYC Primary */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Primary KYC</h3>
                      <input type="text" required placeholder="Aadhaar Number (AES-Encrypted in Backend)" className="w-full px-4 py-3.5 bg-[#0A0E17]/60 border border-white/5 border-l-4 border-l-emerald-400/50 rounded-xl text-sm outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 font-mono tracking-widest" />
                      <input type="text" placeholder="PAN Number (Optional)" className="w-full px-4 py-3.5 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-emerald-400/50 font-mono tracking-widest uppercase" />
                    </div>

                    {/* Section: Rural Identifiers */}
                    <div className="space-y-4 md:col-span-2">
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-orange-400" /> Rural Location & Work</h3>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <select required className="w-full px-4 py-3 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-orange-400/50 text-gray-400 appearance-none">
                            <option value="">Occupation...</option>
                            <option value="farmer">Farmer</option>
                            <option value="artisan">Artisan</option>
                            <option value="tailor">Tailor</option>
                            <option value="shopkeeper">Shopkeeper</option>
                            <option value="laborer">Daily Laborer</option>
                          </select>
                          <input type="text" required placeholder="State" className="w-full px-4 py-3 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-orange-400/50" />
                          <input type="text" required placeholder="District" className="w-full px-4 py-3 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-orange-400/50" />
                          <input type="text" required placeholder="Village Map / PIN" className="w-full px-4 py-3 bg-[#0A0E17]/60 border border-white/5 rounded-xl text-sm outline-none focus:border-orange-400/50" />
                       </div>
                    </div>
                    
                    {/* Section: Self-Declared Assets */}
                    <div className="space-y-4 md:col-span-2 pt-2 border-t border-white/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-4 h-4 text-amber-400" /> Self-Declarations</h3>
                        <button type="button" onClick={() => alert('Appends new input row for self-declared asset tracking...')} className="text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20 transition-colors py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                          <span>+ Add Asset</span>
                          <span className="opacity-70 text-[10px] uppercase font-bold tracking-wider">(e.g., 20 goats)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Concent Checkbox */}
                  <div className="bg-[#4EDE63]/5 border border-[#4EDE63]/20 rounded-xl p-5 flex items-start gap-4 mt-6">
                     <div className="pt-0.5">
                       <input required type="checkbox" id="uli-consent" className="w-5 h-5 accent-[#4EDE63] bg-[#0A0E17] border-white/20 rounded cursor-pointer" />
                     </div>
                     <label htmlFor="uli-consent" className="text-sm text-gray-300 leading-relaxed cursor-pointer font-medium">
                       I consent strictly to Sahayak fetching my Land Records and UPI transaction history via the <strong className="text-[#4EDE63]">Unified Lending Interface (ULI)</strong> for credit assessment purposes.
                     </label>
                  </div>

                  <SubmitButton loading={loading} text="Complete Secured Registration" />

                  <div className="mt-6 text-center border-t border-white/5 pt-6">
                    <p className="text-gray-400 text-sm font-medium">
                      Already registered?{' '}
                      <button type="button" onClick={() => setIsRegistering(false)} className="text-[#4EDE63] font-bold hover:underline">
                        Return to Login
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function SubmitButton({ loading, text }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-[#0A0E17] bg-gradient-to-r from-[#4EDE63] to-[#009264] hover:shadow-[0_0_25px_rgba(78,222,99,0.4)] transition-all overflow-hidden uppercase tracking-widest mt-6",
        loading ? "opacity-80 cursor-wait" : "hover:scale-[1.01]"
      )}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-[#0A0E17]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {text}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </button>
  );
}
