import "./globals.css";
import Navbar from "@/components/Navbar";
import { FavoritesProvider } from "@/context/FavoritesContext";

// This is what Google and Social Media bots read
export const metadata = {
  title: "MovieWorld 🌎 | Movies, Music & Books",
  description: "Download high-quality movies, latest Hollywood, Nollywood, K-drama and Bollywood movies, Download trending Afrobeats, Hip-hop and Pop music, getbest-selling eBooks instantly with no sign-up required.",
  keywords: ["Movies", "Afrobeats", "Downloads", "eBooks", "MovieWorld", "Free Content"],
  openGraph: {
    title: "MediaHub - Your Digital Entertainment Hub",
    description: "Stream and download your favorite media in one click. No registration, just instant access.",
    url: "https://your-domain.com", // Replace with your domain later
    siteName: "MediaHub",
    images: [
      {
        url: "/og-image.jpg", // You can add a preview image in your public folder later
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaHub | Instant Downloads",
    description: "Download movies, books, and music for free.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <FavoritesProvider> 
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </FavoritesProvider>
      </body>
    </html>
  );
}