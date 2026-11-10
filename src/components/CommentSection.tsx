"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Comment {
  id: number;
  media_id: number;
  user_name: string;
  comment_text: string;
  parent_id: number | null;
  created_at: string;
  star_rating?: number; // New optional field for rendering stars later if you want
}

const PROMPTS = [
  "Masterpiece or overrated? Drop your honest review...",
  "Did this live up to the hype? Let the community know.",
  "Who was the absolute MVP of this title? Share your thoughts.",
  "Do you agree with the official MovieWorld rating? Sound off below.",
  "What was the most unforgettable moment? Review it here."
];

export default function CommentSection({ mediaId }: { mediaId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  
  // New Rating & Prompt State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  
  // Track which comment ID a user is replying to
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyUserName, setReplyUserName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a random engaging prompt
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    fetchComments();
  }, [mediaId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("media_id", mediaId)
      .order("created_at", { ascending: true }); 

    if (!error && data) {
      setComments(data);
    }
    setIsLoading(false);
  };

  // Handle posting a main top-level review WITH 5-Star Logic
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || rating === 0) return; // Prevent submission without a rating

    setIsSubmitting(true);
    
    // Core Logic: 3+ Stars = Like, 1-2 Stars = Dislike
    const isLike = rating >= 3;
    const isDislike = rating < 3;

    const { error } = await supabase.from("comments").insert({
      media_id: mediaId,
      user_name: userName.trim() || "Anonymous",
      comment_text: newComment.trim(),
      parent_id: null,
      star_rating: rating,
      is_like: isLike,
      is_dislike: isDislike
    });

    if (!error) {
      setNewComment("");
      setUserName("");
      setRating(0);
      fetchComments();
    } else {
      console.error("Failed to post:", error);
    }
    setIsSubmitting(false);
  };

  // Handle posting a reply thread (Replies don't need star ratings)
  const handlePostReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      media_id: mediaId,
      user_name: replyUserName.trim() || "Anonymous",
      comment_text: replyText.trim(),
      parent_id: parentId,
    });

    if (!error) {
      setReplyText("");
      setReplyUserName("");
      setReplyToId(null); 
      fetchComments();
    }
    setIsSubmitting(false);
  };

  const rootComments = comments.filter((c) => c.parent_id === null);
  const getRepliesForForParent = (parentId: number) => 
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-white/5">
      <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">
        Community Reviews
      </h3>
      <p className="text-gray-400 text-sm mb-6 pb-4 border-b border-white/10">
        {prompt}
      </p>

      {/* Main Comment Box with 5-Star Integration */}
      <form onSubmit={handlePostComment} className="mb-10 flex flex-col gap-4">
        
        {/* ⭐ STAR RATING UI */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-300 mr-2 uppercase tracking-widest">
            Your Rating:
          </span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <svg
                className={`w-8 h-8 transition-colors duration-200 ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                    : "text-gray-700"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
          <span className="ml-3 text-xs font-bold text-gray-500">
            {rating === 1 && "Terrible"}
            {rating === 2 && "Not Good"}
            {rating === 3 && "It's Okay"}
            {rating === 4 && "Great"}
            {rating === 5 && "Masterpiece"}
          </span>
        </div>

        <input
          type="text"
          placeholder="Your Name (Optional)"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full md:w-1/3 bg-gray-950 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-purple-500 focus:outline-none transition-colors"
        />
        <textarea
          placeholder="What did you think of this title?"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          required
          className="w-full bg-gray-950 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-purple-500 focus:outline-none transition-colors resize-none"
        ></textarea>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            *Requires a star rating to post
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim() || rating === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post Review"}
          </button>
        </div>
      </form>

      {/* Comments Thread Layout (Untouched to preserve your hard work) */}
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-gray-500 animate-pulse">Loading reviews...</p>
        ) : rootComments.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
        ) : (
          rootComments.map((comment) => {
            const replies = getRepliesForForParent(comment.id);

            return (
              <div key={comment.id} className="bg-gray-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-purple-400">{comment.user_name}</span>
                    {/* Optional: Render their star rating next to their name */}
                    {comment.star_rating && (
                       <span className="flex items-center text-yellow-400 text-xs">
                         ★ {comment.star_rating}
                       </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-3">
                  {comment.comment_text}
                </p>

                <button
                  onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                  className="text-xs font-bold text-purple-500 hover:text-purple-400 uppercase tracking-wider transition-colors"
                >
                  {replyToId === comment.id ? "Cancel" : "Reply ↑"}
                </button>

                {replyToId === comment.id && (
                  <form onSubmit={(e) => handlePostReply(e, comment.id)} className="mt-4 pl-4 border-l-2 border-purple-600 flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={replyUserName}
                      onChange={(e) => setReplyUserName(e.target.value)}
                      className="w-full md:w-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded border border-gray-800 focus:border-purple-500 focus:outline-none"
                    />
                    <textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      required
                      className="w-full bg-gray-900 text-white text-sm px-3 py-2 rounded border border-gray-800 focus:border-purple-500 focus:outline-none resize-none"
                    ></textarea>
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyText.trim()}
                      className="self-end bg-purple-600 hover:bg-purple-700 text-xs text-white font-bold py-1.5 px-4 rounded transition-colors"
                    >
                      Submit Reply
                    </button>
                  </form>
                )}

                {replies.length > 0 && (
                  <div className="mt-5 pl-4 md:pl-6 border-l border-white/10 space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-950/60 p-4 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-pink-400">{reply.user_name}</span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {reply.comment_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}