import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, BadgeCheck, Camera, Users, Keyboard, ArrowUpRight, Mic, ImagePlus, X, Send, Briefcase, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

const services = [
  { id: 'upi', icon: Wallet, title: 'Tatkal Khata', desc: 'Turn your everyday UPI transactions into instant, flexible credit limits.', textColor: 'text-indigo-400', bgBase: 'bg-indigo-500/15', shadow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]' },
  { id: 'subsidy', icon: BadgeCheck, title: 'Yojana Sarathi', desc: 'Talk to our smart agent to instantly find and apply for the right government subsidies.', textColor: 'text-[#4EDE63]', bgBase: 'bg-[#4EDE63]/15', shadow: 'shadow-[0_0_20px_rgba(78,222,99,0.15)]' },
  { id: 'claims', icon: Camera, title: 'Chitra Praman', desc: 'Snap a photo to quickly assess damage and fast-track your insurance claims.', textColor: 'text-rose-400', bgBase: 'bg-rose-500/15', shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' },
  { id: 'trust', icon: Users, title: 'Sahyog Samuh', desc: 'Pool your resources, manage group savings, and build community wealth together.', textColor: 'text-blue-400', bgBase: 'bg-blue-500/15', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
];

const ReasoningToggle = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="mt-4 pt-3 border-t border-white/5">
      <button onClick={() => setIsOpen(!isOpen)} className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 transition-colors">
        <Sparkles className="w-3 h-3" /> {isOpen ? 'Hide Neural Core' : 'View Core Logic'}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mt-3 bg-[#0a0e17] border border-indigo-500/30 rounded-xl p-4 shadow-inner overflow-hidden relative">
             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
             <p className="text-indigo-200/70 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import WidgetFactory from '../components/WidgetFactory';

export default function DiscoveryHub() {
  const [inputMode, setInputMode] = useState('idle'); // 'idle', 'typing', 'listening'
  const [systemAlert, setSystemAlert] = useState('');
  const [keyboardText, setKeyboardText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleKeyboardToggle = () => {
    if (inputMode === 'typing') {
      setInputMode('idle');
      setKeyboardText('');
    } else {
      setInputMode('typing');
    }
  };

  const submitQuery = async (queryPayload) => {
    setInputMode('listening');
    setSystemAlert('Synthesizing responses...');
    
    // Add user query to history
    setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'user', text: queryPayload }]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryPayload, user_id: 'u101', language: 'english' })
      });
      
      const data = await response.json();
      
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.spoken_response,
        reasoning: data.ai_reasoning,
        directive: data.ui_directive,
        genui_data: data.genui_data || {}
      }]);

      if ('speechSynthesis' in window && data.spoken_response) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.spoken_response);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      
      setSystemAlert('');
      setInputMode('idle');
    } catch (e) {
      setSystemAlert('API Connection Failed.');
      setTimeout(() => { setInputMode('idle'); setSystemAlert(''); }, 3000);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!keyboardText.trim()) return;
    const query = keyboardText;
    setKeyboardText('');
    await submitQuery(query);
  };

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleMicToggle = async () => {
    if (inputMode === 'listening') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        setInputMode('listening');
        setSystemAlert('Transcribing spoken audio securely...');
        
        const formData = new FormData();
        formData.append('file', audioBlob, 'record.wav');
        
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          const result = await res.json();
          
          if (result.transcript) {
             setSystemAlert(`Recognized: "${result.transcript}"`);
             setTimeout(() => { submitQuery(result.transcript); }, 1000);
          } else {
             setSystemAlert('No speech detected or API error.');
             setTimeout(() => { setInputMode('idle'); setSystemAlert(''); }, 3000);
          }
        } catch(e) {
             setSystemAlert('Transcriber Connection Error.');
             setTimeout(() => { setInputMode('idle'); setSystemAlert(''); }, 3000);
        }
      };
      
      mediaRecorder.start();
      setInputMode('listening');
      setSystemAlert('Recording! Tap microphone again to send...');
    } catch (e) {
      alert("Microphone permission denied.");
    }
  };

  const handleMediaUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="px-6 pb-40 w-full h-full flex flex-col items-center overflow-y-auto relative no-scrollbar bg-surface-container-lowest pt-20" ref={scrollRef}>
      {/* Ambient Depth Glow */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-[40%] blur-[150px] pointer-events-none z-0"
      ></motion.div>
      
      <div className="max-w-5xl w-full mx-auto relative z-10 flex flex-col min-h-full">
        {/* Only show initial dashboard layout if NO chat history */}
        {!chatHistory.length ? (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full">
             <section className="mb-14">
                <div className="flex flex-col gap-2">
                  <h1 className="text-6xl font-extrabold tracking-tight text-white mb-3 font-manrope">Namaste, Lakshmi.</h1>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] font-label">Khata Sanctioned</span>
                      <span className="text-3xl font-black text-[#4EDE63] font-manrope">₹50,000</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10"></div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] font-label">Used Amount</span>
                      <span className="text-3xl font-bold text-white font-manrope">₹12,500</span>
                    </div>
                  </div>
                </div>
              </section>

              <motion.section variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {services.map(s => (
                  <motion.div key={s.id} variants={itemVariants} className="bg-[#181B25]/80 backdrop-blur-2xl rounded-2xl p-8 flex flex-col justify-between h-[260px] group cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-white/5 hover:bg-white/5 shadow-2xl">
                    <div className="flex justify-between items-start">
                      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-inner group-hover:bg-opacity-80", s.bgBase, s.textColor)}>
                        <s.icon className="w-7 h-7" />
                      </div>
                      <ArrowUpRight className={cn("transition-colors w-6 h-6", `group-hover:${s.textColor}`, "text-gray-500")} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white mb-2 font-manrope tracking-tight">{s.title}</h3>
                      <p className="text-gray-400 text-[15px] leading-relaxed font-medium">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.section>
           </motion.div>
        ) : (
           <div className="flex flex-col space-y-8 w-full max-w-4xl mx-auto pb-48 pt-4">
              {chatHistory.map(msg => (
                <motion.div 
                   key={msg.id} 
                   initial={{opacity:0, y:20}} 
                   animate={{opacity:1, y:0}} 
                   className={cn("flex w-full", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                   <div className={cn(
                       "relative max-w-[90%] md:max-w-[75%]", 
                       msg.role === 'user' 
                         ? 'bg-indigo-500/10 text-white border border-indigo-500/20 rounded-3xl rounded-tr-sm p-5 shadow-sm backdrop-blur-sm' 
                         : 'bg-[#181B25]/90 text-[#4EDE63] border border-[#4EDE63]/20 rounded-3xl rounded-tl-sm p-6 shadow-2xl'
                   )}>
                      {msg.role === 'ai' && (
                        <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-[#181b25] border border-[#4EDE63]/30 flex items-center justify-center">
                           <Sparkles className="w-4 h-4 text-[#4EDE63]" />
                        </div>
                      )}
                      
                      <p className={cn("text-[15px] leading-relaxed", msg.role === 'user' ? 'font-medium' : 'font-bold')}>{msg.text}</p>
                      
                      {msg.role === 'ai' && (
                         <>
                           <WidgetFactory directive={msg.directive} payload={msg.genui_data} />
                           <ReasoningToggle text={msg.reasoning} />
                         </>
                      )}
                   </div>
                </motion.div>
              ))}
           </div>
        )}
        
        <div className="h-40 flex-shrink-0"></div>
      </div>

      {/* Docked Icons Panel (Minimized Services Menu) */}
      <AnimatePresence>
        {chatHistory.length > 0 && (
          <motion.div 
             initial={{opacity: 0, x: 100}} 
             animate={{opacity: 1, x: 0}} 
             exit={{opacity: 0, x: 100}}
             className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[400]"
          >
             {services.map(s => (
                <div key={s.id} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-xl border border-white/5", s.bgBase, s.textColor)} title={s.title}>
                   <s.icon className="w-6 h-6" />
                </div>
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => { if(e.target.files.length > 0) alert('File Selected'); }} />

      {/* Bottom Hub */}
      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none lg:pl-64">
        <div className="max-w-xl mx-auto pb-10 px-6 flex flex-col items-center pointer-events-auto relative">
          
          <AnimatePresence>
             {systemAlert && (
                 <motion.div 
                   key="system-alert"
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                   className="absolute -top-16 bg-[#181B25]/95 border border-[#4EDE63]/40 shadow-[0_0_25px_rgba(78,222,99,0.3)] px-6 py-4 rounded-2xl flex items-center gap-3 backdrop-blur-2xl z-40"
                 >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4EDE63] animate-pulse"></div>
                    <span className="text-[#4EDE63] font-inter text-sm font-bold tracking-wide">{systemAlert}</span>
                 </motion.div>
             )}
             
             {inputMode === 'typing' && (
                 <motion.form 
                   key="typing-form"
                   onSubmit={handleMessageSubmit}
                   initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                   className="absolute -top-20 w-full px-6 flex items-center justify-center z-40"
                 >
                    <div className="relative w-full max-w-sm">
                      <input 
                        autoFocus type="text" value={keyboardText} onChange={(e) => setKeyboardText(e.target.value)}
                        placeholder="Talk to Sahayak..." 
                        className="w-full pl-6 pr-14 py-4 bg-[#181B25]/95 border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.25)] rounded-full text-white outline-none focus:ring-1 focus:ring-indigo-400 backdrop-blur-2xl font-inter text-sm font-medium"
                      />
                      <button type="submit" disabled={!keyboardText.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500/20 text-indigo-400 rounded-full hover:bg-indigo-500/40 disabled:opacity-30 disabled:hover:bg-indigo-500/20 transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                 </motion.form>
             )}
          </AnimatePresence>

          <p className="text-gray-400 font-label text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-70 animate-pulse">
            {inputMode === 'idle' ? 'Tap to speak, or select a service above...' : 'Interaction active'}
          </p>
          
          <div className="flex items-center justify-center gap-10 bg-[#1C1F29]/80 backdrop-blur-2xl px-12 py-5 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50">
            <button onClick={handleKeyboardToggle} className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/50", inputMode === 'typing' ? 'bg-indigo-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-white hover:bg-white/10')}>
              <Keyboard className="w-6 h-6" />
            </button>
            
            <button onClick={handleMicToggle} className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl focus:outline-none focus:ring-4", inputMode === 'listening' ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] focus:ring-indigo-400 hover:shadow-[0_0_35px_rgba(99,102,241,0.6)]')}>
              <Mic className="w-7 h-7" />
            </button>
            
            <button onClick={handleMediaUpload} className="w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
              <ImagePlus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
