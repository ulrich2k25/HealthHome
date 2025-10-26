"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/api/login", {
        email,
        password,
      });

      setMessage("✅ Connexion réussie !");
      localStorage.setItem("email", email);
      localStorage.setItem("authToken", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 401) setMessage("❌ Mot de passe incorrect.");
      else if (err.response?.status === 404) setMessage("❌ Utilisateur non trouvé.");
      else setMessage("⚠️ Erreur de connexion au serveur.");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-[#1F2937]"
      style={{ backgroundColor: "#F0F4F8" }}
    >
      <h2 className="text-2xl font-semibold mb-6">Connexion HealthHome</h2>

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <div>
          <label htmlFor="email" className="block mb-1 text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded bg-[#E3ECF3] text-[#1F2937] placeholder-gray-500"
            placeholder="Entrez votre email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-[#E3ECF3] text-[#1F2937] placeholder-gray-500"
            placeholder="Entrez votre mot de passe"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#4F9DDE] hover:bg-[#3B82C4] py-2 rounded font-semibold text-white"
        >
          Anmelden
        </button>
      </form>

      {message && (
        <p
          className="mt-4 text-sm"
          style={{
            color:
              message.includes("✅") ? "#388E3C" :
              message.includes("❌") ? "#D32F2F" :
              "#F57C00",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}