"use client";

import { useEffect, useRef, useState } from "react";

export default function StickyBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Ensure we only run this on the client side
    if (typeof window === "undefined" || !containerRef.current) return;
    
    // 2. Prevent the script from injecting twice during React strict mode rendering
    if (containerRef.current.firstChild) return;

    // 3. Measure the screen width using JS, NOT CSS!
    const isMobile = window.innerWidth < 768;

    // 4. Set the proper Adsterra config based on the screen size
    const adConfig = isMobile 
      ? {
          key: 'f3de3527c1d5e220adfa0eef953be05f',
          format: 'iframe',
          height: 50,
          width: 320,
          params: {}
        }
      : {
          key: '79979a3e7fbae58ac091d620c45ee5e5',
          format: 'iframe',
          height: 90,
          width: 728,
          params: {}
        };

    // 5. Inject the Configuration Script
    const confScript = document.createElement("script");
    confScript.type = "text/javascript";
    confScript.innerHTML = `atOptions = ${JSON.stringify(adConfig)};`;

    // 6. Inject the Adsterra Invocation Script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `https://www.highperformanceformat.com/${adConfig.key}/invoke.js`;

    // 7. Append to our single visible container
    containerRef.current.appendChild(confScript);
    containerRef.current.appendChild(invokeScript);

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

      {/* Single Dynamic Ad Container - No display: none CSS used! */}
      <div 
        ref={containerRef} 
        className="flex items-center justify-center overflow-hidden" 
        style={{ minHeight: '50px' }}
      />
    </aside>
  );
}