"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewsLikeButton({ slug }: { slug: string }) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikesAndSession = async () => {
      // 1. Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      // 2. Count all likes for this article
      const { count, error: countError } = await supabase
        .from("news_likes")
        .select("*", { count: 'exact', head: true })
        .eq("news_slug", slug);
      
      if (!countError && count !== null) setLikeCount(count);

      // 3. If logged in, check if THIS user specifically liked it
      if (currentUser) {
        const { data } = await supabase
          .from("news_likes")
          .select("id")
          .eq("news_slug", slug)
          .eq("user_id", currentUser.id)
          .single();
        
        if (data) setIsLiked(true);
      }
      setIsLoading(false);
    };

    fetchLikesAndSession();
  }, [slug]);

  const handleToggleLike = async () => {
    if (!user) return alert("You must be logged in to like this post!");
    if (isLoading) return;

    // Optimistic UI update (makes the button feel instantly responsive)
    setIsLiked(!isLiked);
    setLikeCount((prev) => isLiked ? prev - 1 : prev + 1);

    if (isLiked) {
      // Remove like
      await supabase
        .from("news_likes")
        .delete()
        .eq("news_slug", slug)
        .eq("user_id", user.id);
    } else {
      // Add like
      await supabase
        .from("news_likes")
        .insert([{ news_slug: slug, user_id: user.id }]);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggleLike}
        disabled={isLoading}
        className={`group flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 ${
          isLiked 
            ? "bg-pink-600 border-pink-500 shadow-[0_0_15px_rgba(219,39,119,0.5)]" 
            : "bg-gray-900/50 border-white/10 hover:border-pink-500 hover:bg-purple-900/30"
        }`}
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-300 ${isLiked ? "text-white scale-110" : "text-gray-400 group-hover:text-pink-400 group-hover:scale-110"}`} 
          fill={isLiked ? "currentColor" : "none"} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLiked ? "0" : "2"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <span className="text-gray-400 font-bold text-lg">
        {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
      </span>
    </div>
  );
}