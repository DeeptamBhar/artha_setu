import React, { useState, useRef } from 'react';
import { Upload, Mic, TextCursorInput, CheckCircle2, ChevronRight, FileText, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartForms() {
  const [phase, setPhase] = useState('UPLOAD'); // UPLOAD, PROCESSING, ITERATION, COMPLETE
  const [language, setLanguage] = useState('hi-IN');
  const [formData, setFormData] = useState({});
  const [aiMessage, setAiMessage] = useState("Kisan Mitra Auto-Fill is ready. Upload a blank government or bank form to begin.");
  const [inputText, setInputText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const handleUploadNewBlankForm = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhase('PROCESSING');
    setAiMessage("Mera agent aapki document scan kar raha hai...");
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', 'u101');
    formData.append('language', language);

    try {
      const res = await fetch('/api/form/init', { method: 'POST', body: formData });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setFormData(data.current_data || {});
      setAiMessage(data.ui_message);
      
      if (data.status === 'COMPLETE') {
        setPhase('COMPLETE');
      } else {
        setPhase('ITERATION');
      }
      playAudio(data.ui_message);
    } catch (e) {
      console.error('Form init error:', e);
      setErrorMsg(`Upload failed: ${e.message}`);
      setAiMessage("Upload failed. Please try again.");
      setPhase('UPLOAD');
    }
  };

  const handleProvideMissingData = async (text, file = null) => {
    if (!text && !file) return;
    
    setPhase('PROCESSING');
    setErrorMsg("");
    
    const payload = new FormData();
    payload.append('user_id', 'u101');
    if (text) payload.append('text', text);
    if (file) payload.append('file', file);

    try {
      const res = await fetch('/api/form/process', { method: 'POST', body: payload });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setFormData(data.current_data || {});
      setAiMessage(data.ui_message);
      
      if (data.status === 'COMPLETE') {
        setPhase('COMPLETE');
      } else {
        setPhase('ITERATION');
      }
      playAudio(data.ui_message);
    } catch (e) {
      console.error('Form process error:', e);
      setErrorMsg(`Processing failed: ${e.message}`);
      setPhase('ITERATION');
    }
  };

  const playAudio = (text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-[#0A0E17] text-white rounded-3xl overflow-hidden relative shadow-2xl">
      <header className="w-full px-8 py-6 bg-white/5 border-b border-white/10 flex justify-between items-center backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Kisan Smart Form</h1>
            <p className="text-sm text-gray-400">AI-Powered Auto Document Filler</p>
          </div>
        </div>
        
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[#181b25] border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="hi-IN">हिन्दी (Hindi)</option>
          <option value="mr-IN">मराठी (Marathi)</option>
          <option value="en-IN">English</option>
        </select>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-8 gap-8 relative z-10 overflow-y-auto no-scrollbar">
        
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </motion.div>
        )}
        
        <motion.div 
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          className="w-full bg-[#181b25] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
          <div className="relative flex items-start gap-4">
            <div className="mt-1 w-10 h-10 rounded-full bg-gradient-to-br from-[#4EDE63] to-[#009264] flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg shadow-[#4EDE63]/20">
              <Sparkles className="w-5 h-5 text-[#0A0E17]" />
            </div>
            <p className="text-xl font-medium leading-relaxed text-indigo-100">{aiMessage}</p>
          </div>
        </motion.div>

        {phase === 'UPLOAD' && (
          <div className="flex-1 flex items-center justify-center">
            <input type="file" ref={fileInputRef} onChange={handleUploadNewBlankForm} className="hidden" accept="image/*" />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-80 h-80 rounded-full border border-dashed border-indigo-500/50 flex flex-col items-center justify-center gap-4 cursor-pointer bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors relative"
            >
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px]"></div>
              <Upload className="w-16 h-16 text-indigo-400 relative z-10" />
              <span className="text-xl font-semibold text-indigo-200 relative z-10">Scan Document</span>
            </motion.div>
          </div>
        )}

        {(phase === 'ITERATION' || phase === 'COMPLETE' || phase === 'PROCESSING') && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#181b25] border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold text-indigo-300 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Form Data Preview
              </h3>
              <div className="flex-1 flex flex-col gap-3">
                {Object.entries(formData).length === 0 ? (
                  <p className="text-gray-500 text-sm">No data yet...</p>
                ) : (
                  Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="flex flex-col bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{key.replace(/_/g, ' ')}</span>
                      <span className={`text-sm mt-1 font-medium ${value === null ? 'text-red-400 italic' : 'text-green-400'}`}>
                        {value === null ? 'Pending Data...' : String(value)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className={`flex-1 rounded-2xl border ${phase === 'PROCESSING' ? 'border-indigo-500/50 bg-indigo-500/5 flex items-center justify-center' : 'border-white/10 bg-[#181b25] p-6'} shadow-xl`}>
                {phase === 'PROCESSING' ? (
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                ) : phase === 'COMPLETE' ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-400">Ready to Submit</h2>
                    <p className="text-gray-400">Your Unified Ledger records and uploads have fully satisfied this application.</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                         Provide Input
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Speak the missing details aloud, type them below, or take a picture of an ID card if requested.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 mt-8">
                       <input type="file" ref={mediaInputRef} onChange={(e) => { handleProvideMissingData(null, e.target.files[0]); e.target.value = null; }} className="hidden" accept="image/*" />
                       <div className="w-full flex gap-2">
                         <div className="flex-1 bg-black/40 rounded-full border border-white/10 flex items-center px-4 overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                           <input 
                              type="text" 
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              placeholder="Type your response..."
                              className="bg-transparent w-full border-none outline-none text-white text-sm py-3"
                              onKeyDown={(e) => { if(e.key === 'Enter' && inputText.trim()) { handleProvideMissingData(inputText); setInputText(''); } }}
                           />
                         </div>
                         <button 
                            onClick={() => { if (inputText.trim()) { handleProvideMissingData(inputText); setInputText(''); } }} 
                            disabled={!inputText.trim()}
                            className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           <Send className="w-5 h-5 ml-1" />
                         </button>
                       </div>

                       <div className="flex items-center gap-4">
                          <button className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-indigo-300">
                             <Mic className="w-5 h-5" /> Tap to Speak
                          </button>
                          <button onClick={() => mediaInputRef.current?.click()} className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-indigo-300">
                             <Upload className="w-5 h-5" /> Upload ID
                          </button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
