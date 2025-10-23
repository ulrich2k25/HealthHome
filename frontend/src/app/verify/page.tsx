"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/api/verify-code", {
        email,
        code,
      });

      if (res.data.success) {
        setMessage("✅ Vérification réussie !");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage("❌ Code incorrect ou expiré.");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Code incorrect ou erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl mb-6 font-semibold">Vérification Email</h2>

      <form
        onSubmit={handleVerify}
        className="flex flex-col gap-4 bg-gray-800 p-6 rounded-lg w-96 shadow-lg"
      >
        <input
          type="email"
          placeholder="Votre email"
          className="p-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Code à 6 chiffres"
          className="p-2 rounded text-black"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <button
          type="submit"
          className={`p-2 rounded text-white mt-4 ${
            loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Vérification..." : "Vérifier le code"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.includes("✅")
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
