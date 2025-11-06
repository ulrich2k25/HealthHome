"use client";
import React, { useState, useEffect } from "react";
import { useAutoSave } from "../../lib/useAutoSave";

// TYPES
export type MealType = "Frühstück" | "Mittagessen" | "Abendessen" | "Snack";

type Meal = {
  id: string;
  name: string;
  amount?: string;
  calories: number;
  time?: string;
  type: MealType;
  date?: string;
};

type MealFormValues = {
  name: string;
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
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // 🔁 Autosave du formulaire localement
  useAutoSave("MealForm", meal, setMeal, "http://localhost:4000/api/backup");

  // 🧩 Charger repas depuis le backend
  useEffect(() => {
    const loadMeals = async () => {
      let url = "";
      const date = new Date(selectedDate);

      if (period === "day") {
        url = `http://localhost:4000/api/nutrition/by-date/${selectedDate}`;
      } else if (period === "week") {
        const year = date.getFullYear();
        const firstJan = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((+date - +firstJan) / 86400000);
        const week = Math.ceil((days + firstJan.getDay() + 1) / 7);
        url = `http://localhost:4000/api/nutrition/by-week/${year}/${week}`;
      } else {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        url = `http://localhost:4000/api/nutrition/by-month/${year}/${month}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setMeals(data);
    };
    loadMeals();
  }, [period, selectedDate]);

  const totalCalories = meals.reduce(
    (sum, m) => sum + Number(m.calories || 0),
    0
  );

  // 🧩 Ajouter un repas
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

  // 🗑️ Supprimer un repas
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

  // 🧾 Rendu UI
  return (
    <div className="space-y-6">
      {/* FORMULAIRE */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <input
            name="name"
            value={meal.name}
            onChange={(e) => setMeal({ ...meal, name: e.target.value })}
            placeholder="Mahlzeit"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
          <input
            name="amount"
            value={meal.amount}
            onChange={(e) => setMeal({ ...meal, amount: e.target.value })}
            placeholder="Menge (g/ml)"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
          <input
            name="calories"
            type="number"
            value={meal.calories}
            onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
            placeholder="Kalorien"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
          <input
            name="date"
            type="date"
            value={meal.date || ""}
            onChange={(e) => setMeal({ ...meal, date: e.target.value })}
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
          <input
            name="time"
            type="time"
            value={meal.time}
            onChange={(e) => setMeal({ ...meal, time: e.target.value })}
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
          <select
            name="type"
            value={meal.type}
            onChange={(e) =>
              setMeal({ ...meal, type: e.target.value as MealType })
            }
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

      {/* FILTRES */}
      <div className="flex gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="p-2 bg-gray-800 text-white rounded"
        >
          <option value="day">Tagesansicht</option>
          <option value="week">Wochenansicht</option>
          <option value="month">Monatsansicht</option>
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 bg-gray-800 text-white rounded"
        />
      </div>

      {/* TOTAL */}
      <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
        <div>
          <h3 className="text-gray-400 text-sm">Kalorienüberwachung</h3>
          <p className="text-xl font-bold text-white">
            {period === "day"
              ? "Tägliche Kalorienbilanz"
              : period === "week"
              ? "Wöchentliche Kalorienbilanz"
              : "Monatliche Kalorienbilanz"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Gegessen</p>
          <p className="text-3xl font-bold text-green-500">{totalCalories}</p>
          <span className="text-gray-400 text-sm">kcal</span>
        </div>
      </div>

      {/* LISTE DES REPAS */}
      <div>
        <h4 className="text-gray-400 text-sm mb-2">Mahlzeiten</h4>
        {meals.length === 0 ? (
          <p className="text-gray-500">Keine Einträge</p>
        ) : (
          <ul className="space-y-2">
            {meals.map((m) => (
              <li
                key={m.id}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"
              >
                {editingMeal?.id === m.id ? (
                  <div className="flex flex-col w-full gap-2">
                    <input
                      value={editingMeal.name}
                      onChange={(e) =>
                        setEditingMeal({ ...editingMeal, name: e.target.value })
                      }
                      className="p-1 rounded bg-gray-700 text-white"
                    />
                    <input
                      value={editingMeal.calories}
                      type="number"
                      onChange={(e) =>
                        setEditingMeal({
                          ...editingMeal,
                          calories: Number(e.target.value),
                        })
                      }
                      className="p-1 rounded bg-gray-700 text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-green-600 rounded text-white"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => setEditingMeal(null)}
                        className="px-3 py-1 bg-gray-600 rounded text-white"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-white">{m.name}</p>
                      <div className="text-sm text-gray-400 flex gap-2 items-center">
                        {m.time && <span>{m.time}</span>}
                        {m.type && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              m.type === "Frühstück"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : m.type === "Mittagessen"
                                ? "bg-blue-500/20 text-blue-400"
                                : m.type === "Abendessen"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {m.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <p className="font-semibold text-gray-200">
                        {m.calories} kcal
                      </p>
                      <button
                        onClick={() => setEditingMeal(m)}
                        className="text-blue-400 hover:text-blue-500"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-red-400 hover:text-red-500"
                        title="Löschen"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
