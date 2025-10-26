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
  AreaChart,
  Area,
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

// 📊 Données simulées
const herzfrequenzData = [
  { time: "00:00", bpm: 62 },
  { time: "04:00", bpm: 58 },
  { time: "08:00", bpm: 72 },
  { time: "12:00", bpm: 76 },
  { time: "16:00", bpm: 82 },
  { time: "20:00", bpm: 70 },
  { time: "23:59", bpm: 64 },
];

const schlafData = [
  { day: "Mo", hours: 7.1 },
  { day: "Di", hours: 6.8 },
  { day: "Mi", hours: 7.5 },
  { day: "Do", hours: 8.0 },
  { day: "Fr", hours: 6.9 },
  { day: "Sa", hours: 7.9 },
  { day: "So", hours: 7.3 },
];

const schritteData = [
  { day: "Mo", steps: 8400 },
  { day: "Di", steps: 9600 },
  { day: "Mi", steps: 10400 },
  { day: "Do", steps: 12000 },
  { day: "Fr", steps: 8700 },
  { day: "Sa", steps: 13200 },
  { day: "So", steps: 9800 },
];

const kalorienData = [
  { day: "Mo", kcal: 1900 },
  { day: "Di", kcal: 2100 },
  { day: "Mi", kcal: 1950 },
  { day: "Do", kcal: 2200 },
  { day: "Fr", kcal: 2050 },
  { day: "Sa", kcal: 2450 },
  { day: "So", kcal: 2000 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"herz" | "schlaf" | "schritte" | "kalorien">("herz");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) router.push("/login");
    else setIsAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("email");
    router.push("/login");
  };

  const goToProfile = () => router.push("/user-profile");

  if (checkingAuth)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <p>Überprüfung der Anmeldung...</p>
      </div>
    );
  if (!isAuthorized) return null;

  const renderChart = () => {
    switch (activeTab) {
      case "herz":
        return (
          <>
            <h3 className="text-sm text-gray-500 mb-2">Herzfrequenz Heute</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={herzfrequenzData}>
                <XAxis dataKey="time" stroke="#4b5563" />
                <YAxis domain={[50, 90]} stroke="#4b5563" />
                <Tooltip />
                <Area type="monotone" dataKey="bpm" stroke="#dc2626" fill="#dc2626" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        );
      case "schlaf":
        return (
          <>
            <h3 className="text-sm text-gray-500 mb-2">Schlafdauer (h)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schlafData}>
                <XAxis dataKey="day" stroke="#4b5563" />
                <YAxis domain={[0, 10]} stroke="#4b5563" />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        );
      case "schritte":
        return (
          <>
            <h3 className="text-sm text-gray-500 mb-2">Tägliche Schritte</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={schritteData}>
                <XAxis dataKey="day" stroke="#4b5563" />
                <YAxis stroke="#4b5563" />
                <Tooltip />
                <Line type="monotone" dataKey="steps" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </>
        );
      case "kalorien":
        return (
          <>
            <h3 className="text-sm text-gray-500 mb-2">Kalorienverbrauch (kcal)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kalorienData}>
                <XAxis dataKey="day" stroke="#4b5563" />
                <YAxis stroke="#4b5563" />
                <Tooltip />
                <Area type="monotone" dataKey="kcal" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        );
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Barre supérieure */}
      <div className="flex justify-end items-center gap-4 mb-4">
        <button
          onClick={goToProfile}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700"
        >
          👤 <span>Profil</span>
        </button>
        
      </div>

      {/* Titre de section */}
      <h2 className="text-xl font-semibold text-gray-700 mb-2">🩺 Gesundheitsübersicht</h2>

      {/* Cartes de santé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <HealthCard title="Herzfrequenz" value="72 BPM" time="Zuletzt: vor 5 Min." icon={<Heart className="text-red-500" />} />
        <HealthCard title="Blutdruck" value="120/80 mmHg" time="Zuletzt: Heute 08:00" icon={<Activity className="text-blue-500" />} />
        <HealthCard title="Schlaf" value="7.5 Stunden" time="Zuletzt: Heute Nacht" icon={<Clock className="text-purple-500" />} />
        <HealthCard title="Schritte" value="5,842 heute" time="Zuletzt: vor 10 Min." icon={<Footprints className="text-yellow-500" />} />
        <HealthCard title="Blutzucker" value="95 mg/dL" time="Zuletzt: vor 2 Std." icon={<Droplet className="text-pink-500" />} />
        <HealthCard title="Temperatur" value="36.8 °C" time="Zuletzt: Heute 08:00" icon={<Thermometer className="text-green-500" />} />
      </div>

      {/* Onglets graphiques */}
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
      {/* Graphique dynamique */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 h-64 shadow-sm mt-4">
        {renderChart()}
      </div>
    </div>
  );
}

// 🧩 Composant carte de santé
function HealthCard({
  title,
  value,
  time,
  icon,
}: {
  title: string;
  value: string;
  time: string;
  icon: React.ReactNode;
}) {
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