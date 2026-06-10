"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface LikeButtonProps {
  mediaId: number;
}

export default function LikeButton({ mediaId }: LikeButtonProps) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
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
    fetchLikes(id);
  }, [mediaId]);

  // 2. Fetch total likes and check if THIS user liked it
  const fetchLikes = async (userSession: string) => {
    // Get total count
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("media_id", mediaId);
    
    setLikes(count || 0);

    // Check if this specific session has a like
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("media_id", mediaId)
      .eq("user_session_id", userSession)
      .single();

    if (data) setHasLiked(true);
    setIsLoading(false);
  };

  // 3. Handle the Like Toggle
  const toggleLike = async () => {
    if (!sessionId || isLoading) return;
    
    // Optimistic UI update (makes it feel instant like Facebook)
    setHasLiked(!hasLiked);
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));

    if (hasLiked) {
      // Remove Like
      await supabase
        .from("likes")
        .delete()
        .eq("media_id", mediaId)
        .eq("user_session_id", sessionId);
    } else {
      // Add Like
      await supabase
        .from("likes")
        .insert({ media_id: mediaId, user_session_id: sessionId });
    }
  };

  return (
    <button 
      onClick={toggleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
        hasLiked 
          ? "bg-purple-600 text-white hover:bg-purple-700" 
          : "bg-white/10 text-gray-300 hover:bg-white/20"
      }`}
    >
      <svg className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"></path>
      </svg>
      {likes} {likes === 1 ? "Like" : "Likes"}
    </button>
  );
}