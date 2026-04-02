// Supabase row type
export interface MediaItemRow {
  id: number;
  tmdb_id: number;
  category: string;
  download_link: string;
  created_at: string;
}

// TMDB Movie response
export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  overview?: string;
}

// TMDB TV Show response (anime, kdrama, etc.)
export interface TMDBTvShow {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string;
  overview?: string;
}
