"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Vitalwerte from "../vitalswerte/page";
import { io } from "socket.io-client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import {
  Heart,
  Activity,
  Clock,
  Footprints,
  Droplet,
  Thermometer,
} from "lucide-react";

const API_URL = "http://localhost:4000";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"herz" | "schlaf" | "schritte" | "kalorien">("herz");

  const [vitals, setVitals] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [showVitalModal, setShowVitalModal] = useState(false);

  // ✅ Vérification du token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setIsAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  // ✅ Fonctions de chargement
  const fetchVitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vitals`);
      const data = await res.json();
      setVitals(data || []);
    } catch (err) {
      console.error("Fehler beim Laden der Vitalwerte:", err);
    }
  };

  const fetchMeals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/nutrition`);
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetch meals:", err);
      setMeals([]);
    }
  };

  // ✅ Initialisation Socket.IO (une seule fois)
  useEffect(() => {
    const socket = io(API_URL);

    // Chargement initial
    fetchVitals();
    fetchMeals();

    // 🔁 Écoute des mises à jour temps réel
    socket.on("updateVitals", () => {
      console.log("🔄 Mise à jour des vitaux reçue !");
      fetchVitals();
    });

    socket.on("updateMeals", () => {
      console.log("🍽️ Mise à jour des repas reçue !");
      fetchMeals();
    });

    // 🔁 Sauvegarde automatique toutes les 10 sec (sécurité)
    const interval = setInterval(() => {
      fetchVitals();
      fetchMeals();
    }, 10000);

    // 🔒 Nettoyage à la fermeture
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  // 📊 Préparation des données graphiques
  const herzData = vitals
    .filter((v) => v.typ === "herz")
    .map((v) => ({
      time: new Date(v.datum).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bpm: Number(v.herz),
    }));

  const schlafData = vitals
    .filter((v) => v.typ === "schlaf")
    .map((v) => ({
      day: new Date(v.datum).toLocaleDateString("de-DE", { weekday: "short" }),
      hours: Number(v.schlaf),
    }));

  const schritteData = vitals
    .filter((v) => v.typ === "schritte")
    .map((v) => ({
      day: new Date(v.datum).toLocaleDateString("de-DE", { weekday: "short" }),
      steps: Number(v.schritte),
    }));

  const kalorienData = meals.map((m) => ({
    day: m.date || "Tag",
    kcal: Number(m.calories),
  }));

  const totalCalories = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);

  // 🔁 Sélection du graphique
  const renderChart = () => {
    switch (activeTab) {
      case "herz":
        return <AreaChartWrapper data={herzData} dataKey="bpm" stroke="#dc2626" />;
      case "schlaf":
        return <BarChartWrapper data={schlafData} dataKey="hours" stroke="#3b82f6" />;
      case "schritte":
        return <LineChartWrapper data={schritteData} dataKey="steps" stroke="#16a34a" />;
      case "kalorien":
        return <AreaChartWrapper data={kalorienData} dataKey="kcal" stroke="#f59e0b" />;
    }
  };

  if (checkingAuth)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <p>Überprüfung der Anmeldung...</p>
      </div>
    );

  if (!isAuthorized) return null;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Profil */}
      <div className="flex justify-end items-center gap-4 mb-4">
        <button
          onClick={() => router.push("/user-profile")}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700"
        >
          👤 <span>Profil</span>
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-2">🩺 Gesundheitsübersicht</h2>

      {/* Cartes santé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <HealthCard title="Herzfrequenz" value={`${herzData.at(-1)?.bpm || "--"} BPM`} time="Zuletzt: aktuell" icon={<Heart className="text-red-500" />} />
        <HealthCard title="Blutdruck" value="120/80 mmHg" time="Zuletzt: Heute" icon={<Activity className="text-blue-500" />} />
        <HealthCard title="Schlaf" value={`${schlafData.at(-1)?.hours || "--"} Std`} time="Zuletzt: letzte Nacht" icon={<Clock className="text-purple-500" />} />
        <HealthCard title="Schritte" value={`${schritteData.at(-1)?.steps || "--"}`} time="Zuletzt: Heute" icon={<Footprints className="text-yellow-500" />} />
        <HealthCard title="Blutzucker" value={`${vitals.find((v) => v.typ === "blutzucker")?.blutzucker || "--"} mg/dL`} time="Zuletzt: Heute" icon={<Droplet className="text-pink-500" />} />
        <HealthCard title="Temperatur" value={`${vitals.find((v) => v.typ === "temperatur")?.temperatur || "--"} °C`} time="Zuletzt: Heute" icon={<Thermometer className="text-green-500" />} />
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mt-6">
        {["herz", "schlaf", "schritte", "kalorien"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === tab ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab === "herz" ? "Herzfrequenz" : tab === "schlaf" ? "Schlaf" : tab === "schritte" ? "Schritte" : "Kalorien"}
          </button>
        ))}
      </div>

      {/* Graphique + bouton ajout */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 h-64 shadow-sm mt-4">
        {renderChart()}
       
        
      </div>

      {/* Calories totales */}
      <div className="text-right text-gray-700">
        <p className="text-sm text-gray-500">Kalorienaufnahme</p>
        <p className="text-2xl font-bold text-green-600">{totalCalories} kcal</p>
      </div>
    </div>
  );
}

/* Composants graphiques utilitaires */
function HealthCard({ title, value, time, icon }: { title: string; value: string; time: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-md flex flex-col justify-between h-40">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className="bg-green-100 p-2 rounded-full">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{time}</div>
    </div>
  );
}

function AreaChartWrapper({ data, dataKey, stroke }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <XAxis dataKey={data[0]?.time ? "time" : "day"} />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey={dataKey} stroke={stroke} fill={stroke} fillOpacity={0.25} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function LineChartWrapper({ data, dataKey, stroke }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={stroke} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChartWrapper({ data, dataKey, stroke }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={stroke} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
