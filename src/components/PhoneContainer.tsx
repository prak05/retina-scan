import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Clock } from 'lucide-react';

interface PhoneContainerProps {
  children: React.ReactNode;
}

export function PhoneContainer({ children }: PhoneContainerProps) {
  const [time, setTime] = useState('09:00');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      const strHours = hours < 10 ? '0' + hours : hours;
      setTime(`${strHours}:${strMinutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="phone-layout" className="min-h-screen bg-[#0C1014] text-gray-100 flex items-center justify-center p-0 md:p-6 font-sans selection:bg-[#00FFCC] selection:text-black">
      {/* Immersive background lights */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#00FFCC]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Structural Frame (Smartphone wrapper only active on md screens up) */}
      <div 
        id="phone-frame" 
        className="relative w-full max-w-sm md:max-w-md h-full md:h-[840px] bg-[#0E1318] md:rounded-[48px] md:border-8 md:border-[#1F2937] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] md:ring-2 md:ring-gray-700/50 flex flex-col overflow-hidden transition-all duration-300 transform"
      >
        {/* Dynamic Mobile Status Bar (Visible on all devices for immersion) */}
        <div id="status-bar" className="h-10 bg-[#0C1014] px-6 flex items-center justify-between text-xs select-none border-b border-gray-900 z-50 shrink-0">
          <div className="flex items-center gap-1.5 font-medium text-gray-400">
            <Clock className="w-3 h-3 text-[#00FFCC]" />
            <span>{time}</span>
          </div>
          
          {/* Punch-hole camera (visible on desktop framed view) */}
          <div className="hidden md:block w-3.5 h-3.5 bg-black rounded-full border border-gray-800/80 shadow-inner absolute left-1/2 -translate-x-1/2 top-3 z-50" />

          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-[9px] font-bold tracking-widest text-[#00FFCC]/80">5G CELLULAR</span>
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <Battery className="w-4 h-4 text-[#00FFCC]" />
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Body Section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-[#070A0D]">
          {children}
        </div>

        {/* Interaction Home Indicator Bar (Simulated swipe bar for phone layout) */}
        <div className="hidden md:flex h-5 bg-[#0C1014] items-center justify-center shrink-0 border-t border-gray-950">
          <div className="w-28 h-1 bg-gray-700/80 rounded-full" />
        </div>
      </div>
    </div>
  );
}
