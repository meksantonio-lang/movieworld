// Supabase row type
export interface MediaItemRow {
  id: number;
  tmdb_id: number;
  category: string;
  download_link: string;
  created_at: string;
  title?: string;
  release_date?: string;
  release_year?: string | number | null;
  first_air_date?: string;
  poster_path?: string;
  name?: string; // for TV shows
  cover?: string; // OpenLibrary cover URL for books
  author?: string; // ✅ for books
  artist?: string; // ✅ for music
  poster_thumb?: string | null; // optional thumbnail field
  details?: Record<string, any>; // for storing additional metadata as JSON
}

// TMDB Movie response
export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  overview?: string;
  imdb_id?: string | null; // optional IMDb id from TMDB
  first_air_date?: string;
  category?: string;
  details?: {
    artist?: string;
    author?: string;
  };
}

// TMDB TV Show response (anime, kdrama, etc.)
export interface TMDBTvShow {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string;
  overview?: string;
  imdb_id?: string | null; // optional IMDb id from TMDB
  category?: string;
  details?: {
    artist?: string;
    author?: string;
  };
}
