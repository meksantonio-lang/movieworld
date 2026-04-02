"use client";

import { useState } from "react";
import { X, Mail, Lock, ShieldCheck } from "lucide-react";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    
    try {
      // PLACEHOLDER FOR YOUR NEW AUTH LOGIC
      // Example: await yourNewAuthMethod(email, password)
      console.log(`${type} attempt with:`, { email, password });
      
      // Simulate a small delay for the UI
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`${type === 'signup' ? 'Account created' : 'Logged in'} successfully! (Demo Mode)`);
      onClose();
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      
      <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded-full transition"
        >
          <X size={24} />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6 text-purple-500">
          <ShieldCheck size={32} />
        </div>

        <h2 className="text-3xl font-bold mb-2 text-white">MediaHub</h2>
        <p className="text-zinc-500 mb-8 text-sm">
          Sign in to your account to continue downloading.
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              required
              type="email" 
              placeholder="Email Address"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              required
              type="password" 
              placeholder="Password"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            onClick={() => handleAuth('login')}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-2xl font-bold text-white transition shadow-lg shadow-purple-900/20 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
          
          <div className="text-center mt-6">
            <button 
              type="button"
              onClick={() => handleAuth('signup')}
              className="text-zinc-400 text-sm hover:text-purple-400 transition font-medium"
            >
              Don't have an account? <span className="text-purple-500">Create one</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}