import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, FileText, Cloud, Wallet, BadgeCheck, Map } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CockpitPanel({ setActiveTab }) {
  return (
    <>
      <div className="p-10 space-y-12 relative z-10 w-full">
        {/* Dashboard Header */}
        <div className="flex justify-between items-end">
          <div>
            <span className="text-primary font-bold tracking-tighter text-sm font-label block mb-1">REAL-TIME MONITORING</span>
            <h2 className="text-3xl font-light text-on-surface">The Banker’s Cockpit</h2>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2 rounded-full text-xs font-semibold bg-surface-container-highest border border-outline-variant/20 hover:bg-surface-bright transition-colors text-on-surface-variant">Export Audit</button>
            <button 
              onClick={() => setActiveTab && setActiveTab('Analytics')}
              className="px-5 py-2 rounded-full text-[11px] uppercase tracking-wider font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
            >
              <Map className="w-4 h-4" />
              View Geospatial Risk
            </button>
            <button className="px-5 py-2 rounded-full text-xs font-semibold bg-gradient-to-br from-primary to-on-primary-container text-on-primary hover:opacity-90 transition-all cursor-pointer">Verify All</button>
          </div>
        </div>
        
        {/* Bento Grid Dashboard Components */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-12 gap-6 w-full"
        >
          {/* ML Trust Score Card */}
          <motion.div variants={itemVariants} className="col-span-7 bg-surface-container p-8 rounded-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-sm font-semibold text-on-surface-variant mb-6 font-label">ML Trust Index</h4>
              <div className="flex items-center gap-8">
                <div className="relative h-24 w-24">
                  <svg className="h-24 w-24 transform -rotate-90">
                    <circle className="text-outline-variant/10" cx="48" cy="48" fill="transparent" r="40" strokeWidth="8"></circle>
                    <motion.circle 
                      className="text-primary" 
                      cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" 
                      strokeDasharray="251.2" 
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * 88 / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      strokeWidth="8"
                      strokeLinecap="round"
                    >
                    </motion.circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-extrabold text-on-surface">88</span>
                    <span className="text-[8px] uppercase tracking-widest text-primary font-bold">Secure</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-on-surface-variant">Reliability Score</span>
                    <span className="text-primary">Very High</span>
                  </div>
                  <div className="h-1.5 w-full bg-outline-variant/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-primary w-[88%] rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/60 leading-relaxed italic">
                    Score calculated from 48 verified data points including satellite NDVI, past repayment, and identity biometrics.
                  </p>
                </div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500 pointer-events-none"></div>
          </motion.div>
          
          {/* Fraud Alert Card */}
          <motion.div variants={itemVariants} className="col-span-5 bg-error-container/10 border border-error/10 p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <ShieldAlert className="text-error w-11 h-11 animate-pulse" />
              <div className="absolute top-0 right-0 h-2.5 w-2.5 bg-error rounded-full"></div>
            </div>
            <div>
              <h4 className="text-error font-bold text-sm uppercase tracking-widest mb-1">Fraud Alert</h4>
              <p className="text-xs text-on-surface-variant leading-tight">Anomalous Transaction detected in Sector 4B disbursement</p>
            </div>
            <button className="w-full py-2 bg-error/20 border border-error/30 text-error text-xs font-bold rounded-lg hover:bg-error hover:text-on-error transition-all">Review Details</button>
          </motion.div>
          
          {/* OCR Form Simulation */}
          <motion.div variants={itemVariants} className="col-span-12 bg-surface-container-high/40 p-8 rounded-xl border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FileText className="text-primary w-5 h-5" />
                <h4 className="text-sm font-semibold text-on-surface font-label">OCR-Pre-filled Claim Form</h4>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-widest">AI Extraction: 98% Confidence</span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-on-surface-variant/70 font-label uppercase ml-1">Applicant Name</label>
                  <div className="relative">
                    <input className="w-full bg-surface-container-highest outline-none border-none rounded-lg text-sm text-on-surface py-3 px-4 focus:ring-0" readOnly type="text" value="Rajesh Kumar Patel"/>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-primary rounded-full ring-4 ring-primary/10"></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-on-surface-variant/70 font-label uppercase ml-1">Aadhaar Linked Identity</label>
                  <div className="relative">
                    <input className="w-full bg-surface-container-highest outline-none border-none rounded-lg text-sm text-on-surface py-3 px-4 focus:ring-0" readOnly type="text" value="XXXX-XXXX-8821"/>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-primary rounded-full ring-4 ring-primary/10"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-on-surface-variant/70 font-label uppercase ml-1">Land Parcel ID</label>
                  <div className="relative">
                    <input className="w-full bg-surface-container-highest outline-none border-none rounded-lg text-sm text-on-surface py-3 px-4 focus:ring-0" readOnly type="text" value="KN-CLR-992-4B"/>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-primary rounded-full ring-4 ring-primary/10"></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-on-surface-variant/70 font-label uppercase ml-1">Claim Amount (Extracted)</label>
                  <div className="relative">
                    <input className="w-full bg-surface-container-highest outline-none border-2 border-primary/40 rounded-lg text-sm text-primary font-bold py-3 px-4 focus:ring-0" type="text" readOnly value="₹ 45,800.00"/>
                    <BadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5 opacity-90" />
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="mt-12 flex justify-end gap-4">
              <button className="px-8 py-3 rounded-lg border border-error/30 text-error font-bold text-sm hover:bg-error hover:text-on-error transition-all duration-300">Block</button>
              <button className="px-8 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold text-sm hover:bg-surface-bright transition-all duration-300">Allow</button>
              <button className="px-10 py-3 rounded-lg bg-gradient-to-br from-primary to-on-primary-container text-on-primary font-bold text-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300">Disburse Funds</button>
            </div>
          </motion.div>
          
          {/* Quick Insight Overlay/Small Card */}
          <motion.div variants={itemVariants} className="col-span-12 flex gap-6 pb-2">
            <div className="flex-1 bg-secondary-container/10 p-5 rounded-xl flex items-center gap-4">
              <div className="h-10 w-10 bg-secondary-container/30 rounded-lg flex items-center justify-center">
                <Cloud className="text-secondary w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-secondary uppercase font-label">Satellite Verify</h5>
                <p className="text-[11px] text-on-surface-variant">Climate conditions matched for Sector 4B</p>
              </div>
            </div>
            <div className="flex-1 bg-surface-container p-5 rounded-xl flex items-center gap-4 border border-outline-variant/10">
              <div className="h-10 w-10 bg-surface-container-highest rounded-lg flex items-center justify-center">
                <Wallet className="text-on-surface-variant w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-on-surface-variant uppercase font-label">Wallet Status</h5>
                <p className="text-[11px] text-on-surface-variant">KYC Tier-3 Active for Recipient</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
    </>
  );
}
