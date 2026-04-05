import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Globe, AlertTriangle, Activity, IndianRupee, MapPin } from 'lucide-react';

const indiaCenter = [22.5937, 78.9629];
const regions = [
  { name: 'Maharashtra', lat: 19.7515, lng: 75.7139, baseProbability: 0.8 },
  { name: 'Karnataka', lat: 15.3173, lng: 75.7139, baseProbability: 0.9 },
  { name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, baseProbability: 0.6 },
  { name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, baseProbability: 0.85 },
  { name: 'West Bengal', lat: 22.9868, lng: 87.8550, baseProbability: 0.5 },
  { name: 'Gujarat', lat: 22.2587, lng: 71.1924, baseProbability: 0.75 },
  { name: 'Rajasthan', lat: 27.0238, lng: 74.2179, baseProbability: 0.35 },
  { name: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569, baseProbability: 0.55 },
  { name: 'Bihar', lat: 25.0961, lng: 85.3131, baseProbability: 0.4 }
];

export default function GeospatialOracle() {
  const [heatPoints, setHeatPoints] = useState([]);
  const [bankBranches, setBankBranches] = useState([]);

  useEffect(() => {
    const points = [];
    const banks = [];
    
    regions.forEach(region => {
      // Generate scattered bank branches across the states
      for (let i = 0; i < 3; i++) {
        banks.push({
          id: `bank-${region.name}-${i}`,
          lat: region.lat + (Math.random() * 3 - 1.5),
          lng: region.lng + (Math.random() * 3 - 1.5),
          name: `Sahayak Hub - ${region.name} 0${i+1}`
        });
      }
      
      // Generate heatmap probability clusters
      for (let i = 0; i < 35; i++) {
         const latOffset = (Math.random() - 0.5) * 5;
         const lngOffset = (Math.random() - 0.5) * 5;
         
         const variance = (Math.random() - 0.5) * 0.4;
         let probability = region.baseProbability + variance;
         probability = Math.max(0.1, Math.min(0.99, probability));
         
         const isHighProb = probability >= 0.7;
         const isLowProb = probability <= 0.4;
         
         let color = '#fbbf24'; // moderate
         if (isHighProb) color = '#4edea3'; // good / highly probable
         if (isLowProb) color = '#f43f5e'; // bad / high risk
         
         points.push({
           id: `${region.name}-heat-${i}`,
           lat: region.lat + latOffset,
           lng: region.lng + lngOffset,
           probability: Math.floor(probability * 100),
           color,
           radius: Math.random() * 15 + 10,
           factors: isHighProb 
             ? "High CIBIL density, steady rainfall, ULI land records extensively verified" 
             : isLowProb 
               ? "Historical drought zone, insufficient unencumbered assets, poor connectivity" 
               : "Mixed credit history, largely reliant on manual verification protocols"
         });
      }
    });
    
    setHeatPoints(points);
    setBankBranches(banks);
  }, []);

  return (
    <div className="w-full h-full bg-[#0f131c] rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
      {/* Header Panel */}
      <div className="p-6 bg-[#181B25]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-[400] relative">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-manrope text-white tracking-tight">Macro Lending Analytics</h2>
            <p className="text-indigo-300/80 text-[10px] font-bold tracking-widest uppercase font-label">Banker Persona • Databricks Geographic Heatmap</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-[#0A0E17] border border-white/10 rounded-lg flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_10px_#4edea3] animate-pulse"></div>
             <span className="text-gray-300 text-xs font-bold font-label tracking-widest uppercase">Live India Grid</span>
          </div>
        </div>
      </div>
      
      {/* Interactive React Leaflet Map */}
      <div className="flex-1 w-full h-full relative bg-[#0a0e17]">
        <MapContainer 
          center={indiaCenter} 
          zoom={5} 
          zoomControl={false}
          style={{ height: '100%', width: '100%', background: '#0a0e17' }} 
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />
          
          {/* Heatmap Probability Points */}
          {heatPoints.map(point => (
             <CircleMarker 
               key={point.id} 
               center={[point.lat, point.lng]} 
               radius={point.radius}
               pathOptions={{ 
                 color: 'transparent',
                 fillColor: point.color, 
                 fillOpacity: 0.35, 
               }}
             >
               <Popup className="bg-surface-container font-manrope">
                  <div className="font-semibold px-2 py-1 text-on-surface">
                    <span className="text-xs text-gray-500 font-bold block mb-1 uppercase tracking-wider">Disbursal Probability</span>
                    <strong className="text-2xl block tracking-tight" style={{color: point.color}}>{point.probability}%</strong>
                    <div className="mt-3 text-xs text-gray-400 font-medium leading-relaxed bg-[#0A0E17]/50 p-2 rounded border border-white/5">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Risk Factors</span>
                      {point.factors}
                    </div>
                  </div>
               </Popup>
             </CircleMarker>
          ))}

          {/* Core Bank Hubs (Markers) */}
          {bankBranches.map(bank => (
             <CircleMarker 
               key={bank.id} 
               center={[bank.lat, bank.lng]} 
               radius={4}
               pathOptions={{ 
                 color: '#181B25',
                 weight: 2,
                 fillColor: '#818cf8', 
                 fillOpacity: 1, 
               }}
             >
               <Popup className="bg-surface-container font-manrope">
                  <div className="font-semibold px-2 py-1 flex items-center gap-3">
                     <IndianRupee className="w-5 h-5 text-indigo-400" />
                     <span className="font-bold text-gray-200">{bank.name}</span>
                  </div>
               </Popup>
             </CircleMarker>
          ))}
        </MapContainer>
        
        {/* Floating Side Panel Overlay (Insight Box) */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="absolute top-6 right-6 w-80 bg-[#181B25]/90 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl z-[400] pointer-events-auto"
        >
          <h3 className="text-white font-manrope font-bold text-lg mb-4 flex items-center justify-between">
            Regional Overview
            <MapPin className="text-indigo-400 w-5 h-5" />
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
            India-wide probability heatmap representing loan viability index across sectors. Generated using multi-factor PySpark analysis over local banking infrastructures.
          </p>
          
          <div className="space-y-4">
             {/* Probability Legend */}
             <div className="bg-[#0A0E17]/80 p-5 rounded-xl border border-white/5 space-y-4">
                <span className="text-[10px] uppercase text-gray-500 font-bold block mb-2 tracking-widest">Heatmap Legend</span>
                
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#4edea3]/80 border border-[#4edea3]"></div>
                     <span className="text-xs font-bold text-gray-300">High Trust (70%+)</span>
                   </div>
                   <span className="text-[10px] text-gray-500 font-medium">ULI Secure</span>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#fbbf24]/80 border border-[#fbbf24]"></div>
                     <span className="text-xs font-bold text-gray-300">Neutral (40-69%)</span>
                   </div>
                   <span className="text-[10px] text-gray-500 font-medium">Under Review</span>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#f43f5e]/80 border border-[#f43f5e]"></div>
                     <span className="text-xs font-bold text-gray-300">Critical (&lt;40%)</span>
                   </div>
                   <span className="text-[10px] text-gray-500 font-medium">Risk Alert</span>
                </div>
             </div>

             <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 flex gap-4 items-center">
                <IndianRupee className="text-indigo-400 w-8 h-8 rounded-full bg-[#181B25] p-1.5 shadow-inner" />
                <div>
                   <span className="text-[10px] uppercase text-indigo-300/80 font-bold mb-1 block tracking-widest">Sahayak Nodes</span>
                   <span className="text-white font-bold text-sm">27 Branches Mapped</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
