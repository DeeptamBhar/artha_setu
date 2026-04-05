import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle, ShieldCheck, MapPin, 
  TrendingUp, TrendingDown, QrCode, Trophy, Activity, 
  Zap, Calendar, BarChart3, CreditCard
} from 'lucide-react';

export default function WidgetFactory({ directive, payload }) {
    if (!directive || directive === "IDLE") return null;

    // Safety fallback parser
    const p = payload || {};

    const baseCard = "w-full rounded-2xl border border-white/10 shadow-lg mt-4 overflow-hidden";

    switch (directive) {
        
        // 1. WIDGET_PROACTIVE_ALERT
        case 'WIDGET_PROACTIVE_ALERT': {
            const isCritical = p.severity?.toUpperCase().includes('CRITICAL');
            return (
                <div className={`${baseCard} p-6 ${isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    <div className="flex gap-4">
                        <AlertTriangle className={`w-8 h-8 ${isCritical ? 'text-red-400' : 'text-yellow-400'} flex-shrink-0 mt-1`} />
                        <div>
                            <h4 className={`text-lg font-bold mb-2 ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>Warning Detected</h4>
                            <p className="text-white text-md font-medium leading-relaxed mb-4">{p.pattern_detected || "An anomaly requires your attention."}</p>
                            {p.action_cta && (
                                <button className={`py-2 px-6 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors ${isCritical ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-yellow-500 text-slate-900 hover:bg-yellow-600'}`}>
                                    {p.action_cta}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // 2. WIDGET_LOAN_SIMULATOR
        case 'WIDGET_LOAN_SIMULATOR': {
            const [selectedTenure, setSelectedTenure] = useState(p.tenure_options_months ? p.tenure_options_months[0] : 12);
            return (
                <div className={`${baseCard} bg-[#181C25] p-6`}>
                   <h3 className="text-xl font-bold text-white mb-6 font-manrope">Loan Simulation</h3>
                   <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                           <span className="text-xs text-indigo-300 font-bold tracking-widest uppercase">Eligible Amount</span>
                           <h2 className="text-3xl font-black text-white mt-1">₹{(p.eligible_amount || 0).toLocaleString()}</h2>
                       </div>
                       <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                           <span className="text-xs text-indigo-300 font-bold tracking-widest uppercase">Interest Rate</span>
                           <h2 className="text-3xl font-black text-white mt-1">{p.interest_rate || "0"}% p.a.</h2>
                       </div>
                   </div>
                   
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Select Tenure (Months)</p>
                   <div className="flex flex-wrap gap-3 mb-8">
                       {(p.tenure_options_months || []).map(months => (
                           <button 
                             key={months}
                             onClick={() => setSelectedTenure(months)}
                             className={`px-6 py-2 rounded-full font-bold transition-all ${selectedTenure === months ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                           >
                               {months}M
                           </button>
                       ))}
                   </div>

                   <button className="w-full py-4 bg-gradient-to-r from-[#4EDE63] to-[#009264] rounded-xl text-[#0A0E17] font-black text-lg uppercase tracking-widest hover:shadow-[0_0_25px_rgba(78,222,99,0.4)] transition-all">
                       Apply Now
                   </button>
                </div>
            );
        }

        // 3. WIDGET_TRUST_SCORECARD
        case 'WIDGET_TRUST_SCORECARD': {
            const score = p.score || 0;
            const strokeDasharray = `${(score / 100) * 283} 283`; // 2 * pi * r (r=45)
            
            return (
                <div className={`${baseCard} bg-[#181C25] p-6`}>
                    <div className="flex items-center gap-8 mb-6">
                        {/* Circular Progress */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#4EDE63" strokeWidth="8" strokeDasharray={strokeDasharray} className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white">{score}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Score</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Trust Score</h3>
                            <p className="text-[#4EDE63] font-bold text-lg">{p.status || "Evaluating"}</p>
                        </div>
                    </div>

                    <details className="group border border-white/5 rounded-xl bg-black/20 overflow-hidden">
                        <summary className="p-4 cursor-pointer font-medium text-sm text-indigo-300 outline-none list-none flex justify-between">
                            Why did I get this score?
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-4 pt-0 border-t border-white/5">
                            <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
                                {(p.factors || []).map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                    </details>
                </div>
            );
        }

        // 4. WIDGET_SCHEME_MATCH
        case 'WIDGET_SCHEME_MATCH': {
            return (
                <div className={`${baseCard} bg-green-500/10 border-green-500/30 p-6`}>
                    <div className="flex items-start justify-between mb-2">
                       <h3 className="text-xl font-bold text-green-400">{p.scheme_name || "Matched Scheme"}</h3>
                       <ShieldCheck className="text-green-400 w-8 h-8 opacity-50" />
                    </div>
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold uppercase tracking-widest rounded-full border border-green-500/30">
                            {p.eligibility_status || "Eligible"}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-green-500 p-0 font-bold uppercase tracking-widest block mb-1">Benefit Amount</span>
                        <h2 className="text-3xl font-black text-white">{p.benefit_amount || "TBD"}</h2>
                    </div>
                </div>
            );
        }

        // 5. WIDGET_INSURANCE_RENEW
        case 'WIDGET_INSURANCE_RENEW': {
            return (
                <div className={`${baseCard} bg-sky-500/10 border-sky-500/30 p-6 relative overflow-hidden`}>
                    <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-sky-500/10 pointer-events-none" />
                    <h3 className="text-xl font-bold text-sky-400 mb-1">{p.policy_type || "Insurance Policy"}</h3>
                    <p className="text-sky-200/60 font-medium text-sm mb-6">Expires on: <span className="text-white">{p.expiry_date || "Unknown"}</span></p>

                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <span className="text-xs text-sky-500 font-bold uppercase tracking-widest block mb-1">Renewal Premium</span>
                            <h2 className="text-3xl font-black text-white">₹{(p.renewal_premium || 0).toLocaleString()}</h2>
                        </div>
                        <button className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-slate-900 rounded-xl font-black uppercase tracking-wider transition-colors shadow-lg shadow-sky-500/20">
                            Pay Now
                        </button>
                    </div>
                </div>
            );
        }

        // 6. WIDGET_CROP_MARKET
        case 'WIDGET_CROP_MARKET': {
            const isUp = p.trend?.toUpperCase() === "UP";
            return (
                <div className={`${baseCard} bg-[#181C25] p-6 flex justify-between items-center`}>
                    <div>
                         <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-1">{p.commodity || "Commodity"} Market</span>
                         <h2 className="text-4xl font-black text-white">₹{(p.current_price || 0).toLocaleString()}</h2>
                    </div>
                    <div className={`flex items-center gap-2 ${isUp ? 'text-[#4EDE63]' : 'text-red-400'}`}>
                        {isUp ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                    </div>
                </div>
            );
        }

        // 7. WIDGET_EXPENSE_PIE
        case 'WIDGET_EXPENSE_PIE': {
            const categories = p.categories || {};
            const keys = Object.keys(categories);
            const total = keys.reduce((acc, k) => acc + (categories[k] || 0), 0) || 1;
            const colors = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-[#4EDE63]'];

            return (
                <div className={`${baseCard} bg-[#181C25] p-6`}>
                    <h3 className="text-md font-bold text-white mb-6 uppercase tracking-widest font-label">Expense Breakdown</h3>
                    
                    {/* Visual Segmented Bar */}
                    <div className="w-full h-6 rounded-full flex overflow-hidden mb-6">
                        {keys.map((k, i) => (
                           <div 
                             key={k} 
                             className={`${colors[i % colors.length]}`} 
                             style={{ width: `${(categories[k] / total) * 100}%` }}
                             title={`${k}: ₹${categories[k]}`}
                           ></div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {keys.map((k, i) => (
                            <div key={k} className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></span>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">{k}</p>
                                    <p className="text-white font-medium">₹{categories[k]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 8. WIDGET_ATM_LOCATOR
        case 'WIDGET_ATM_LOCATOR': {
            const branches = p.nearest_branches || [];
            return (
                <div className={`${baseCard} bg-[#181C25] p-6`}>
                    <h3 className="text-md font-bold text-indigo-300 mb-6 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-5 h-5"/> Nearby Branches
                    </h3>
                    <div className="space-y-3">
                        {branches.map((b, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl">
                                <h4 className="text-sm font-bold text-white">{b.name}</h4>
                                <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                    {b.distance_km} km
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 9. WIDGET_DOC_STATUS
        case 'WIDGET_DOC_STATUS': {
            return (
                <div className={`${baseCard} bg-[#181C25] p-6 text-center`}>
                     <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400 border border-indigo-500/30">
                         <Activity className="w-8 h-8" />
                     </div>
                     <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">Stage</span>
                     <h2 className="text-2xl font-black text-white mb-6 leading-tight">{p.current_stage || "Processing"}</h2>
                     
                     {p.pending_action && (
                         <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl text-sm font-bold animate-pulse">
                             ACTION REQUIRED: {p.pending_action}
                         </div>
                     )}
                </div>
            );
        }

        // 10. WIDGET_REPAY_TIMELINE
        case 'WIDGET_REPAY_TIMELINE': {
            return (
                <div className={`${baseCard} bg-[#181C25] p-6`}>
                     <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                         <Calendar className="text-indigo-400 w-5 h-5" /> Repayment Due
                     </h3>
                     <div className="grid grid-cols-3 gap-4 mb-8">
                         <div className="flex flex-col">
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Due</span>
                             <span className="text-xl font-bold text-white">₹{(p.total_due || 0).toLocaleString()}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Next EMI</span>
                             <span className="text-md font-bold text-indigo-300 mt-1">{p.next_emi_date || "TBD"}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Amount</span>
                             <span className="text-xl font-bold text-red-400">₹{(p.emi_amount || 0).toLocaleString()}</span>
                         </div>
                     </div>
                     <button className="w-full bg-white text-black py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                         Pay EMI
                     </button>
                </div>
            );
        }

        // 11. WIDGET_VILLAGE_LEADERBOARD
        case 'WIDGET_VILLAGE_LEADERBOARD': {
            return (
                <div className={`${baseCard} bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-8 text-center`}>
                    <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <span className="text-xs text-amber-500/60 font-bold uppercase tracking-widest block mb-1">Local Rank</span>
                    <h2 className="text-5xl font-black text-amber-400 mb-6 drop-shadow-lg">#{p.group_rank || "-"}</h2>
                    
                    <div className="bg-black/30 w-full rounded-2xl p-4 border border-amber-500/10">
                         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Total Savings</span>
                         <span className="text-2xl font-bold text-white">₹{(p.total_savings || 0).toLocaleString()}</span>
                    </div>
                </div>
            );
        }

        // 12. WIDGET_QR_RECEIVE
        case 'WIDGET_QR_RECEIVE': {
            return (
                <div className={`${baseCard} bg-white p-6 text-center text-slate-900`}>
                     <h3 className="font-bold text-lg mb-6 text-slate-800">Scan to Pay</h3>
                     <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200 mb-6 relative">
                         {/* Mock QR lines */}
                         <QrCode className="w-16 h-16 text-slate-300 pointer-events-none" />
                         <div className="absolute inset-2 border-2 border-slate-300 border-dashed rounded-lg opacity-50"></div>
                     </div>
                     <p className="text-sm text-slate-500 font-bold tracking-widest uppercase">{p.merchant_name || "Merchant"}</p>
                     <p className="text-md font-bold mt-1 max-w-[200px] mx-auto truncate" title={p.upi_id}>{p.upi_id || "upi@bank"}</p>
                </div>
            );
        }

        // 13. WIDGET_SMART_INVEST
        case 'WIDGET_SMART_INVEST': {
            return (
                <div className={`${baseCard} bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-[0_15px_30px_rgba(37,99,235,0.3)]`}>
                     <div className="flex items-center gap-3 mb-6">
                         <Zap className="text-white w-6 h-6 fill-white" />
                         <h3 className="text-lg font-black text-white tracking-widest uppercase">Smart Invest</h3>
                     </div>
                     
                     <p className="text-blue-200 font-medium leading-relaxed mb-6">
                         {p.suggestion || "Consider investing your surplus."}
                     </p>

                     <div className="bg-black/20 border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-4">
                         <div>
                             <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest block mb-1">Surplus</span>
                             <span className="text-xl font-bold text-white">₹{(p.surplus_amount || 0).toLocaleString()}</span>
                         </div>
                         <div>
                             <span className="text-[10px] text-[#4EDE63] font-bold uppercase tracking-widest block mb-1">Est Return</span>
                             <span className="text-xl font-bold text-[#4EDE63]">{p.est_return || "0%"}</span>
                         </div>
                     </div>
                </div>
            );
        }

        default:
            return null;
    }
}
