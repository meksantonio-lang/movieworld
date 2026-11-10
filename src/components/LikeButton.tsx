"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface LikeButtonProps {
  mediaId: number;
}

export default function LikeButton({ mediaId }: LikeButtonProps) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Generate or retrieve a unique device ID
  useEffect(() => {
    let id = localStorage.getItem("mw_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("mw_session_id", id);
    }
    setSessionId(id);
    fetchReactions(id);
  }, [mediaId]);

  // 2. Fetch total likes/dislikes and check if THIS user reacted
  const fetchReactions = async (userSession: string) => {
    // Get total likes
    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("media_id", mediaId)
      .eq("is_dislike", false); // Default likes are false
    
    // Get total dislikes
    const { count: dislikesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("media_id", mediaId)
      .eq("is_dislike", true);

    setLikes(likesCount || 0);
    setDislikes(dislikesCount || 0);

    // Check if this specific session has a reaction
    const { data } = await supabase
      .from("likes")
      .select("is_dislike")
      .eq("media_id", mediaId)
      .eq("user_session_id", userSession)
      .single();

    if (data) {
      setUserReaction(data.is_dislike ? 'dislike' : 'like');
    }
    setIsLoading(false);
  };

  // 3. Handle the Reaction Toggle (Optimistic UI)
  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!sessionId || isLoading) return;
    
    const isCurrentlyLike = userReaction === 'like';
    const isCurrentlyDislike = userReaction === 'dislike';
    const isTargetDislike = type === 'dislike';

    // Optimistic UI Update (Instant front-end change)
    if (userReaction === type) {
      // Removing their current reaction completely
      setUserReaction(null);
      if (type === 'like') setLikes((prev) => prev - 1);
      if (type === 'dislike') setDislikes((prev) => prev - 1);
      
      await supabase
        .from("likes")
        .delete()
        .eq("media_id", mediaId)
        .eq("user_session_id", sessionId);
    } else {
      // Switching reaction or adding for the first time
      setUserReaction(type);
      
      if (type === 'like') {
        setLikes((prev) => prev + 1);
        if (isCurrentlyDislike) setDislikes((prev) => prev - 1);
      } else {
        setDislikes((prev) => prev + 1);
        if (isCurrentlyLike) setLikes((prev) => prev - 1);
      }

      if (isCurrentlyLike || isCurrentlyDislike) {
        // Update existing row
        await supabase
          .from("likes")
          .update({ is_dislike: isTargetDislike })
          .eq("media_id", mediaId)
          .eq("user_session_id", sessionId);
      } else {
        // Insert brand new row
        await supabase
          .from("likes")
          .insert({ 
            media_id: mediaId, 
            user_session_id: sessionId, 
            is_dislike: isTargetDislike 
          });
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      
      {/* ❤️ INSTAGRAM-STYLE LIKE BUTTON */}
      <button 
        onClick={() => handleReaction('like')}
        disabled={isLoading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
          userReaction === 'like' 
            ? 'bg-pink-500/20 border-pink-500 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
            : 'bg-gray-900/50 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
        }`}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${userReaction === 'like' ? 'scale-110' : 'scale-100'}`} 
          fill={userReaction === 'like' ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="text-sm font-bold tracking-wide">{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
      </button>

      {/* 👎 THUMBS DOWN DISLIKE BUTTON */}
      <button 
        onClick={() => handleReaction('dislike')}
        disabled={isLoading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
          userReaction === 'dislike' 
            ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
            : 'bg-gray-900/50 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
        }`}
      >
        <svg 
          className={`w-5 h-5 mt-1 transition-transform duration-300 ${userReaction === 'dislike' ? 'scale-110' : 'scale-100'}`} 
          fill={userReaction === 'dislike' ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
        <span className="text-sm font-bold tracking-wide">{dislikes}</span>
      </button>

    </div>
  );
}