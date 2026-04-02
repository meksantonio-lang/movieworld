// src/lib/searchData.tsx

export const globalData = [
  // MOVIES (Using official TMDB Poster paths)
  { 
    id: 1, 
    title: "Inception", 
    type: "movie", 
    category: "Sci-Fi", 
    link: "/movies/1",
    image: "https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsOX79p9a930Y3STj3.jpg" 
  },
  { 
    id: 2, 
    title: "Interstellar", 
    type: "movie", 
    category: "Sci-Fi", 
    link: "/movies/2",
    image: "https://image.tmdb.org/t/p/w500/gEU2QniE6EwfVnz6s9pAWqOunY8.jpg" 
  },
  { 
    id: 3, 
    title: "John Wick", 
    type: "movie", 
    category: "Action", 
    link: "/movies/3",
    image: "https://image.tmdb.org/t/p/w500/fZPSn9j64BvIuY79j9ZSTuScy3K.jpg" 
  },
  { 
    id: 4, 
    title: "Avengers: Endgame", 
    type: "movie", 
    category: "Action", 
    link: "/movies/4",
    image: "https://image.tmdb.org/t/p/w500/or06vS3STZAkB6gBr97qy3gYFvB.jpg" 
  },
  
  // BOOKS (Using high-res Amazon/Publisher covers)
  { 
    id: 1, 
    title: "Atomic Habits", 
    type: "book", 
    category: "Self-Help", 
    link: "/books/1",
    image: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg" 
  },
  { 
    id: 2, 
    title: "The Alchemist", 
    type: "book", 
    category: "Fiction", 
    link: "/books/2",
    image: "https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg" 
  },

  // MUSIC (Official Album Art)
  { 
    id: 1, 
    title: "Jogodo", 
    type: "music", 
    category: "Afrobeats", 
    link: "/music/1",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/44/1a/f6/441af619-354a-7140-59a6-620251767e7c/828644558000.jpg/600x600bb.jpg" 
  }
];