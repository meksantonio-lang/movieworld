"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type FavoriteItem = {
  id: number;
  title: string;
  type: "movie" | "book" | "music";
  link: string;
  image?: string;
};

interface FavoritesContextType {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: number, type: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites from browser on startup
  useEffect(() => {
    const saved = localStorage.getItem("mediahub_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing favorites", e);
      }
    }
  }, []);

  // Save to browser whenever favorites change
  useEffect(() => {
    localStorage.setItem("mediahub_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === item.id && f.type === item.type);
      if (exists) {
        return prev.filter((f) => !(f.id === item.id && f.type === item.type));
      }
      return [...prev, item];
    });
  };

  const isFavorite = (id: number, type: string) => {
    return favorites.some((f) => f.id === id && f.type === type);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within a FavoritesProvider");
  return context;
};