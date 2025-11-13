"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socketIOClient from "socket.io-client";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Typage strict des vitaux
interface Vital {
  typ: string;
  datum: string;
  herz?: number;
  schlaf?: number;
  schritte?: number;
  systolisch?: number;
  diastolisch?: number;
  blutzucker?: number;
  temperatur?: number;
}

interface Meal {
  date: string;
  calories: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [latestVitals, setLatestVitals] = useState<Vital[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activeTab, setActiveTab] = useState("herz");

  /** ✅ Vérification du token */
  useEffect(() => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    if (!email || !token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/api/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) setIsAuthorized(true);
        else router.push("/login");
      })
      .catch(() => router.push("/login"))
      .finally(() => setCheckingAuth(false));
  }, [router]);

  /** 🔁 Fetch vitals / latestVitals / meals + WebSocket */
  useEffect(() => {
    const socket = socketIOClient(API_URL);

    const fetchVitals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vitals`);
        const data = await res.json();
        setVitals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des vitaux:", err);
      }
    };

    const fetchLatestVitals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vitals/latest`);
        const data = await res.json();
        setLatestVitals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des dernières valeurs:", err);
      }
    };

    const fetchMeals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/nutrition`);
        const data = await res.json();
        setMeals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des repas:", err);
      }
    };

    // Initial fetch
    fetchVitals();
    fetchLatestVitals();
    fetchMeals();

    // WebSocket updates
    socket.on("updateVitals", () => {
      fetchVitals();
      fetchLatestVitals();
    });

    // Auto refresh toutes les 10s
    const interval = setInterval(() => {
      fetchVitals();
      fetchLatestVitals();
      fetchMeals();
    }, 10000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  /** 📈 Récupération des dernières valeurs pour les cards */
  const getLatestValue = (typ: string) => latestVitals.find((v) => v.typ === typ);

  const latestHerz = getLatestValue("herz");
  const latestDruck = getLatestValue("blutdruck");
  const latestSchlaf = getLatestValue("schlaf");
  const latestSchritte = getLatestValue("schritte");
  const latestZucker = getLatestValue("blutzucker");
  const latestTemp = getLatestValue("temperatur");

  /** 📊 Données graphiques basées sur les dernières valeurs avec pré-remplissage semaine */
  const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const fillWeekData = (vitals: Vital[], typ: string, valueKey: keyof Vital) => {
    const dataMap: Record<string, number> = {};
    vitals.forEach((v) => {
      if (v.typ === typ && v[valueKey] !== undefined) {
        const day = new Date(v.datum).toLocaleDateString("de-DE", { weekday: "short" });
        dataMap[day] = Number(v[valueKey]);
      }
    });
    return daysOfWeek.map((day) => ({
      day,
      [valueKey]: dataMap[day] || 0,
    }));
  };

  const schlafData = fillWeekData(vitals, "schlaf", "schlaf");
  const schritteData = fillWeekData(vitals, "schritte", "schritte");

  const today = new Date().toLocaleDateString("de-DE", { weekday: "short" });
  const herzToday = vitals.find(
    (v) => v.typ === "herz" &&
      new Date(v.datum).toLocaleDateString("de-DE", { weekday: "short" }) === today
  );
  const herzData = daysOfWeek.map((day) => ({
    day,
    bpm: day === today && herzToday ? Number(herzToday.herz) : 0,
  }));

  const mealsMap: Record<string, number> = {};
  meals.forEach((m) => {
    const day = new Date(m.date).toLocaleDateString("de-DE", { weekday: "short" });
    mealsMap[day] = (mealsMap[day] || 0) + Number(m.calories);
  });
  const kalorienData = daysOfWeek.map((day) => ({
    day,
    kcal: mealsMap[day] || 0,
  }));

  const totalCalories = meals.reduce(
    (sum, m) => sum + Number(m.calories || 0),
    0
  );

  /** 🔘 Render chart */
  const renderChart = () => {
    switch (activeTab) {
      case "herz":
        return <AreaChartWrapper data={herzData} dataKey="bpm" stroke="#dc2626" />;
      case "schlaf":
        return <BarChartWrapper data={schlafData} dataKey="schlaf" stroke="#3b82f6" />;
      case "schritte":
        return <LineChartWrapper data={schritteData} dataKey="schritte" stroke="#16a34a" />;
      case "kalorien":
        return <AreaChartWrapper data={kalorienData} dataKey="kcal" stroke="#f59e0b" />;
    }
  };

  /** 🔹 Rendu */
  if (checkingAuth)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <p>Überprüfung der Anmeldung...</p>
      </div>
    );

  if (!isAuthorized) return null;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen text-gray-800">
      <div className="flex justify-end items-center gap-4 mb-4">
        <button
          onClick={() => router.push("/user-profile")}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700"
        >
          👤 <span>Profil</span>
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        🩺 Gesundheitsübersicht
      </h2>

      {/* 🧾 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard
          title="Herzfrequenz"
          value={latestHerz ? `${latestHerz.herz} BPM` : "--"}
          time={latestHerz ? new Date(latestHerz.datum).toLocaleString("de-DE") : ""}
          icon={<Heart className="text-red-500" />}
        />
        <HealthCard
          title="Blutdruck"
          value={
            latestDruck
              ? `${latestDruck.systolisch}/${latestDruck.diastolisch} mmHg`
              : "--"
          }
          time={latestDruck ? new Date(latestDruck.datum).toLocaleString("de-DE") : ""}
          icon={<Activity className="text-blue-500" />}
        />
        <HealthCard
          title="Schlaf"
          value={latestSchlaf ? `${latestSchlaf.schlaf} Std` : "--"}
          time={latestSchlaf ? new Date(latestSchlaf.datum).toLocaleString("de-DE") : ""}
          icon={<Clock className="text-purple-500" />}
        />
        <HealthCard
          title="Schritte"
          value={latestSchritte ? `${latestSchritte.schritte}` : "--"}
          time={latestSchritte ? new Date(latestSchritte.datum).toLocaleString("de-DE") : ""}
          icon={<Footprints className="text-yellow-500" />}
        />
        <HealthCard
          title="Blutzucker"
          value={latestZucker ? `${latestZucker.blutzucker} mg/dL` : "--"}
          time={latestZucker ? new Date(latestZucker.datum).toLocaleString("de-DE") : ""}
          icon={<Droplet className="text-pink-500" />}
        />
        <HealthCard
          title="Temperatur"
          value={latestTemp ? `${latestTemp.temperatur} °C` : "--"}
          time={latestTemp ? new Date(latestTemp.datum).toLocaleString("de-DE") : ""}
          icon={<Thermometer className="text-green-500" />}
        />
      </div>

      {/* 🔘 Tabs */}
      <div className="flex gap-2 mt-6">
        {["herz", "schlaf", "schritte", "kalorien"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab === "herz"
              ? "Herzfrequenz"
              : tab === "schlaf"
              ? "Schlaf"
              : tab === "schritte"
              ? "Schritte"
              : "Kalorien"}
          </button>
        ))}
      </div>

      {/* 📊 Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 h-64 shadow-sm mt-4">
        {renderChart()}
      </div>

      {/* 🔥 Total calories */}
      <div className="text-right text-gray-700">
        <p className="text-sm text-gray-500">Kalorienaufnahme</p>
        <p className="text-2xl font-bold text-green-600">{totalCalories} kcal</p>
      </div>
    </div>
  );
}

/* ---------------- HealthCard ---------------- */
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

/* ---------------- Graph Wrappers ---------------- */
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
