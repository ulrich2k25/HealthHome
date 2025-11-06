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
} from "recharts";

// --- Données pour le graphique ---
const mock = [
  { day: "Lun", bpm: 72 },
  { day: "Mar", bpm: 75 },
  { day: "Mer", bpm: 70 },
  { day: "Jeu", bpm: 78 },
  { day: "Ven", bpm: 74 },
  { day: "Sam", bpm: 76 },
  { day: "Dim", bpm: 73 },
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
  const [data, setData] = useState(mock);
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

  // Pour gérer l'affichage et fermer la fenetre mahlzeit
   const [showMealModal, setShowMealModal] = useState(false);
   const [showVitalModal, setShowVitalModal] = useState(false);//nouvelle fenetre vitalwerte 
  const router = useRouter();
  const API_URL = "http://localhost:4000"; // <-- backend
   

  //  Vérifie token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setIsAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  //  Charger les BPM
  useEffect(() => {
    setData(mock);
  }, []);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
 // Charger les vitalwerte depuis le backend
useEffect(() => {
  const fetchVitals = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/vitals");
      const data = await res.json();
      console.log("✅ Vitalwerte geladen:", data);
      setVitals(data);
    } catch (err) {
      console.error("Fehler beim Laden der Vitalwerte:", err);
    }
  };
  fetchVitals();
}, []);
  
  // 🔹 Charger les repas depuis le backend
useEffect(() => {
  const fetchMeals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/nutrition`);
      const data = await res.json();
      console.log("Données fetchées :", data); // pour debug
      // Si data est un tableau, on l'utilise, sinon on met un tableau vide
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetch meals:", err);
      setMeals([]);
    }
  };

  fetchMeals();
}, []);


  // 🔹 Gérer changement de formulaire
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMeal((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Ajouter un repas (POST vers backend)
  const handleAddMeal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

// ajouter la date actuelle si non fournie(automatiquement)
   const mealWithDate = {
  ...meal,
  date: new Date().toISOString().split("T")[0],
};
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
    } catch (err) {
      console.error("Erreur ajout meal:", err);
    }
  };

  // 🔹 Total calories
  const totalCalories = Array.isArray(meals)
  ? meals.reduce((sum, m) => sum + Number(m.calories || 0), 0)
  : 0;

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Vérification de la connexion...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="space-y-6">
      {/* Déconnexion */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Abmelden
        </button>
      </div>

    {/*  Bouton Vitalwerte */}
        <button
          onClick={() => setShowVitalModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          +Vitalwerte

        </button>
     

       {/*  Fenêtre Vitalwerte */}
     {/* Fenêtre Vitalwerte (réelle) */}
{showVitalModal && (
  <Vitalwerte onClose={() => setShowVitalModal(false)} />
)}



      {/* Indicateurs */}
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
          <div className="text-3xl font-bold">{totalCalories}</div>
        </div>
      </div>

      {/* Graphique Herzfrequenz */}
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

      {/* Bouton pour ouvrir le formulaire de nouvelle Mahlzeit */}
<div className="flex justify-end">
  <button
  onClick={() => setShowMealModal(true)}
  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
>
  <span className="text-lg font-bold">+</span> Mahlzeit
</button>

</div>


      {/* Suivi repas */}
      <div className="grid md:grid-cols-2 gap-4">

{showMealModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
    <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-4">Neue Mahlzeit</h2>


        {/* Formulaire */}
        <form
          onSubmit={handleAddMeal}
          className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3"
        >
          <h3 className="text-gray-400 text-sm mb-1">Neue Mahlzeit</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              name="name"
              value={meal.name}
              onChange={handleChange}
              placeholder="Mahlzeit"
              className="p-2 rounded-lg bg-gray-800 text-white"
            />
            <input
              name="amount"
              value={meal.amount}
              onChange={handleChange}
              placeholder="Menge (g/ml)"
              className="p-2 rounded-lg bg-gray-800 text-white"
            />
            <input
              name="calories"
              type="number"
              value={meal.calories}
              onChange={handleChange}
              placeholder="Kalorien"
              className="p-2 rounded-lg bg-gray-800 text-white"
            />
            <input
              name="time"
              type="time"
              value={meal.time}
              onChange={handleChange}
              className="p-2 rounded-lg bg-gray-800 text-white"
            />
            <select
              name="type"
              value={meal.type}
              onChange={handleChange}
              className="p-2 rounded-lg bg-gray-800 text-white"
            >
              <option>Frühstück</option>
              <option>Mittagessen</option>
              <option>Abendessen</option>
              <option>Snack</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white w-full"
          >
            Hinzufügen
          </button>
        </form>

<button
        onClick={() => setShowMealModal(false)}
        className="mt-4 text-gray-300 hover:text-white underline text-sm"
      >
        Abbrechen
      </button>
    </div>
  </div>
)}

        {/* Liste repas */}
        <div  className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4 shadow-lg w-full min-h-96">
          <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">Tägliche Mahlzeiten</h3>
          {meals.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Keine Einträge</p>
          ) : (
            <ul className="space-y-3 overflow-y-auto max-h-80 pr-2">
  {meals.map((m, i) => (
    <li
      key={m.id || i}
      className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition p-3 rounded-lg text-sm"
    >
      <div>
        {/* 🕒 Afficher la date si elle existe */}
        {m.date && (
          < div className="mr-2 text-xs text-gray-400">
            {new Date(m.date).toLocaleDateString()}
          </div>
        )}
        {/* 🕓 Heure */}
         <div className="flex items-center gap-2">
        {m.time && <span className="text-sm text-gray-300">{m.time}</span>}
        {/* 🍽 Nom du repas */}
        <span className="font-medium text-white">{m.name}</span>
        {/* 📍 Type */}
        <span className="ml-2 text-xs text-gray-400">({m.type})</span>
        {/* ⚖️ Quantité */}
        {m.amount && (
          <span className="ml-2 text-xs text-gray-500">— {m.amount}</span>
        )}
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
    </div>
  );
}
