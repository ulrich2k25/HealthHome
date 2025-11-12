"use client";
import React, { useState, useEffect } from "react";
import { useAutoSave } from "../../lib/useAutoSave";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

  useAutoSave("MealForm", meal, setMeal, "http://localhost:4000/api/backup");

  function getWeekRangeISO(d: Date) {
    const day = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - day);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const start = monday.toISOString().slice(0, 10);
    const end = sunday.toISOString().slice(0, 10);
    return { start, end };
  }

  function getMonthRange(d: Date) {
    const y = d.getFullYear();
    const m = d.getMonth();
    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0);
    const start = startDate.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);
    return { start, end };
  }

  useEffect(() => {
    const loadMeals = async () => {
      const date = new Date(selectedDate);
      let url = "";

      if (period === "day") {
        url = `${API_BASE}/api/nutrition/by-date/${selectedDate}`;
      } else if (period === "week") {
        const { start, end } = getWeekRangeISO(date);
        url = `${API_BASE}/api/nutrition/by-range?start=${start}&end=${end}`;
      } else {
        const { start, end } = getMonthRange(date);
        url = `${API_BASE}/api/nutrition/by-range?start=${start}&end=${end}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : []);
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
    // ✅ RECHARGE LA LISTE COMPLÈTE DEPUIS LA BASE
    const date = new Date(selectedDate);
    let url = "";

    if (period === "day") {
      url = `${API_BASE}/api/nutrition/by-date/${selectedDate}`;
    } else if (period === "week") {
      const { start, end } = getWeekRangeISO(date);
      url = `${API_BASE}/api/nutrition/by-range?start=${start}&end=${end}`;
    } else {
      const { start, end } = getMonthRange(date);
      url = `${API_BASE}/api/nutrition/by-range?start=${start}&end=${end}`;
    }

    const reloadRes = await fetch(url);
    const meals = await reloadRes.json();
    setMeals(Array.isArray(meals) ? meals : []);

    // Réinitialise le formulaire
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

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce repas ?")) return;
    await fetch(`http://localhost:4000/api/nutrition/${id}`, { method: "DELETE" });
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

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

  return (
    <div className="space-y-6">
      {/* FORMULAIRE */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl space-y-3"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <input
            name="name"
            value={meal.name}
            onChange={(e) => setMeal({ ...meal, name: e.target.value })}
            placeholder="Mahlzeit"
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          <input
            name="amount"
            value={meal.amount}
            onChange={(e) => setMeal({ ...meal, amount: e.target.value })}
            placeholder="Menge (g/ml)"
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          <input
            name="calories"
            type="number"
            value={meal.calories}
            onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
            placeholder="Kalorien"
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          <input
            name="date"
            type="date"
            value={meal.date || ""}
            onChange={(e) => setMeal({ ...meal, date: e.target.value })}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          <input
            name="time"
            type="time"
            value={meal.time}
            onChange={(e) => setMeal({ ...meal, time: e.target.value })}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          <select
            name="type"
            value={meal.type}
            onChange={(e) =>
              setMeal({ ...meal, type: e.target.value as MealType })
            }
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          >
            <option>Frühstück</option>
            <option>Mittagessen</option>
            <option>Abendessen</option>
            <option>Snack</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white w-full"
        >
          Hinzufügen
        </button>
      </form>

      {/* FILTRES */}
      <div className="flex gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="p-2 border border-gray-300 bg-white text-gray-800 rounded"
        >
          <option value="day">Tagesansicht</option>
          <option value="week">Wochenansicht</option>
          <option value="month">Monatsansicht</option>
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border border-gray-300 bg-white text-gray-800 rounded"
        />
      </div>

      {/* TOTAL */}
      <div className="bg-gray-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
        <div>
          <h3 className="text-gray-600 text-sm">Kalorienüberwachung</h3>
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

      {/* LISTE */}
      <div>
        <h4 className="text-gray-600 text-sm mb-2">Mahlzeiten</h4>
        {meals.length === 0 ? (
          <p className="text-gray-500">Keine Einträge</p>
        ) : (
          <ul className="space-y-2">
            {meals.map((m) => (
              <li
                key={m.id}
                className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
              >
                {editingMeal?.id === m.id ? (
                  <div className="flex flex-col w-full gap-2">
                    <input
                      value={editingMeal.name}
                      onChange={(e) =>
                        setEditingMeal({ ...editingMeal, name: e.target.value })
                      }
                      className="p-1 rounded border border-gray-300 bg-white text-gray-800"
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
                      className="p-1 rounded border border-gray-300 bg-white text-gray-800"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-green-500 rounded text-white"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => setEditingMeal(null)}
                        className="px-3 py-1 bg-gray-300 rounded text-gray-700"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-gray-800">{m.name}</p>
                      <div className="text-sm text-gray-500 flex gap-2 items-center">
                        {m.time && <span>{m.time}</span>}
                        {m.type && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              m.type === "Frühstück"
                                ? "bg-yellow-100 text-yellow-700"
                                : m.type === "Mittagessen"
                                ? "bg-blue-100 text-blue-700"
                                : m.type === "Abendessen"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {m.type}
                          </span>
                        )}
                        {m.amount && <span className="text-xs">({m.amount}g)</span>}
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <p className="font-semibold text-gray-700">
                        {m.calories} kcal
                      </p>
                      <button
                        onClick={() => setEditingMeal(m)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-red-500 hover:text-red-600"
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
