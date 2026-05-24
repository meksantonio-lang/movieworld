import type { Metadata } from 'next';
import "@/app/globals.css"; 
import Navbar from "@/components/Navbar";
import { FavoritesProvider } from "@/context/FavoritesContext";

// This is what Google and Social Media bots read
export const metadata: Metadata = {
  metadataBase: new URL("https://moviewrld.com"),
  title: "MovieWrld 🌍 | Movies, Music & Books",
  description:
    "Download high-quality movies, latest Hollywood movies, Anime, K-drama, Download trending Afrobeats, Hip-hop and Pop music, get best-selling eBooks instantly for free.",
  keywords: [
    "Movies",
    "Afrobeats",
    "Downloads",
    "eBooks",
    "MovieWrld",
    "Free Content",
  ],
  icons: {
    icon: "/favicon.ico", // Automatically reads from src/app/favicon.ico
  },
  openGraph: {
    title: "MovieWrld - Your Digital Entertainment Hub",
    description:
      "Stream and download your favorite media in one click. No registration, just instant access.",
    url: "https://moviewrld.com",
    siteName: "MovieWrld",
    images: [
      {
        url: "https://moviewrld.com/favicon.ico", // Consider changing to a .png or .jpg later
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieWrld | Instant Downloads",
    description: "Download movies, books, and music for free.",
    images: ["https://moviewrld.com/favicon.ico"],
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
              "logo": "https://moviewrld.com/favicon.ico",
            }),
          }}
        />
      </head>
      <body className="bg-black text-white antialiased">
        <FavoritesProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </FavoritesProvider>
      </body>
    </html>
  );
}