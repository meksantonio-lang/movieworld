"use client";

import { useEffect, useRef, useState } from "react";

export default function StickyBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Inject Mobile 320x50 Banner
    if (mobileRef.current && !mobileRef.current.firstChild) {
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.innerHTML = `
        atOptions = {
          'key' : 'f3de3527c1d5e220adfa0eef953be05f',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;

      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src =
        "https://www.highperformanceformat.com/f3de3527c1d5e220adfa0eef953be05f/invoke.js";

      mobileRef.current.appendChild(confScript);
      mobileRef.current.appendChild(invokeScript);
    }

    // 2. Inject Desktop 728x90 Banner
    if (desktopRef.current && !desktopRef.current.firstChild) {
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.innerHTML = `
        atOptions = {
          'key' : '79979a3e7fbae58ac091d620c45ee5e5',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src =
        "https://www.highperformanceformat.com/79979a3e7fbae58ac091d620c45ee5e5/invoke.js";

      desktopRef.current.appendChild(confScript);
      desktopRef.current.appendChild(invokeScript);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <aside aria-label="Advertisement" className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 border-t border-purple-900/50 backdrop-blur-md py-2 shadow-2xl transition-all">
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute -top-7 right-3 bg-gray-900 hover:bg-pink-600 text-gray-400 hover:text-white text-xs font-bold px-3 py-1 rounded-t-lg border-t border-x border-purple-900/50 shadow-md transition-colors flex items-center gap-1"
        aria-label="Close advertisement banner"
      >
        <span>Close</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Mobile 320x50 Container */}
      <div className="block md:hidden min-h-[50px] min-w-[320px]" ref={mobileRef} />

      {/* Desktop 728x90 Container */}
      <div className="hidden md:block min-h-[90px] min-w-[728px]" ref={desktopRef} />
    </aside>
  );
}