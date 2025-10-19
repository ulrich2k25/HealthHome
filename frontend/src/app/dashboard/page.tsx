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
  const [checkingAuth, setCheckingAuth] = useState(true); // ✅ nouveau hook
  const router = useRouter();

  // Vérifie si un token existe
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
    setCheckingAuth(false); // ✅ indique que la vérif est finie
  }, [router]);

  // ✅ Toujours placer les hooks avant tout "return"
  useEffect(() => {
    setData(mock);
  }, []);

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // 🟡 Pendant la vérification → on affiche un écran de chargement
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Vérification de la connexion...</p>
      </div>
    );
  }

  // 🔴 Si pas autorisé → redirection déjà faite mais on peut afficher un message
  if (!isAuthorized) {
    return null;
  }

  // ✅ Si connecté → afficher le dashboard
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Abmelden
        </button>
      </div>

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
