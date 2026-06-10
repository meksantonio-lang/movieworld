import Link from "next/link";

interface MediaCardProps {
  id: string | number;
  title: string;
  category: string;
  image: string;
  downloadLink?: string; // Kept as an optional prop so we don't break any old code still referencing it
  releaseYear?: string;
}

export default function MediaCard({ id, title, category, image, releaseYear }: MediaCardProps) {
  return (
    <Link 
      href={`/${category}/${id}`} 
      className="group relative rounded-xl overflow-hidden cursor-pointer bg-gray-900 aspect-[2/3] block transition-all duration-300 hover:scale-[1.02] hover:ring-2 hover:ring-purple-500 shadow-lg"
    >
      {/* Poster Image */}
      <img 
        src={image} 
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Text Content */}
      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h4 className="text-white font-black text-lg line-clamp-1 drop-shadow-md">
          {title}
        </h4>
        
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
            {releaseYear || "TBA"}
          </span>
          <span className="text-purple-400 font-bold text-xs uppercase tracking-widest group-hover:text-purple-300 transition-colors">
            Details →
          </span>
        </div>
      </div>
    </Link>
  );
}