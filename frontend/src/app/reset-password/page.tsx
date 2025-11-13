"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const text = await res.text();
      setMsg(text);

      if (res.ok) {
        setSuccess(true);

        // ✅ Redirection automatique vers le dashboard après 2 secondes
        setTimeout(() => {
          router.push("/dashboard"); // <-- change le chemin si ton dashboard a un autre nom
        }, 2000);
      }
    } catch (error) {
      setMsg("❌ Une erreur est survenue. Réessaie plus tard.");
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-80 text-center"
      >
        <h2 className="text-lg font-semibold mb-4">Neues Passwort setzen</h2>

        <input
          type="password"
          placeholder="Neues Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <button
          type="submit"
          className={`w-full py-2 rounded text-white ${
            success
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {success ? "Gespeichert ✅" : "Bestätigen"}
        </button>

        {msg && (
          <p
            className={`text-sm mt-3 ${
              success ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
