"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import Image from "next/image";

const TOOLTIP_MESSAGES = [
  "Hi I'm Mai, your Moviewrld AI assistant 👋",
  "Ask me anything 🍿",
  "I can recommend movies for you, what do you wanna watch? 🎬"
];

// Avatar and Timer settings
const AVATARS = ["/ai-avatar-1.png", "/ai-avatar-2.png", "/ai-avatar-3.png"];
const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const THIRTY_MINS_MS = 30 * 60 * 1000;
const TOOLTIP_DISPLAY_TIME_MS = 12000; // 12 seconds total (4s per message)

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true); // Controls if the text bubble is visible
  const [isAnimating, setIsAnimating] = useState(false);

  // Cycle the tooltip messages every 4 seconds ONLY when the bubble is visible
  useEffect(() => {
    if (isOpen || !showTooltip) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % TOOLTIP_MESSAGES.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isOpen, showTooltip]);

  // Handle the 30-minute visibility timer
  useEffect(() => {
    // Hide the initial popup after 12 seconds (giving time to read all 3 messages)
    let hideTimeout = setTimeout(() => setShowTooltip(false), TOOLTIP_DISPLAY_TIME_MS);

    // Every 30 minutes, pop back up for 12 seconds
    const showInterval = setInterval(() => {
      setShowTooltip(true);
      setMessageIndex(0); // Reset to the first greeting
      hideTimeout = setTimeout(() => setShowTooltip(false), TOOLTIP_DISPLAY_TIME_MS);
    }, THIRTY_MINS_MS);

    return () => {
      clearTimeout(hideTimeout);
      clearInterval(showInterval);
    };
  }, []);

  // Calculate and update the avatar every 5 hours based on epoch time
  useEffect(() => {
    const updateAvatar = () => {
      const index = Math.floor((Date.now() / FIVE_HOURS_MS) % AVATARS.length);
      setAvatarIndex(index);
    };

    updateAvatar(); // Run immediately on mount
    const interval = setInterval(updateAvatar, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Trigger a bounce animation every 90 seconds
  useEffect(() => {
    const animInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 3000); // Remove bounce after 3 seconds
    }, 90000);
    return () => clearInterval(animInterval);
  }, []);

  // YOUR EXACT WORKING CHAT LOGIC
  const { messages, sendMessage, status, error, clearError } = useChat();
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* --- THE CHAT WINDOW --- */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-gray-950 border border-purple-900/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="bg-purple-900/80 p-4 border-b border-purple-900/50 flex justify-between items-center backdrop-blur-md">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              Mai - MovieWrld AI
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-6">
                Ask me for movie recommendations, anime lore, or K-Drama reviews!
              </p>
            )}

            {error && (
              <p role="alert" className="text-red-400 text-xs text-center">
                The assistant couldn&apos;t respond. Please try again.
              </p>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user" ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-200"
                }`}>
                  {/* Using your exact parts.map rendering logic */}
                  {m.parts?.map((part, index) => part.type === "text" && (
                    <span key={`${m.id}-${index}`} className="whitespace-pre-wrap">{part.text}</span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-purple-400 text-xs italic ml-2">Mai is typing...</div>
            )}
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(event) => {
              event.preventDefault();
              const text = input.trim();
              if (!text || isLoading) return;
              clearError();
              void sendMessage({ text });
              setInput("");
            }}
            className="p-3 bg-gray-900 border-t border-purple-900/50 flex gap-2"
          >
            <input
              className="flex-1 bg-gray-800 text-white text-sm border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
              value={input}
              placeholder="Ask Mai a movie question..."
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input || input.trim() === ""}
              className="bg-purple-600 hover:bg-pink-600 disabled:bg-gray-700 text-white font-bold rounded-full p-2 px-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      )}

      {/* --- THE FLOATING BUTTON & TOOLTIPS --- */}
      <div className="flex items-center gap-3">
        {/* The Cycling Tooltip (Now respects the showTooltip state) */}
        {!isOpen && showTooltip && (
          <div className="bg-purple-900 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-2xl shadow-lg border border-purple-700 animate-in fade-in zoom-in duration-300">
            {TOOLTIP_MESSAGES[messageIndex]}
          </div>
        )}
        
        {/* The Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative bg-pink-600 hover:bg-pink-500 text-white w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center border-2 border-purple-900/50 overflow-hidden ${isAnimating && !isOpen ? 'animate-bounce' : ''}`}
          aria-label="Toggle AI Assistant"
        >
          {isOpen ? (
            <svg className="w-6 h-6 z-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <Image
              src={AVATARS[avatarIndex]}
              alt="Mai - MovieWrld AI"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          )}
        </button>
      </div>

    </div>
  );
}