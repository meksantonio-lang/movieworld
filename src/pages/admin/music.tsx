// pages/admin/music.tsx
import dynamic from "next/dynamic";
import React from "react";

const AdminMusicEditor = dynamic(() => import("../../src/components/AdminMusicEditor"), { ssr: false });

export default function AdminMusicPage() {
  return (
    <main className="container mx-auto p-6">
      <AdminMusicEditor />
    </main>
  );
}
