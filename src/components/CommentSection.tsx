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
}

export default function CommentSection({ mediaId }: { mediaId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  
  // Track which comment ID a user is replying to
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyUserName, setReplyUserName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [mediaId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("media_id", mediaId)
      .order("created_at", { ascending: true }); // Ascending helps chronological nested threads

    if (!error && data) {
      setComments(data);
    }
    setIsLoading(false);
  };

  // Handle posting a main top-level review
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      media_id: mediaId,
      user_name: userName.trim() || "Anonymous",
      comment_text: newComment.trim(),
      parent_id: null,
    });

    if (!error) {
      setNewComment("");
      setUserName("");
      fetchComments();
    }
    setIsSubmitting(false);
  };

  // Handle posting a reply thread
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
      setReplyToId(null); // Close the reply input accordion
      fetchComments();
    }
    setIsSubmitting(false);
  };

  // Organize flat database items into Parent -> Replies buckets
  const rootComments = comments.filter((c) => c.parent_id === null);
  const getRepliesForForParent = (parentId: number) => 
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-white/5">
      <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
        Community Reviews
      </h3>

      {/* Main Comment Box */}
      <form onSubmit={handlePostComment} className="mb-10 flex flex-col gap-4">
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
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="self-end bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          Post Review
        </button>
      </form>

      {/* Comments Thread Layout */}
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
                {/* Main Parent Review Content */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-400">{comment.user_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-3">
                  {comment.comment_text}
                </p>

                {/* Reply Toggle Action Trigger */}
                <button
                  onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                  className="text-xs font-bold text-purple-500 hover:text-purple-400 uppercase tracking-wider transition-colors"
                >
                  {replyToId === comment.id ? "Cancel" : "Reply ↑"}
                </button>

                {/* Conditional Dynamic Inline Reply Input Field */}
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

                {/* Nested Threaded Replies Feed */}
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