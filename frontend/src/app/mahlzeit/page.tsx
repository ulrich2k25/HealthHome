"use client";
import React, { useState, useEffect } from "react";

export type MealType = "Frühstück" | "Mittagessen" | "Abendessen" | "Snack";

type Meal = {
  id: string;
  Name?: string;
  name: string;
  amount?: string;
  calories: number;
  time?: string;
  type: MealType;
  date?: string;
};

type MealFormValues = {
  name: string;
  Name?: string;
  amount: string;
  calories: string;
  time: string;
  type: MealType;
  date?: string;
};

export default function DashboardMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [meal, setMeal] = useState<MealFormValues>({
    name: "",
    amount: "",
    calories: "",
    time: "",
    type: "Frühstück",
    date: "",
  });
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // 🔽 nouveaux états pour le filtre
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 🧩 Charger tous les repas depuis la base
  useEffect(() => {
    const loadMeals = async () => {
      const res = await fetch("http://localhost:4000/api/nutrition");
      const data = await res.json();

      let filtered: Meal[] = [];

      if (period === "day") {
        filtered = data.filter(
          (m: Meal) => m.date && m.date.startsWith(selectedDate)
        );
      } else if (period === "week") {
        const start = new Date(selectedDate);
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() - start.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        filtered = data.filter((m: Meal) => {
          if (!m.date) return false;
          const d = new Date(m.date);
          return d >= weekStart && d <= weekEnd;
        });
      } else if (period === "month") {
        const [year, month] = selectedDate.split("-");
        filtered = data.filter(
          (m: Meal) => m.date && m.date.startsWith(`${year}-${month}`)
        );
      }

      setMeals(filtered);
    };
    loadMeals();
  }, [period, selectedDate]);

  // ➕ Ajouter un repas
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!meal.name || meal.calories === "") return;

    const newMeal = {
      name: meal.name,
      amount: meal.amount || "",
      calories: Number(meal.calories) || 0,
      time: meal.time || "",
      type: meal.type,
      date: meal.date || new Date().toISOString().split("T")[0],
    };

    const res = await fetch("http://localhost:4000/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMeal),
    });

    const data = await res.json();
    if (data.id) {
      setMeals((prev) => [data, ...prev]);
      setMeal({
        name: "",
        amount: "",
        calories: "",
        time: "",
        type: "Frühstück",
        date: "",
      });
    }
  };

  // 🗑️ Supprimer
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce repas ?")) return;
    await fetch(`http://localhost:4000/api/nutrition/${id}`, { method: "DELETE" });
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  // 💾 Sauvegarder modification
  const handleSaveEdit = async () => {
    if (!editingMeal) return;
    const res = await fetch(`http://localhost:4000/api/nutrition/${editingMeal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingMeal),
    });
    const data = await res.json();
    if (data.success) {
      setMeals((prev) =>
        prev.map((m) => (m.id === editingMeal.id ? editingMeal : m))
      );
      setEditingMeal(null);
    }
  };

  // 🔥 total calories affiché selon le filtre
  const totalCalories = meals.reduce(
    (sum, m) => sum + Number(m.calories || 0),
    0
  );

  // 🧾 Interface
  return (
  <div className="space-y-6 text-gray-800">
    {/* FORMULAIRE */}
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-700">Neue Mahlzeit hinzufügen</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="name"
          value={meal.name}
          onChange={(e) => setMeal({ ...meal, name: e.target.value })}
          placeholder="Mahlzeit"
          className="p-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400"
        />
        <input
          name="amount"
          value={meal.amount}
          onChange={(e) => setMeal({ ...meal, amount: e.target.value })}
          placeholder="Menge (g/ml)"
          className="p-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400"
        />
        <input
          name="calories"
          type="number"
          value={meal.calories}
          onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
          placeholder="Kalorien"
          className="p-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400"
        />
        <input
          name="date"
          type="date"
          value={meal.date || ""}
          onChange={(e) => setMeal({ ...meal, date: e.target.value })}
          className="p-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400"
        />
        <input
          name="time"
          type="time"
          value={meal.time}
          onChange={(e) => setMeal({ ...meal, time: e.target.value })}
          className="p-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400"
        />
        <select
          name="type"
          value={meal.type}
          onChange={(e) => setMeal({ ...meal, type: e.target.value as MealType })}
          className="p-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400"
        >
          <option>Frühstück</option>
          <option>Mittagessen</option>
          <option>Abendessen</option>
          <option>Snack</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium w-full transition-all"
      >
        Hinzufügen
      </button>
    </form>

    {/* TOTAL */}
    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex justify-between items-center">
      <div>
        <h3 className="text-gray-500 text-sm">Kalorienüberwachung</h3>
        <p className="text-xl font-semibold text-gray-800">
          {period === "day"
            ? "Tägliche Kalorienbilanz"
            : period === "week"
            ? "Wöchentliche Kalorienbilanz"
            : "Monatliche Kalorienbilanz"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-gray-500 text-sm">Gegessen</p>
        <p className="text-3xl font-bold text-green-600">{totalCalories}</p>
        <span className="text-gray-500 text-sm">kcal</span>
      </div>
    </div>

    {/* TABLEAU */}
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Gespeicherte Mahlzeiten</h3>

      {meals.length === 0 ? (
        <p className="text-gray-500">Keine Einträge</p>
      ) : (
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Menge</th>
              <th className="px-3 py-2">Kalorien</th>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Zeit</th>
              <th className="px-3 py-2">Typ</th>
              <th className="px-3 py-2 text-center">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((m) => (
              <tr
                key={m.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition-all"
              >
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2">{m.amount}</td>
                <td className="px-3 py-2 font-medium text-blue-600">{m.calories}</td>
                <td className="px-3 py-2">{m.date?.split("T")[0]}</td>
                <td className="px-3 py-2">{m.time}</td>
                <td className="px-3 py-2">{m.type}</td>
                <td className="text-center px-3 py-2 space-x-2">
                  <button
                    onClick={() => setEditingMeal(m)}
                    className="text-yellow-500 hover:text-yellow-600 transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
}