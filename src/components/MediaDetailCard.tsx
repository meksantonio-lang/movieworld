// src/components/MediaDetailCard.tsx
export default function MediaDetailCard(props: {
  category: string;
  title: string;
  cover?: string;
  poster_path?: string;
  genre?: string;
  release_year?: string | number;
  author?: string;
  artist?: string;
  runtime?: number;
  episodes?: number;
  studio?: string;
  publisher?: string;
  overview?: string;
  download_link?: string;
}) {
  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-bold mb-6 text-purple-600">{props.title}</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {(props.cover || props.poster_path) && (
          <img
            src={props.cover ?? props.poster_path ?? "/placeholder-poster.png"}
            alt={props.title}
            className="w-64 h-auto rounded shadow"
          />
        )}
        <div>
          {props.genre && <p className="text-lg">Genre: {props.genre}</p>}
          {props.release_year && <p className="text-lg">Year: {props.release_year}</p>}
          {props.author && <p className="text-lg">Author: {props.author}</p>}
          {props.artist && <p className="text-lg">Artist: {props.artist}</p>}
          {props.runtime && <p className="text-lg">Runtime: {props.runtime} mins</p>}
          {props.episodes && <p className="text-lg">Episodes: {props.episodes}</p>}
          {props.studio && <p className="text-lg">Studio: {props.studio}</p>}
          {props.publisher && <p className="text-lg">Publisher: {props.publisher}</p>}
          {props.overview && <p className="mt-2 text-gray-700">{props.overview}</p>}
          {props.download_link && (
            <a
              href={props.download_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded"
            >
              Download
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
