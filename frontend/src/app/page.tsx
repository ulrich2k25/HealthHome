"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F4F8] text-[#1F2937] text-center px-4">
      {/* Logo ou Titre principal */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#4F9DDE]">
        Willkommen bei HealthHome🩺
      </h1>

      <p className="text-gray-300 max-w-lg mb-8">
       Verfolgen Sie Ihre Gesundheit, Ihre Termine und Ihre Vitaldaten an einem einzigen Ort. Ihr Wohlbefinden beginnt hier.
      </p>

      {/* Boutons principaux */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/login")}
          className="bg-[#4F9DDE] hover:bg-[#3B82C4] text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
          Anmelden
        </button>

        <button
          onClick={() => router.push("/register")}
          className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
          Sich Registrieren
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-[#6B7280] text-sm">
        © {new Date().getFullYear()} HealthHome. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
}