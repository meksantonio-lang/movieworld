import Link from "next/link";

export interface MediaDetailCardProps {
  id?: string | number;
  category: string;
  title: string;
  image?: string;        // ✅ for adult
  cover_url?: string;    // ✅ for TMDB/Spotify/Books
  poster_path?: string;  // ✅ legacy support
  genre?: string;
  release_year?: string | number;
  author?: string;
  artist?: string;
  overview?: string;
  download_link?: string;
  extra_details?: string;
}

export default function MediaDetailCard(props: MediaDetailCardProps) {
  // ✅ Prefer image (adult), then cover_url (other categories), then poster_path
  const displayImage =
    props.image || props.cover_url || props.poster_path || "/placeholder-poster.png";

  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-bold mb-6 text-purple-600">{props.title}</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {displayImage && (
          <img
            src={displayImage}
            alt={props.title}
            className="w-64 h-auto rounded shadow"
          />
        )}
        <div>
          {props.genre && <p className="text-lg">Genre: {props.genre}</p>}
          {props.release_year && <p className="text-lg">Year: {props.release_year}</p>}
          {props.author && <p className="text-lg">Author: {props.author}</p>}
          {props.artist && <p className="text-lg">Artist: {props.artist}</p>}

          {props.extra_details && (
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              <strong>Details:</strong> {props.extra_details}
            </p>
          )}

          {props.overview && <p className="mt-2 text-gray-700">{props.overview}</p>}
          {props.download_link && (
            <a
              href={props.download_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Download
            </a>
          )}

          {props.id && (
            <div className="mt-4">
              <Link
                href={`/${props.category}/${props.id}`}
                className="text-purple-600 hover:underline text-sm"
              >
                View details →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
