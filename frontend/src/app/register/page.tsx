"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("http://localhost:4000/api/register", {
        vorname,
        nachname,
        email,
        password,
      });

      if (res.data.success) {
        setMessage("✅ Inscription réussie ! Vérifiez votre e-mail pour le code.");
        setTimeout(() => router.push(`/verify?email=${email}`), 1500);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setMessage("⚠️ Cet email existe déjà.");
      } else {
        setMessage("❌ Erreur d’inscription.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F4F8] text-[#1F2937] px-4">
      <h2 className="text-2xl mb-6 font-semibold text-[#4F9DDE]">
        Inscription HealthHome
      </h2>

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 bg-white p-6 rounded-xl w-full max-w-md shadow-md"
      >
        <input
          type="text"
          placeholder="Prénom"
          className="p-3 rounded bg-[#E3ECF3] text-[#1F2937] placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400"
          value={vorname}
          onChange={(e) => setVorname(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Nom"
          className="p-3 rounded bg-[#E3ECF3] text-[#1F2937] placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400"
          value={nachname}
          onChange={(e) => setNachname(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-[#E3ECF3] text-[#1F2937] placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="p-3 rounded bg-[#E3ECF3] text-[#1F2937] placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-[#10B981] hover:bg-[#059669] p-3 rounded text-white font-semibold mt-2 transition"
        >
          Sich anmelden
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm text-center ${
            message.includes("✅")
              ? "text-green-600"
              : message.includes("⚠️")
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}