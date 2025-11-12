"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSocket } from "../lib/socket";


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const s = getSocket();
  
    const onConnect = () => console.log("socket connect", s.id);
    const onDisconnect = () => console.log("socket disconnect", s.id);
  
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
  
    return () => {
      // On ne déconnecte pas ici. On enlève seulement les listeners.
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);
  

  // Liste des pages publiques
  const publicPages = ["/login", "/register", "/verifyemail"];

  useEffect(() => {
    const getToken = () => {
      const fromLocal = localStorage.getItem("authToken") || localStorage.getItem("token");
      const fromSession = sessionStorage.getItem("authToken") || sessionStorage.getItem("token");
      const fromCookie = document.cookie.split("; ").find(c => c.startsWith("token="))?.split("=")[1];
      return fromLocal || fromSession || fromCookie || null;
    };
  
    const token = getToken();
  
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      // Redirige uniquement si la page n'est pas publique
      if (!publicPages.includes(pathname)) {
        router.push("/login");
      }
    }

    setIsLoading(false);
  }, [pathname, router]);

  if (isLoading) return null; // ⚠️ Évite tout affichage avant la vérification du token

  const hideSidebar = publicPages.includes(pathname) || !isLoggedIn;

  return (
    <div className={`min-h-screen ${!hideSidebar ? "grid grid-cols-[240px_1fr]" : ""}`}>
      {!hideSidebar && (
        <aside className="bg-white border-r border-gray-300 p-5 text-gray-800">
          <h1 className="text-2xl font-bold mb-8 tracking-wide">HealthHome</h1>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/termin"
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
            >
              Termine
            </Link>
            <Link
              href="/impfungen"
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
            >
              Impfungen
            </Link>
            <Link
              href="/medikamente"
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
            >
              Medikamente
            </Link>
            <Link
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
              href="/mahlzeit"
            >
              mahlzeit
            </Link>
            <Link
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
              href="/vitalswerte"
            >
              vitalswerte
            </Link>
          </nav>
        </aside>
      )}

      <main className="p-8 bg-gray-50 text-gray-900 w-full">
        {!hideSidebar && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="text-sm text-gray-500">Prototype • v0</div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}