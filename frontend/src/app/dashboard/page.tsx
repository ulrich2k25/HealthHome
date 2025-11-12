"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import Vitalwerte from "../vitalswerte/page";
//import { io } from "socket.io-client";
import { getSocket } from "@/lib/socket";


=======
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
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

<<<<<<< HEAD
const API_URL = process.env.NEXT_PUBLIC_API_URL ||"http://localhost:4000/api";
=======
// =======================
// 🔹 Données simulées
// =======================
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
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7

// =======================
// 💳 Composant HealthCard
// =======================
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

// =======================
// 🧠 Page principale Dashboard
// =======================
export default function Dashboard() {
<<<<<<< HEAD
=======
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
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
  const router = useRouter();
 // const [isAuthorized, setIsAuthorized] = useState(false);
  //const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"herz" | "schlaf" | "schritte" | "kalorien">("herz");

<<<<<<< HEAD
  const [vitals, setVitals] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  //const [showVitalModal, setShowVitalModal] = useState(false);

  // ✅ Vérification du token
  /*useEffect(() => {
=======
  useEffect(() => {
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setIsAuthorized(true);
    setCheckingAuth(false);
  }, [router]);*/

<<<<<<< HEAD
  // ✅ Fonctions de chargement
  const fetchVitals = async () => {
  try {
    const res = await fetch(`${API_URL}/vitals`);
    const data = await res.json();

    // ✅ Si le backend renvoie un objet (et non un tableau), on le force en tableau
    const arrayData = Array.isArray(data) ? data : [data];
    setVitals(arrayData);
  } catch (err) {
    console.error("Fehler beim Laden der Vitalwerte:", err);
  }
};


  const fetchMeals = async () => {
    try {
      const res = await fetch(`${API_URL}/nutrition`);
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : []);
=======
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMeal((prev) => ({ ...prev, [name]: value }));
  };

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
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
    } catch (err) {
      console.error("Erreur fetch meals:", err);
      setMeals([]);
    }
  };

  // ✅ Initialisation Socket.IO (une seule fois)
  useEffect(() => {
    const socket = getSocket();

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

 /* if (checkingAuth)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <p>Überprüfung der Anmeldung...</p>
      </div>
    );*/

<<<<<<< HEAD
  //if (!isAuthorized) return null;
=======
  if (!isAuthorized) return null;
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7

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

<<<<<<< HEAD
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
=======
      {/* Titre */}
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

      {/* Liste des repas */}
      <MealList meals={meals} totalCalories={totalCalories} />
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
    </div>
  );
}

<<<<<<< HEAD
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
=======
// ==========================
// 🍽️ Liste des repas
// ==========================
function MealList({ meals, totalCalories }: any) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-10">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4 shadow-lg w-full min-h-96">
        <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
          Tägliche Mahlzeiten
        </h3>
        {meals.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">Keine Einträge</p>
        ) : (
          <ul className="space-y-3 overflow-y-auto max-h-80 pr-2">
            {meals.map((m: Meal, i: number) => (
              <li
                key={m.id || i}
                className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition p-3 rounded-lg text-sm"
              >
                <div>
                  {m.date && (
                    <div className="mr-2 text-xs text-gray-400">
                      {new Date(m.date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {m.time && (
                      <span className="text-sm text-gray-300">{m.time}</span>
                    )}
                    <span className="font-medium text-white">{m.name}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      ({m.type})
                    </span>
                    {m.amount && (
                      <span className="ml-2 text-xs text-gray-500">
                        — {m.amount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-semibold text-green-400">
                  {m.calories} kcal
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="text-right text-xl font-bold mt-4 text-green-500 border-t border-gray-700 pt-2">
          Gesamt: {totalCalories} kcal
        </div>
      </div>

      <DownloadSection />
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
    </div>
  );
}

<<<<<<< HEAD
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
=======
// ==========================
// 📦 Composant : DownloadSection
// ==========================
function DownloadSection() {
  const [userId, setUserId] = useState<number | null>(null);
  const [showExportBox, setShowExportBox] = useState(false);
  const [showMailBox, setShowMailBox] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("pdf");

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) setUserId(Number(storedId));
  }, []);

  const downloadFile = async (format: string) => {
    if (!userId) return alert("User ID not found!");
    try {
      const response = await fetch(
        `http://localhost:4000/api/export/${format}?id=${userId}`
      );
      if (!response.ok) return alert("Error downloading file.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `HealthData_${userId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportBox(false);
    } catch {
      alert("Error generating file.");
    }
  };

  const sendMailToDoctor = async () => {
    if (!userId) return alert("User ID not found!");
    if (!doctorEmail) return alert("Bitte E-Mail-Adresse des Arztes eingeben!");
    try {
      const response = await fetch("http://localhost:4000/api/send-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, doctorEmail, format: selectedFormat }),
      });
      if (!response.ok) throw new Error();
      alert("✅ E-Mail wurde erfolgreich gesendet!");
      setShowMailBox(false);
    } catch {
      alert("❌ Fehler beim Senden der E-Mail.");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-4">
        <button
          onClick={() => {
            setShowExportBox((p) => !p);
            setShowMailBox(false);
          }}
          className="bg-white text-gray-900 px-6 py-3 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2"
        >
          📄 <span>Datenexport</span>
        </button>

        <button
          onClick={() => {
            setShowMailBox((p) => !p);
            setShowExportBox(false);
          }}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg shadow-md hover:bg-slate-800 transition flex items-center gap-2"
        >
          ✉️ <span>Per E-Mail an Arzt senden</span>
        </button>
      </div>

      {showExportBox && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-full max-w-sm">
          <p className="text-gray-700 font-semibold mb-3">Wähle ein Format:</p>
          <div className="flex gap-3">
            <button
              onClick={() => downloadFile("pdf")}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
            >
              PDF
            </button>
            <button
              onClick={() => downloadFile("csv")}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
            >
              CSV
            </button>
          </div>
          <button
            onClick={() => setShowExportBox(false)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg py-2 mt-3 transition"
          >
            Abbrechen
          </button>
        </div>
      )}

      {showMailBox && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-full max-w-sm">
          <p className="text-gray-700 font-semibold mb-3">
            E-Mail des Arztes eingeben:
          </p>
          <input
            type="email"
            value={doctorEmail}
            onChange={(e) => setDoctorEmail(e.target.value)}
            placeholder="arzt@example.de"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <p className="text-gray-700 font-semibold mb-3">Format wählen:</p>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 bg-white text-gray-900"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowMailBox(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg py-2 transition"
            >
              Abbrechen
            </button>
            <button
              onClick={sendMailToDoctor}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Senden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
