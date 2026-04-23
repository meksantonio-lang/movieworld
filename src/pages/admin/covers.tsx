// pages/admin/covers.tsx
import dynamic from "next/dynamic";
import React from "react";

const AdminCoverManager = dynamic(() => import("../../src/components/AdminCoverManager"), { ssr: false });

export default function AdminCoversPage() {
  return (
    <main className="container mx-auto p-6">
      <AdminCoverManager />
    </main>
  );
}
