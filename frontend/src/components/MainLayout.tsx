"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className={`min-h-screen ${isLoggedIn ? "grid grid-cols-[240px_1fr]" : ""}`}>
      {/* Sidebar visible uniquement si connecté */}
      {isLoggedIn && (
        <aside className="bg-white border-r border-gray-300 p-5 text-gray-800">
          <h1 className="text-2xl font-bold mb-8 tracking-wide">HealthHome</h1>
          <nav className="space-y-2">
            <Link
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
              href="/termin"
            >
              Termine
            </Link>
            <Link
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
              href="/impfungen"
            >
              Impfungen
            </Link>
            <Link
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200"
              href="/medikamente"
            >
              Medikamente
            </Link>
          </nav>
        </aside>
      )}

      {/* Zone principale */}
      <main className="p-8 bg-gray-50 text-gray-900 w-full">
        {/* Entête visible uniquement si connecté */}
        {isLoggedIn && (
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
