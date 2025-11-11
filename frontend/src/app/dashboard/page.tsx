"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Activity,
  Clock,
  Footprints,
  Droplet,
  Thermometer,
} from "lucide-react";

const mock = [
  { time: "00:00", bpm: 62 },
  { time: "04:00", bpm: 58 },
  { time: "08:00", bpm: 72 },
  { time: "12:00", bpm: 76 },
  { time: "16:00", bpm: 82 },
  { time: "20:00", bpm: 70 },
  { time: "23:59", bpm: 64 },
];

interface Meal {
  id?: number;
  name: string;
  amount?: string;
  calories: string;
  time?: string;
  type: string;
  date?: string;
}

function HealthCard({
  title,
  value,
  time,
  icon,
  color = "text-gray-800",
}: {
  title: string;
  value: string;
  time: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-md flex flex-col justify-between h-40 hover:shadow-lg transition">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className="bg-gray-100 p-2 rounded-full">{icon}</div>
      </div>
      <div className={`text-3xl font-bold mt-2 ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{time}</div>
    </div>
  );
}

export default function Dashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const router = useRouter();
  const API_URL = "http://localhost:4000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setIsAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vitals`);
        const data = await res.json();
        setVitals(data);
      } catch (err) {
        console.error("Fehler beim Laden der Vitalwerte:", err);
      }
    };
    fetchVitals();
  }, []);

  useEffect(() => {
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
    fetchMeals();
  }, []);

  const totalCalories = Array.isArray(meals)
    ? meals.reduce((sum, m) => sum + Number(m.calories || 0), 0)
    : 0;

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <p>Überprüfung der Anmeldung...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen text-gray-800">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        🩺 Gesundheitsübersicht
      </h2>

      {/* Cartes principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard
          title="Herzfrequenz"
          value="72 BPM"
          time="Zuletzt: vor 5 Min."
          icon={<Heart className="text-red-500" />}
          color="text-red-600"
        />
        <HealthCard
          title="Blutdruck"
          value="120/80 mmHg"
          time="Zuletzt: Heute 08:00"
          icon={<Activity className="text-blue-500" />}
          color="text-blue-600"
        />
        <HealthCard
          title="Schlaf"
          value="7.5 Stunden"
          time="Zuletzt: Heute Nacht"
          icon={<Clock className="text-purple-500" />}
          color="text-purple-600"
        />
        <HealthCard
          title="Schritte"
          value="5 842 heute"
          time="Zuletzt: vor 10 Min."
          icon={<Footprints className="text-yellow-500" />}
          color="text-yellow-600"
        />
        <HealthCard
          title="Blutzucker"
          value="95 mg/dL"
          time="Zuletzt: vor 2 Std."
          icon={<Droplet className="text-pink-500" />}
          color="text-pink-600"
        />
        <HealthCard
          title="Temperatur"
          value="36.8 °C"
          time="Zuletzt: Heute 08:00"
          icon={<Thermometer className="text-green-500" />}
          color="text-green-600"
        />
      </div>
    </div>
  );
}
