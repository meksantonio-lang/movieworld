// Supabase row type
export interface MediaItemRow {
  id: number;
  tmdb_id: number;
  category: string;
  download_link: string;
  created_at: string;
  title?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  name?: string; // for TV shows
}

// TMDB Movie response
export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  overview?: string;
  imdb_id?: string | null; // <-- added: optional IMDb id from TMDB
  first_air_date?: string;
}

// TMDB TV Show response (anime, kdrama, etc.)
export interface TMDBTvShow {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string;
  overview?: string;
  imdb_id?: string | null; // optional here too if you may use it for TV shows
}
