"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Comment {
  id: string;
  user_id: string;
  username: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

export default function NewsComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch user session and comments when the component loads
  useEffect(() => {
    const fetchSessionAndComments = async () => {
      // Check if someone is logged in
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Fetch all comments for this specific article
      const { data } = await supabase
        .from("news_comments")
        .select("*")
        .eq("news_slug", slug)
        .order("created_at", { ascending: true });

      if (data) setComments(data);
    };

    fetchSessionAndComments();
  }, [slug]);

  // 2. Handle submitting a new comment OR a reply
  const handleSubmit = async (parentId: string | null = null) => {
    if (!user) return alert("You must be logged in to comment!");
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    setIsSubmitting(true);

    // Fallback to "Anonymous" if the user hasn't set a display name in your app yet
    const username = user.user_metadata?.full_name || user.email?.split('@')[0] || "Anonymous";

    const { data, error } = await supabase
      .from("news_comments")
      .insert([
        {
          news_slug: slug,
          user_id: user.id,
          username: username,
          content: text.trim(),
          parent_id: parentId,
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data]);
      setNewComment("");
      setReplyText("");
      setReplyingTo(null);
    } else {
      console.error("Failed to post comment:", error);
    }
    
    setIsSubmitting(false);
  };

  // 3. The Recursive Thread Builder!
  const CommentThread = ({ parentId }: { parentId: string | null }) => {
    // Find all comments that belong to this parent
    const childComments = comments.filter(c => c.parent_id === parentId);

    if (childComments.length === 0) return null;

    return (
      <div className="flex flex-col gap-4 mt-4">
        {childComments.map((comment) => (
          <div key={comment.id} className={`${parentId ? "ml-4 md:ml-8 border-l-2 border-purple-900/50 pl-4" : ""}`}>
            {/* Comment Bubble */}
            <div className="bg-purple-950/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-lg">
                  {comment.username.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">{comment.username}</h4>
                  <p className="text-gray-500 text-[10px]">
                    {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              
              {/* Reply Button */}
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-pink-400 hover:text-pink-300 text-xs font-bold mt-3 transition-colors uppercase tracking-wider"
              >
                {replyingTo === comment.id ? "Cancel Reply" : "Reply"}
              </button>
            </div>

            {/* Hidden Reply Input Box */}
            {replyingTo === comment.id && (
              <div className="mt-3 ml-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Replying to ${comment.username}...`}
                  className="w-full bg-gray-900/50 border border-purple-500/30 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-pink-500 transition-colors min-h-[80px]"
                />
                <button
                  onClick={() => handleSubmit(comment.id)}
                  disabled={isSubmitting || !replyText.trim()}
                  className="mt-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold py-2 px-6 rounded-full disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            )}

            {/* Recursively render any replies to THIS comment! */}
            <CommentThread parentId={comment.id} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-16 pt-12 border-t border-purple-900/50">
      <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-8">
        Join the Conversation
      </h3>

      {/* Main Comment Input */}
      {user ? (
        <div className="mb-10 bg-gray-900/40 p-4 rounded-2xl border border-white/5">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts on this?"
            className="w-full bg-transparent text-white text-sm p-2 focus:outline-none min-h-[100px] resize-y placeholder-gray-600"
          />
          <div className="flex justify-end mt-2 pt-2 border-t border-white/5">
            <button
              onClick={() => handleSubmit(null)}
              disabled={isSubmitting || !newComment.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-8 rounded-full disabled:opacity-50 transition-colors uppercase tracking-wider text-sm shadow-lg shadow-purple-900/20"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-10 bg-purple-900/20 border border-purple-500/30 p-6 rounded-2xl text-center">
          <p className="text-gray-300 font-medium mb-4">You must be logged in to like, rate, and comment.</p>
          {/* Change this href to wherever your login page is! */}
          <a href="/login" className="inline-block bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-8 rounded-full transition-colors uppercase tracking-wider text-sm">
            Log In or Sign Up
          </a>
        </div>
      )}

      {/* Render the Threads */}
      {comments.length > 0 ? (
        <CommentThread parentId={null} />
      ) : (
        <p className="text-gray-500 text-center italic py-8">No comments yet. Be the first to start the discussion!</p>
      )}
    </div>
  );
}