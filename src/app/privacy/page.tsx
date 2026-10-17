export const metadata = {
  title: "Privacy Policy | MovieWrld",
  description: "Privacy Policy for MovieWrld",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-950 pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto bg-gray-900 border border-purple-900/30 p-8 md:p-12 rounded-2xl shadow-xl">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-wider">Privacy Policy</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
          <p>Last updated: October 2026</p>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">1. Introduction</h2>
            <p>Welcome to MovieWrld. We respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">2. Third-Party Advertising and Cookies (Google AdSense)</h2>
            <p className="mb-3">We use third-party advertising companies to serve ads when you visit our website. These companies may use information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Third party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites.</li>
              <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-pink-400 underline">Google Ads Settings</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">3. Information We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address (if you create an account to save favorites or leave reviews).</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website, products and services via Google Analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">4. External Links</h2>
            <p>Our website contains links to other websites. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our website, we encourage you to read the privacy notice of every website you visit.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 mt-8">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us via our official social media channels linked in the footer.</p>
          </section>
        </div>
      </div>
    </main>
  );
}