"use client";
import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { useAutoSave } from "../../lib/useAutoSave";
=======
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7

export type MealType = "Frühstück" | "Mittagessen" | "Abendessen" | "Snack";

type Meal = {
  id: string;
<<<<<<< HEAD
=======
  Name?: string;
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
  name: string;
  amount?: string;
  calories: number;
  time?: string;
  type: MealType;
  date?: string;
};

type MealFormValues = {
  name: string;
<<<<<<< HEAD
=======
  Name?: string;
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
  amount: string;
  calories: string;
  time: string;
  type: MealType;
  date?: string;
};

<<<<<<< HEAD
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

=======
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
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
<<<<<<< HEAD
=======
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // 🔽 nouveaux états pour le filtre
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
<<<<<<< HEAD
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
=======

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
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
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
<<<<<<< HEAD
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
=======
      setMeals((prev) => [data, ...prev]);
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
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

<<<<<<< HEAD
=======
  // 🗑️ Supprimer
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce repas ?")) return;
    await fetch(`http://localhost:4000/api/nutrition/${id}`, { method: "DELETE" });
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

<<<<<<< HEAD
=======
  // 💾 Sauvegarder modification
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
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

<<<<<<< HEAD
=======
  // 🔥 total calories affiché selon le filtre
  const totalCalories = meals.reduce(
    (sum, m) => sum + Number(m.calories || 0),
    0
  );

  // 🧾 Interface
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
  return (
    <div className="space-y-6">
      {/* FORMULAIRE */}
      <form
        onSubmit={handleSubmit}
<<<<<<< HEAD
        className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl space-y-3"
=======
        className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
      >
        <div className="grid md:grid-cols-2 gap-3">
          <input
            name="name"
            value={meal.name}
            onChange={(e) => setMeal({ ...meal, name: e.target.value })}
            placeholder="Mahlzeit"
<<<<<<< HEAD
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
=======
            className="p-2 rounded-lg bg-gray-800 text-white"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
          />
          <input
            name="amount"
            value={meal.amount}
            onChange={(e) => setMeal({ ...meal, amount: e.target.value })}
            placeholder="Menge (g/ml)"
<<<<<<< HEAD
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
=======
            className="p-2 rounded-lg bg-gray-800 text-white"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
          />
          <input
            name="calories"
            type="number"
            value={meal.calories}
            onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
            placeholder="Kalorien"
<<<<<<< HEAD
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
=======
            className="p-2 rounded-lg bg-gray-800 text-white"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
          />
          <input
            name="date"
            type="date"
            value={meal.date || ""}
            onChange={(e) => setMeal({ ...meal, date: e.target.value })}
<<<<<<< HEAD
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
=======
            className="p-2 rounded-lg bg-gray-800 text-white"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
          />
          <input
            name="time"
            type="time"
            value={meal.time}
            onChange={(e) => setMeal({ ...meal, time: e.target.value })}
<<<<<<< HEAD
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
=======
            className="p-2 rounded-lg bg-gray-800 text-white"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
          />
          <select
            name="type"
            value={meal.type}
            onChange={(e) =>
              setMeal({ ...meal, type: e.target.value as MealType })
            }
<<<<<<< HEAD
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
=======
            className="p-2 rounded-lg bg-gray-800 text-white"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
          >
            <option>Frühstück</option>
            <option>Mittagessen</option>
            <option>Abendessen</option>
            <option>Snack</option>
          </select>
        </div>
        <button
          type="submit"
<<<<<<< HEAD
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white w-full"
=======
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white w-full"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
        >
          Hinzufügen
        </button>
      </form>

<<<<<<< HEAD
      {/* FILTRES */}
=======
      {/* 🔽 Filtres période */}
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
      <div className="flex gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
<<<<<<< HEAD
          className="p-2 border border-gray-300 bg-white text-gray-800 rounded"
=======
          className="p-2 bg-gray-800 text-white rounded"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
        >
          <option value="day">Tagesansicht</option>
          <option value="week">Wochenansicht</option>
          <option value="month">Monatsansicht</option>
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
<<<<<<< HEAD
          className="p-2 border border-gray-300 bg-white text-gray-800 rounded"
=======
          className="p-2 bg-gray-800 text-white rounded"
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
        />
      </div>

      {/* TOTAL */}
<<<<<<< HEAD
      <div className="bg-gray-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
        <div>
          <h3 className="text-gray-600 text-sm">Kalorienüberwachung</h3>
          <p className="text-xl font-semibold text-gray-800">
=======
      <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
        <div>
          <h3 className="text-gray-400 text-sm">Kalorienüberwachung</h3>
          <p className="text-xl font-bold text-white">
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
            {period === "day"
              ? "Tägliche Kalorienbilanz"
              : period === "week"
              ? "Wöchentliche Kalorienbilanz"
              : "Monatliche Kalorienbilanz"}
          </p>
        </div>
        <div className="text-right">
<<<<<<< HEAD
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
=======
          <p className="text-gray-400 text-sm">Gegessen</p>
          <p className="text-3xl font-bold text-green-500">{totalCalories}</p>
          <span className="text-gray-400 text-sm">kcal</span>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <h3 className="text-white font-semibold mb-3">Gespeicherte Mahlzeiten</h3>

        {meals.length === 0 ? (
          <p className="text-gray-500">Keine Einträge</p>
        ) : (
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
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
                <tr key={m.id} className="border-t border-gray-700 hover:bg-gray-800/40">
                  {editingMeal?.id === m.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          value={editingMeal.name}
                          onChange={(e) =>
                            setEditingMeal({ ...editingMeal, name: e.target.value })
                          }
                          className="bg-gray-700 text-white rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={editingMeal.amount}
                          onChange={(e) =>
                            setEditingMeal({ ...editingMeal, amount: e.target.value })
                          }
                          className="bg-gray-700 text-white rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={editingMeal.calories}
                          onChange={(e) =>
                            setEditingMeal({
                              ...editingMeal,
                              calories: Number(e.target.value),
                            })
                          }
                          className="bg-gray-700 text-white rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td colSpan={3}></td>
                      <td className="text-center">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white mr-2"
                        >
                          💾
                        </button>
                        <button
                          onClick={() => setEditingMeal(null)}
                          className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-white"
                        >
                          ❌
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2">{m.Name || m.name}</td>
                      <td className="px-3 py-2">{m.amount}</td>
                      <td className="px-3 py-2">{m.calories}</td>
                      <td className="px-3 py-2">{m.date?.split("T")[0]}</td>
                      <td className="px-3 py-2">{m.time}</td>
                      <td className="px-3 py-2">{m.type}</td>
                      <td className="text-center px-3 py-2">
                        <button
                          onClick={() => setEditingMeal(m)}
                          className="text-yellow-400 hover:text-yellow-500 mr-3"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-red-400 hover:text-red-500"
                        >
                          🗑️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
        )}
      </div>
    </div>
  );
}
