"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminForm from "@/components/AdminForm";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login"); // redirect if not logged in
      } else {
        setSession(data.session);
      }
    });
  }, [router]);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <section className="px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-500">Admin Dashboard</h2>
        <LogoutButton />
      </div>
      <AdminForm />
    </section>
  );
}
