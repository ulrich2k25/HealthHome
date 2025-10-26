"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const mock = [
  { day: "Lun", bpm: 72 },
  { day: "Mar", bpm: 75 },
  { day: "Mer", bpm: 70 },
  { day: "Jeu", bpm: 78 },
  { day: "Ven", bpm: 74 },
  { day: "Sam", bpm: 76 },
  { day: "Dim", bpm: 73 },
];

export default function Dashboard() {
  const [data, setData] = useState(mock);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Vérifie si un email est présent
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      router.push("/login"); // redirection si pas d'email
    } else {
      setIsAuthorized(true);
    }
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    setData(mock);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("email"); // supprime email pour déconnexion
    router.push("/login");
  };

  const goToProfile = () => {
    router.push("/user-profile"); // redirection vers la page profil
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Überprüfung der Anmeldung...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen text-white">
      {/* Barre supérieure */}
      <div className="flex justify-end items-center gap-4 mb-4">
        <button
          onClick={goToProfile}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-full hover:bg-gray-700"
          title="Profil anzeigen"
        >
          👤
          <span>Profil</span>
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Abmelden
        </button>
      </div>

      {/* Cartes résumé */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">BPM</div>
          <div className="text-3xl font-bold">74</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Blutdruck</div>
          <div className="text-3xl font-bold">122/79</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Schlaf</div>
          <div className="text-3xl font-bold">7,2 h</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Kalorien</div>
          <div className="text-3xl font-bold">1 950</div>
        </div>
      </div>

      {/* Graphique BPM */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 h-64">
        <h3 className="text-sm text-gray-400 mb-2">Herzfrequenz (BPM)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
