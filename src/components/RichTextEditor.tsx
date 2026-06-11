"use client";

import dynamic from "next/dynamic";
// 1. Updated the CSS import to the new package
import "react-quill-new/dist/quill.snow.css"; 

// 2. Updated the dynamic import to the new package
const QuillNoSSRWrapper = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-900 border border-gray-800 rounded-lg animate-pulse flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">
      Loading Editor...
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden text-gray-900 border border-gray-800 focus-within:ring-2 focus-within:ring-pink-500 transition-all">
      <QuillNoSSRWrapper
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        className="h-64 pb-[42px]" 
      />
    </div>
  );
}