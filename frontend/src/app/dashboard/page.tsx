"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Vitalwerte from "../../components/Vitalwerte";
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

// Données simulées
const mock = [
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

interface Meal {
  id?: number;
  name: string;
  amount?: string;
  calories: string;
  time?: string;
  type: string;
  date?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    "herz" | "schlaf" | "schritte" | "kalorien"
  >("herz");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [meal, setMeal] = useState<Meal>({
    name: "",
    amount: "",
    calories: "",
    time: "",
    type: "Frühstück",
  });
  const [vitals, setVitals] = useState<any[]>([]);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [data, setData] = useState(mock);

  const router = useRouter();
  const API_URL = "http://localhost:4000";

  // Vérification du token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setIsAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  // Charger les BPM
  useEffect(() => {
    setData(mock);
  }, []);

  // Charger les vitalwerte depuis le backend
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

  // Charger les meals depuis le backend
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

  // Changement de formulaire
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMeal((prev) => ({ ...prev, [name]: value }));
  };

  // Ajouter un repas
  const handleAddMeal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const mealWithDate = { ...meal, date: new Date().toISOString().split("T")[0] };
    if (!meal.name || !meal.calories) return;
    try {
      const res = await fetch(`${API_URL}/api/nutrition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealWithDate),
      });
      const newMeal = await res.json();
      setMeals((prev) => [...prev, newMeal]);
      setMeal({ name: "", amount: "", calories: "", time: "", type: "Frühstück" });
      setShowMealModal(false);
    } catch (err) {
      console.error("Erreur ajout meal:", err);
    }
  };

  const totalCalories = Array.isArray(meals)
    ? meals.reduce((sum, m) => sum + Number(m.calories || 0), 0)
    : 0;

  const goToProfile = () => router.push("/user-profile");

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <p>Überprüfung der Anmeldung...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  const renderChart = () => {
    switch (activeTab) {
      case "herz":
        return (
          <AreaChartWrapper data={mock} dataKey="bpm" stroke="#dc2626" fill="#dc2626" />
        );
      case "schlaf":
        return (
          <BarChartWrapper data={schlafData} dataKey="hours" stroke="#3b82f6" />
        );
      case "schritte":
        return (
          <LineChartWrapper data={schritteData} dataKey="steps" stroke="#16a34a" />
        );
      case "kalorien":
        return (
          <AreaChartWrapper data={kalorienData} dataKey="kcal" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
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

      {/* Titre */}
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

      {/* Graphique dynamique */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 h-64 shadow-sm mt-4">
        {renderChart()}
        <button
          onClick={() => setShowVitalModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-2"
        >
          + Vitalwerte
        </button>
        {showVitalModal && <Vitalwerte onClose={() => setShowVitalModal(false)} />}
      </div>

      {/* Suivi repas */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowMealModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span className="text-lg font-bold">+</span> Mahlzeit
        </button>
      </div>

      {showMealModal && (
        <MealModal meal={meal} handleChange={handleChange} handleAddMeal={handleAddMeal} onClose={() => setShowMealModal(false)} />
      )}

      <MealList meals={meals} totalCalories={totalCalories} />
    </div>
  );
}

// 🧩 Composant carte de santé
function HealthCard({ title, value, time, icon }: { title: string; value: string; time: string; icon: React.ReactNode; }) {
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

// Wrappers graphiques
function AreaChartWrapper({ data, dataKey, stroke, fill, fillOpacity }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <XAxis dataKey={data[0].time ? "time" : "day"} stroke="#4b5563" />
        <YAxis stroke="#4b5563" />
        <Tooltip />
        <Area type="monotone" dataKey={dataKey} stroke={stroke} fill={fill} fillOpacity={fillOpacity || 0.25} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function LineChartWrapper({ data, dataKey, stroke }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="day" stroke="#4b5563" />
        <YAxis stroke="#4b5563" />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChartWrapper({ data, dataKey, stroke }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="day" stroke="#4b5563" />
        <YAxis stroke="#4b5563" />
        <Tooltip />
        <Bar dataKey={dataKey} fill={stroke} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Modal Meal
function MealModal({ meal, handleChange, handleAddMeal, onClose }: any) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">Neue Mahlzeit</h2>
        <form onSubmit={handleAddMeal} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label htmlFor="meal-name" className="text-gray-400 text-sm mb-1">Mahlzeit</label>
              <input id="meal-name" name="name" value={meal.name} onChange={handleChange} placeholder="Mahlzeit" title="Mahlzeit" className="p-2 rounded-lg bg-gray-800 text-white" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="meal-amount" className="text-gray-400 text-sm mb-1">Menge</label>
              <input id="meal-amount" name="amount" value={meal.amount} onChange={handleChange} placeholder="Menge (g/ml)" title="Menge" className="p-2 rounded-lg bg-gray-800 text-white" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="meal-calories" className="text-gray-400 text-sm mb-1">Kalorien</label>
              <input id="meal-calories" type="number" name="calories" value={meal.calories} onChange={handleChange} placeholder="Kalorien" title="Kalorien" className="p-2 rounded-lg bg-gray-800 text-white" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="meal-time" className="text-gray-400 text-sm mb-1">Uhrzeit</label>
              <input id="meal-time" type="time" name="time" value={meal.time} onChange={handleChange} title="Uhrzeit" className="p-2 rounded-lg bg-gray-800 text-white" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="meal-type" className="text-gray-400 text-sm mb-1">Typ</label>
              <select id="meal-type" name="type" value={meal.type} onChange={handleChange} title="Typ" className="p-2 rounded-lg bg-gray-800 text-white">
                <option>Frühstück</option>
                <option>Mittagessen</option>
                <option>Abendessen</option>
                <option>Snack</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white w-full">Hinzufügen</button>
        </form>
        <button onClick={onClose} className="mt-4 text-gray-300 hover:text-white underline text-sm">Abbrechen</button>
      </div>
    </div>
  );
}

// Liste des repas
function MealList({ meals, totalCalories }: any) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4 shadow-lg w-full min-h-96">
        <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">Tägliche Mahlzeiten</h3>
        {meals.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">Keine Einträge</p>
        ) : (
          <ul className="space-y-3 overflow-y-auto max-h-80 pr-2">
            {meals.map((m: Meal, i: number) => (
              <li key={m.id || i} className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition p-3 rounded-lg text-sm">
                <div>
                  {m.date && <div className="mr-2 text-xs text-gray-400">{new Date(m.date).toLocaleDateString()}</div>}
                  <div className="flex items-center gap-2">
                    {m.time && <span className="text-sm text-gray-300">{m.time}</span>}
                    <span className="font-medium text-white">{m.name}</span>
                    <span className="ml-2 text-xs text-gray-400">({m.type})</span>
                    {m.amount && <span className="ml-2 text-xs text-gray-500">— {m.amount}</span>}
                  </div>
                </div>
                <div className="font-semibold text-green-400">{m.calories} kcal</div>
              </li>
            ))}
          </ul>
        )}
        <div className="text-right text-xl font-bold mt-4 text-green-500 border-t border-gray-700 pt-2">
          Gesamt: {totalCalories} kcal
        </div>
      </div>
    </div>
  );
}
