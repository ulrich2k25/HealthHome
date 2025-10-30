"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

/**
 * Page de connexion (LoginPage)
 * Permet à l'utilisateur d'entrer son email + mot de passe
 * et d'enregistrer son ID + token dans le navigateur après une connexion réussie.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Fonction qui s'exécute quand on clique sur "Anmelden"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 🔹 Envoie une requête au backend pour vérifier les identifiants
      const res = await axios.post("http://localhost:4000/api/login", {
        email,
        password,
      });

      // 🔹 Si la connexion est réussie
      setMessage("✅ Connexion réussie !");
      // Enregistre le token et l'ID dans le localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.id);

      // 🔹 Redirige l'utilisateur vers le tableau de bord
      router.push("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 401) setMessage("❌ Mot de passe incorrect.");
      else if (err.response?.status === 404) setMessage("❌ Utilisateur non trouvé.");
      else setMessage("⚠️ Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <h2 className="text-2xl font-semibold mb-6">Connexion HealthHome</h2>

      {/* FORMULAIRE DE CONNEXION */}
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-sm space-y-4"
      >
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 text-white"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 text-white"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Anmelden
        </button>
      </form>

      {/* Message de succès ou d'erreur */}
      {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
    </div>
  );
}


