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

    console.log(res.data);
    if (res.data.success) {
      setMessage("✅ Inscription réussie ! Vérifiez votre e-mail pour le code.");
      // 👉 rediriger vers la page de vérification en gardant l’e-mail
      setTimeout(() => router.push(`/verify?email=${email}`), 1500);
    }
  } catch (err: any) {
    console.error(err);
    if (err.response?.status === 409) {
      setMessage("⚠️ Cet email existe déjà.");
    } else {
      setMessage("❌ Erreur d’inscription.");
    }
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl mb-6 font-semibold">Inscription HealthHome</h2>

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 bg-gray-800 p-6 rounded-lg w-96 shadow-lg"
      >
        <input
          type="text"
          placeholder="Prénom"
          className="p-2 rounded text-black"
          value={vorname}
          onChange={(e) => setVorname(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Nom"
          className="p-2 rounded text-black"
          value={nachname}
          onChange={(e) => setNachname(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="p-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 p-2 rounded text-white mt-4"
        >
          Sich anmelden
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-gray-300 text-center">{message}</p>
      )}
    </div>
  );
}
