import type { Metadata } from 'next';
import "@/app/globals.css"; 
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FavoritesProvider } from "@/context/FavoritesContext";

// This is what Google and Social Media bots read
export const metadata: Metadata = {
  metadataBase: new URL("https://moviewrld.com"),
  title: "MovieWorld 🌍 | Ratings, Reviews, Trailers & News",
  description:
    "Your ultimate hub for trending movies, anime, and K-dramas. Watch official trailers, read the latest Hollywood and anime news, drop reviews, and explore cast details.",
  keywords: [
    "Movies",
    "Anime",
    "K-Drama",
    "Movie Reviews",
    "Trailers",
    "Entertainment News",
    "Hollywood Gossip",
    "MovieWorld",
    "Ratings",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "MovieWrld - Ratings, Reviews, Trailers & News",
    description:
      "Discover top trending movies, anime, and K-dramas. Catch up on the latest celebrity scoops, watch official trailers, and see what others are saying.",
    url: "https://moviewrld.com",
    siteName: "MovieWrld",
    images: [
      {
        url: "https://moviewrld.com/Logo.png", 
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieWrld | Ultimate Entertainment Hub & News",
    description: "Watch trailers, catch up on Hollywood scoops, and rate your favorite movies, anime, and K-dramas.",
    images: ["https://moviewrld.com/Logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ JSON-LD Organization Schema for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://moviewrld.com",
              "logo": "https://moviewrld.com/Logo.png",
            }),
          }}
        />
      </head>
      {/* Added flex layout to ensure the footer always sticks to the bottom */}
      <body className="bg-gray-950 text-white antialiased flex flex-col min-h-screen">
        <FavoritesProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </FavoritesProvider>
      </body>
    </html>
  );
}