// src/components/MediaCard.tsx
import Link from "next/link";
import Image from "next/image";

export interface MediaCardProps {
  id: string | number;
  title: string;
  category: string;
  image: string;
  downloadLink: string;
  author?: string;
  releaseYear?: string | number | null;
}

export default function MediaCard({
  id,
  title,
  category,
  image,
  downloadLink,
  author,
  releaseYear,
}: MediaCardProps) {
  const isExternal = image?.startsWith("http");

  return (
    <div className="border rounded-lg shadow-md overflow-hidden">
      <Link href={`/${category}/${id}`} className="block">
        {isExternal ? (
          <img
            src={image}
            alt={title}
            className="w-full h-auto"
            width={300}
            height={450}
          />
        ) : (
          <Image
            src={image}
            alt={title}
            width={300}
            height={450}
            className="w-full h-auto"
          />
        )}
      </Link>

      <div className="p-4">
        <h3 className="text-lg font-semibold">
          <Link
            href={`/${category}/${id}`}
            className="text-purple-600 hover:underline"
          >
            {title}
          </Link>
        </h3>
        <p className="text-sm text-gray-500">{category}</p>
        {author && <p className="text-sm text-gray-700">By {author}</p>}
        {releaseYear && (
          <p className="text-sm text-gray-700">Published {releaseYear}</p>
        )}

        {downloadLink && (
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block bg-purple-600 text-white px-4 py-2 rounded"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}
