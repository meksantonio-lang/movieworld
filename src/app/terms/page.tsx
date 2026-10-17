export const metadata = {
  title: "Terms of Service | MovieWrld",
  description: "Terms of Service and Use for MovieWrld",
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-950 pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto bg-gray-900 border border-purple-900/30 p-8 md:p-12 rounded-2xl shadow-xl">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-wider">Terms of Service</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
          <p>Last updated: October 2026</p>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">1. Acceptance of Terms</h2>
            <p>By accessing and using MovieWrld, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this website.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">2. Use of Content and Data (TMDB Attribution)</h2>
            <p>MovieWrld uses the TMDB API to fetch movie, TV show, and anime data, images, and trailers. <strong>This product uses the TMDB API but is not endorsed or certified by TMDB.</strong> All movie-related metadata, posters, and backdrops are the property of their respective owners and are displayed here for informational and entertainment purposes only.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">3. User Conduct</h2>
            <p>If you create an account to leave reviews, comments, or save favorites, you agree to use the site responsibly. You must not:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Post any offensive, abusive, defamatory, or obscene content.</li>
              <li>Attempt to disrupt or compromise the security of the website.</li>
              <li>Use the site for any unauthorized commercial purposes.</li>
            </ul>
            <p className="mt-2">We reserve the right to terminate accounts or remove content that violates these guidelines without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">4. Artificial Intelligence (Mai Assistant)</h2>
            <p>MovieWrld features an AI assistant powered by Google Gemini. While we strive for accuracy, the recommendations, trivia, and links provided by the AI are generated dynamically and may occasionally contain inaccuracies. Users should verify information independently.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">5. Disclaimer of Warranties</h2>
            <p>The site and its content are provided on an &quot;as is&quot; basis. MovieWrld makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>
        </div>
      </div>
    </main>
  );
}