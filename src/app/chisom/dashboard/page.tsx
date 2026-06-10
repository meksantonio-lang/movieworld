"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Comment {
  id: number;
  media_id: number;
  user_name: string;
  comment_text: string;
  created_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  source_type: string;
  category: string;
  published_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // Review State
  const [mediaId, setMediaId] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // Moderation State
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // News Room State
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [activeNewsTab, setActiveNewsTab] = useState<'manage' | 'write'>('manage');
  
  // Custom News Publishing State
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCategory, setNewsCategory] = useState("Hollywood");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [newsMessage, setNewsMessage] = useState("");

  // 1. Authenticate the User
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/chisom/login");
      } else {
        setIsLoadingAuth(false);
        fetchRecentComments();
        fetchNewsItems();
      }
    };
    checkUser();
  }, [router]);

  // 2. Fetch Latest Comments for Moderation
  const fetchRecentComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setComments(data);
    }
    setIsLoadingComments(false);
  };

  // 3. Fetch News Items for Management
  const fetchNewsItems = async () => {
    setIsLoadingNews(true);
    const { data, error } = await supabase
      .from("news_feed")
      .select("id, title, source_type, category, published_at")
      .order("published_at", { ascending: false })
      .limit(30);

    if (!error && data) {
      setNewsList(data);
    }
    setIsLoadingNews(false);
  };

  // 4. Publish an Official Review
  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setReviewMessage("");

    const { error } = await supabase.from("admin_reviews").upsert({
      media_id: Number(mediaId),
      review_text: reviewText,
    }, { onConflict: 'media_id' });

    if (error) {
      setReviewMessage(`Error: ${error.message}`);
    } else {
      setReviewMessage("✅ Review published successfully!");
      setMediaId("");
      setReviewText("");
      setTimeout(() => setReviewMessage(""), 3000);
    }
    setIsPublishing(false);
  };

  // 5. Delete a Comment (Moderation)
  const handleDeleteComment = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) {
      setComments(comments.filter((c) => c.id !== id));
    } else {
      alert("Failed to delete comment.");
    }
  };

  // 6. Delete a News Article
  const handleDeleteNews = async (id: string) => {
    const confirmDelete = window.confirm("Delete this news article permanently from The Feed?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("news_feed").delete().eq("id", id);
    if (!error) {
      setNewsList(newsList.filter((n) => n.id !== id));
    } else {
      alert("Failed to delete news article.");
    }
  };

  // 7. Publish Manual News Scoop
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishingNews(true);
    setNewsMessage("");

    // Create a URL-friendly slug from the title
    const slug = newsTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7);

    const { error } = await supabase.from("news_feed").insert({
      title: newsTitle,
      slug: slug,
      summary: newsSummary,
      content: newsContent,
      category: newsCategory,
      image_url: newsImageUrl || null,
      source_type: 'Manual',
      published_at: new Date().toISOString()
    });

    if (error) {
      setNewsMessage(`Error: ${error.message}`);
    } else {
      setNewsMessage("✅ Exclusive Scoop Published!");
      setNewsTitle("");
      setNewsSummary("");
      setNewsContent("");
      setNewsImageUrl("");
      fetchNewsItems(); // Refresh the list
      setTimeout(() => {
        setNewsMessage("");
        setActiveNewsTab('manage'); // Switch back to the list view
      }, 2000);
    }
    setIsPublishingNews(false);
  };

  // 8. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/chisom/login");
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-purple-500 font-bold tracking-widest uppercase">Verifying Access...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-gray-900 border-r border-white/5 flex flex-col p-6 shrink-0">
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">Studio</h2>
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Admin Dashboard</p>
        </div>
        
        <nav className="flex flex-col gap-4 flex-grow">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            ← Back to Site
          </Link>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 font-bold py-3 px-4 rounded-lg transition-colors border border-red-900/50"
        >
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow p-6 md:p-10 lg:p-16 overflow-y-auto h-screen custom-scrollbar">
        <h1 className="text-3xl font-black uppercase tracking-widest mb-10 border-b border-white/5 pb-4">
          Command Center
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10">
          
          {/* LEFT COLUMN: THE REVIEW PUBLISHER */}
          <section className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl h-fit">
            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 text-purple-400">Publish Official Review</h3>
            
            {reviewMessage && (
              <div className="bg-green-900/30 border border-green-500/50 text-green-200 p-3 rounded-lg text-sm mb-6">
                {reviewMessage}
              </div>
            )}

            <form onSubmit={handlePublishReview} className="space-y-5">
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                  TMDB Media ID
                </label>
                <input
                  type="number"
                  required
                  value={mediaId}
                  onChange={(e) => setMediaId(e.target.value)}
                  className="w-full bg-gray-950 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="e.g., 12345"
                />
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Find this in the URL of the movie page</p>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Editorial Review
                </label>
                <textarea
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                  className="w-full bg-gray-950 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                  placeholder="e.g. This latest episode completely blew my mind..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isPublishing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2 disabled:opacity-50"
              >
                {isPublishing ? "Publishing..." : "Publish to MovieWrld"}
              </button>
            </form>
          </section>

          {/* RIGHT COLUMN: COMMUNITY MODERATION */}
          <section className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-pink-400">Recent Comments</h3>
              <button onClick={fetchRecentComments} className="text-xs text-gray-400 hover:text-white uppercase font-bold tracking-widest">
                Refresh
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {isLoadingComments ? (
                <div className="text-gray-500 animate-pulse text-sm">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-gray-500 italic text-sm">No comments yet.</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-950 p-4 rounded-xl border border-white/5 group relative">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <div>
                        <span className="font-bold text-gray-200 text-sm">{comment.user_name}</span>
                        <span className="text-gray-600 text-xs ml-2">ID: {comment.media_id}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-gray-950 pl-2"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.comment_text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* BOTTOM SECTION: NEWS ROOM */}
        <section className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-white">The News Room</h3>
              <p className="text-gray-400 text-sm mt-1">Manage automated feeds or write an exclusive scoop.</p>
            </div>
            
            {/* News Tabs */}
            <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800">
              <button 
                onClick={() => setActiveNewsTab('manage')}
                className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-colors ${activeNewsTab === 'manage' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Manage Feed
              </button>
              <button 
                onClick={() => setActiveNewsTab('write')}
                className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-colors ${activeNewsTab === 'write' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Write Scoop
              </button>
            </div>
          </div>

          {/* TAB 1: MANAGE EXISTING NEWS */}
          {activeNewsTab === 'manage' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex justify-end mb-4">
                <button onClick={fetchNewsItems} className="text-xs text-gray-400 hover:text-white uppercase font-bold tracking-widest">
                  Refresh List
                </button>
              </div>
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {isLoadingNews ? (
                  <div className="text-gray-500 animate-pulse">Loading news feed...</div>
                ) : newsList.length === 0 ? (
                  <div className="text-gray-500 italic">No news articles found. Run your sync API.</div>
                ) : (
                  newsList.map((item) => (
                    <div key={item.id} className="bg-gray-950 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.category === 'Hollywood' ? 'bg-purple-900/50 text-purple-300' : 'bg-pink-900/50 text-pink-300'}`}>
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{item.source_type}</span>
                        </div>
                        <h4 className="text-gray-200 font-bold leading-tight line-clamp-1">{item.title}</h4>
                      </div>
                      <button 
                        onClick={() => handleDeleteNews(item.id)}
                        className="shrink-0 text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest sm:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WRITE EXCLUSIVE NEWS */}
          {activeNewsTab === 'write' && (
            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
              {newsMessage && (
                <div className="bg-green-900/30 border border-green-500/50 text-green-200 p-3 rounded-lg text-sm mb-6">
                  {newsMessage}
                </div>
              )}
              
              <form onSubmit={handlePublishNews} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Headline</label>
                    <input type="text" required value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors" placeholder="e.g. Next Avengers Movie Announced" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Category</label>
                    <select value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-pink-500 focus:outline-none transition-colors">
                      <option value="Hollywood">Hollywood</option>
                      <option value="Anime">Anime</option>
                      <option value="KDrama">K-Drama</option>
                      <option value="Gaming">Gaming</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Image URL (Optional)</label>
                  <input type="url" value={newsImageUrl} onChange={(e) => setNewsImageUrl(e.target.value)} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-pink-500 focus:outline-none transition-colors" placeholder="https://example.com/image.jpg" />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Short Summary (Shows on Homepage)</label>
                  <input type="text" required value={newsSummary} onChange={(e) => setNewsSummary(e.target.value)} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-pink-500 focus:outline-none transition-colors" placeholder="A quick one-sentence hook..." />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Full Story (Paragraphs)</label>
                  <textarea required value={newsContent} onChange={(e) => setNewsContent(e.target.value)} rows={8} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-pink-500 focus:outline-none transition-colors resize-y" placeholder="Write your full article here..."></textarea>
                </div>

                <button type="submit" disabled={isPublishingNews} className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-colors mt-2 disabled:opacity-50">
                  {isPublishingNews ? "Publishing..." : "Publish to The Feed"}
                </button>
              </form>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}