import Image from "next/image";

export interface MediaCardProps {
  title: string;
  category: string;
  image: string;
  downloadLink: string;
}

export default function MediaCard({
  title,
  category,
  image,
  downloadLink,
}: MediaCardProps) {
  return (
    <div className="border rounded-lg shadow-md overflow-hidden">
      <Image
        src={image}
        alt={title}
        width={300}
        height={450}
        className="w-full h-auto"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{category}</p>
        <a
          href={downloadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block bg-purple-600 text-white px-4 py-2 rounded"
        >
          Download
        </a>
      </div>
    </div>
  );
}
