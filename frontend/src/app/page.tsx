"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  // ✅ Si l’utilisateur est déjà connecté → on le redirige vers le Dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white text-center px-4">
      {/* Logo ou Titre principal */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-400">
        Willkommen bei HealthHome🩺
      </h1>

      <p className="text-gray-300 max-w-lg mb-8">
       Verfolgen Sie Ihre Gesundheit, Ihre Termine und Ihre Vitaldaten an einem einzigen Ort. Ihr Wohlbefinden beginnt hier.
      </p>

      {/* Boutons principaux */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
          Anmelden
        </button>

        <button
          onClick={() => router.push("/register")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
        Registrieren
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} HealthHome. Tous droits réservés.
      </footer>
    </div>
  );
}
