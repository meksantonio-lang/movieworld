"use client";

import React, { useState } from "react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"movies"|"anime"|"kdrama"|"music"|"books">("movies");

  // Form state
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [cover, setCover] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | undefined>();
  const [downloadUrl, setDownloadUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/${activeTab}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        genre,
        cover,
        release_year: releaseYear,
        download_url: downloadUrl,
      }),
    });
    if (res.ok) {
      alert(`${activeTab} added successfully!`);
      setTitle(""); setGenre(""); setCover(""); setReleaseYear(undefined); setDownloadUrl("");
    } else {
      alert("Error adding item");
    }
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* Tabs */}
      <nav style={{ marginBottom: "20px" }}>
        {["movies","anime","kdrama","music","books"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              background: activeTab === tab ? "#0070f3" : "#ccc",
              color: activeTab === tab ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px"
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Add form */}
      <section>
        <h2>Add {activeTab}</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <input type="text" placeholder="Cover URL" value={cover} onChange={(e) => setCover(e.target.value)} />
          <input type="number" placeholder="Release Year" value={releaseYear ?? ""} onChange={(e) => setReleaseYear(Number(e.target.value))} />
          <input type="text" placeholder="Download URL" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} required />
          <button type="submit" style={{ padding: "10px", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px" }}>
            Save {activeTab}
          </button>
        </form>
      </section>
    </main>
  );
}
