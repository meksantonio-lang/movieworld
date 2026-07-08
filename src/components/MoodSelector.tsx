"use client";

import { useState, useEffect } from "react";
import { fetchMoodRecommendations } from "@/app/actions";
import MediaCard from "@/components/MediaCard";

const MOODS = [
  { name: "Happy", color: "from-yellow-400 to-orange-500", glow: "hover:shadow-orange-500/50" },
  { name: "Sad", color: "from-blue-600 to-cyan-500", glow: "hover:shadow-cyan-500/50" },
  { name: "Scary", color: "from-red-700 to-red-900", glow: "hover:shadow-red-600/50" },
  { name: "Romantic", color: "from-pink-500 to-rose-600", glow: "hover:shadow-pink-500/50" },
];

export default function MoodSelector() {
  const [activeMood, setActiveMood] = useState<string>("Scary"); // Default starting mood
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getRecs = async () => {
      setIsLoading(true);
      const data = await fetchMoodRecommendations(activeMood);
      setRecommendations(data);
      setIsLoading(false);
    };

    getRecs();
  }, [activeMood]);

  return (
    <section className="py-16 px-4 md:px-8 border-y border-white/5 bg-gray-950/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-4">
            What's the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Vibe?</span>
          </h2>
          <p className="text-gray-400 font-medium">Select your mood and let MovieWrld find the perfect watch.</p>
        </div>

        {/* The Gamified Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {MOODS.map((mood) => (
            <button
              key={mood.name}
              onClick={() => setActiveMood(mood.name)}
              className={`relative px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-1 ${
                activeMood === mood.name 
                  ? `bg-gradient-to-r ${mood.color} text-white shadow-lg ${mood.glow.replace('hover:', '')} scale-105`
                  : "bg-gray-900 border border-white/10 text-gray-400 hover:text-white"
              } ${mood.glow}`}
            >
              {mood.name}
            </button>
          ))}
        </div>

        {/* Loading Skeleton or Media Grid */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {recommendations.map((media) => (
                <MediaCard
                  key={media.id}
                  id={media.id}
                  title={media.title}
                  category={media.category}
                  image={media.image}
                  releaseYear={media.releaseYear}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}