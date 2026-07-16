import AdminLayout from "@/components/ui/admin-layout"

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth() as any;
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // aguarda o /me terminar

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "administrador") {
      router.replace("/Develop/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "administrador") {
    return null; // ou um spinner de carregamento
  }

  return <>{children}</>;
}