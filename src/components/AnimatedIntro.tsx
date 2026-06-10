"use client";

import { useState, useEffect } from "react";

export default function AnimatedIntro() {
  const titleText = "Welcome to MovieWrld";
  const [typedTitle, setTypedTitle] = useState("");
  const [showParagraph, setShowParagraph] = useState(false);

  useEffect(() => {
    // 1. Force a clean slate in case React Strict Mode double-fires
    setTypedTitle("");
    let currentIndex = 0;

    const interval = setInterval(() => {
      // 2. Safely slice the exact string instead of guessing the previous state
      currentIndex++;
      setTypedTitle(titleText.substring(0, currentIndex));

      if (currentIndex >= titleText.length) {
        clearInterval(interval);
        setShowParagraph(true);
      }
    }, 70); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto mt-10 mb-6 text-center md:text-left px-2 min-h-[110px] sm:min-h-[80px]">
      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
        {typedTitle}
        <span className="animate-pulse text-purple-500 ml-1 font-normal">|</span>
      </h1>
      
      <p
        className={`mt-2 text-sm sm:text-base text-gray-400 max-w-3xl font-light leading-relaxed transition-all duration-1000 ease-out ${
          showParagraph ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        Find, rate, like and comment on the latest trending Movies, Anime, and K-Dramas on the go.
        Give your thoughts to the world. Your one-stop destination for all things entertainment.
        Powered by TMDB's live data.
      </p>
    </div>
  );
}