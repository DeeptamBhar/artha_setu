import React, { useState } from 'react';
import { Bell, Settings, Sparkles, BarChart3, Shield, Users, HelpCircle, UserCircle, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout({ children, activeTab, setActiveTab, onLogout }) {
  const tabs = [
    { name: 'Clients', icon: Users },
    { name: 'Smart Forms', icon: FileText },
    { name: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="overflow-hidden h-screen flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Top Navigation Anchor */}
      <header className="bg-[#0A0E17]/80 backdrop-blur-xl flex justify-between items-center w-full px-8 py-4 max-w-full relative z-50 transition-all duration-300">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-extrabold bg-gradient-to-br from-[#4EDE63] to-[#009264] bg-clip-text text-transparent">Sahayak</h1>
          <nav className="hidden md:flex gap-8">
            {tabs.map((tab) => (
              <button 
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={cn(
                  "pb-1 font-['Manrope'] font-light tracking-wide transition-all outline-none",
                  activeTab === tab.name 
                    ? "text-[#4EDE63] font-semibold border-b-2 border-[#4EDE63]" 
                    : "text-[#DFE2EF]/60 hover:text-[#DFE2EF] border-b-2 border-transparent"
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-[#DFE2EF]/60 cursor-pointer hover:text-primary transition-colors" />
          <Settings className="w-5 h-5 text-[#DFE2EF]/60 cursor-pointer hover:text-primary transition-colors" />
          <div 
            onClick={onLogout}
            className="h-8 w-8 rounded-full overflow-hidden bg-surface-container-highest cursor-pointer hover:opacity-80 transition-opacity border border-transparent hover:border-[#4EDE63] shadow-lg shadow-black"
            title="Log out"
          >
            <img alt="Financial Advisor Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7_SVi9eUDImcnU69tQCR4UWH8ha5d0LfnKTMlYVP2r5cy3RwzSR5rpgTCIojl93vLODCjO3ogyxnhPdPwtZhpe0JNq--KPzFQTsFStMca7PtpuC4bHUzu-w3Jz-Y0ZxjxJBXeF69a9UqBJjG5yC1H4ffWlxzmd8FoHxzpsA04J-Ep2dd6DfzoyixAINrRO8TDSKinkPZLUEVSIapM9TfeOMTUjROThexaZDX9mdynBn9pLo5ng7i5k2xb-f-zjM6XTykVccz81VQ"/>
          </div>
        </div>
      </header>
      
      <main className="flex flex-1 overflow-hidden relative">
        <div className="flex flex-1 overflow-hidden w-full h-full lg:pl-20">
          {children}
        </div>
      </main>
      
      {/* Side Navigation Anchor */}
      <aside className="hidden lg:flex flex-col h-screen w-20 bg-[#0A0E17] border-r border-[#45464C]/15 fixed left-0 top-0 pt-20 pb-8 z-40 items-center justify-between">
        <div className="flex flex-col gap-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <div 
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={cn(
                  "group relative cursor-pointer p-3 rounded-lg transition-all",
                  isActive ? "text-[#4EDE63] bg-[#4EDE63]/10" : "text-[#DFE2EF]/50 hover:text-[#DFE2EF]"
                )}
              >
                <IconComponent className={cn("w-[22px] h-[22px]", isActive ? "text-[#4EDE63]" : "")} />
                <span className="absolute left-16 bg-surface-container px-2 py-1 rounded text-[10px] font-label invisible group-hover:visible whitespace-nowrap z-50">
                  {tab.name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-4">
          <HelpCircle className="w-[22px] h-[22px] text-[#DFE2EF]/30 hover:text-primary transition-colors cursor-pointer" />
          <UserCircle onClick={onLogout} title="Log out" className="w-[22px] h-[22px] text-[#DFE2EF]/30 hover:text-primary transition-colors cursor-pointer" />
        </div>
      </aside>
    </div>
  );
}
