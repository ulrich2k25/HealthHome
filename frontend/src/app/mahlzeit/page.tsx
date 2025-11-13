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
    <div className="space-y-6">
      {/* FORMULAIRE */}
      <form
        onSubmit={handleSubmit}
        className="bg-white-900 border border-gray-800 p-4 rounded-2xl space-y-3"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <input
            name="name"
            value={meal.name}
            onChange={(e) => setMeal({ ...meal, name: e.target.value })}
            placeholder="Mahlzeit"
            className="p-2 rounded-lg bg-white-800  border border-gray-200 text-black"
          />
          <input
            name="amount"
            value={meal.amount}
            onChange={(e) => setMeal({ ...meal, amount: e.target.value })}
            placeholder="Menge (g/ml)"
            className="p-2 rounded-lg bg-white-800 border border-gray-200 text-black"
          />
          <input
            name="calories"
            type="number"
            value={meal.calories}
            onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
            placeholder="Kalorien"
            className="p-2 rounded-lg bg-white-800 border border-gray-200 text-black"
          />
          <input
            name="date"
            type="date"
            value={meal.date || ""}
            onChange={(e) => setMeal({ ...meal, date: e.target.value })}
            className="p-2 rounded-lg bg-white-800 border border-gray-200 text-black"
          />
          <input
            name="time"
            type="time"
            value={meal.time}
            onChange={(e) => setMeal({ ...meal, time: e.target.value })}
            className="p-2 rounded-lg bg-white-800 border border-gray-200 text-black"



          />
          <select
            name="type"
            value={meal.type}
            onChange={(e) =>
              setMeal({ ...meal, type: e.target.value as MealType })
            }
            className="p-2 rounded-lg bg-white-800  border border-gray-200 text-black"
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

      {/* 🔽 Filtres période */}
      <div className="flex gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="p-2 bg-white-800 border border-gray-200 text-black rounded"
        >
          <option value="day">Tagesansicht</option>
          <option value="week">Wochenansicht</option>
          <option value="month">Monatsansicht</option>
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 bg-white-800 border border-gray-200 text-black rounded"
        />
      </div>

      {/* TOTAL */}
      <div className="bg-white-800 border border-gray-200 p-4 rounded-xl flex justify-between items-center">
        <div>
          <h3 className="text-gray-400 text-sm">Kalorienüberwachung</h3>
          <p className="text-xl font-bold text-black">
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

      {/* TABLEAU */}
      <div className="bg-white-900 border border-white-800 p-4 rounded-2xl">
        <h3 className="text-white font-semibold mb-3">Gespeicherte Mahlzeiten</h3>

        {meals.length === 0 ? (
          <p className="text-black-500">Keine Einträge</p>
        ) : (
          <table className="w-full text-sm text-left text-white-300">
            <thead className="bg-white-800 text-black-400 uppercase text-xs">
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
                <tr key={m.id} className="border-t border-white-700 hover:bg-white-800/40">
                  {editingMeal?.id === m.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          value={editingMeal.name}
                          onChange={(e) =>
                            setEditingMeal({ ...editingMeal, name: e.target.value })
                          }
                          className="bg-white-700 text-black rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={editingMeal.amount}
                          onChange={(e) =>
                            setEditingMeal({ ...editingMeal, amount: e.target.value })
                          }
                          className="bg-white-700 text-black rounded px-2 py-1 w-full"
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
                          className="bg-white-700 text-black rounded px-2 py-1 w-full"
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
                          className="bg-white-600 hover:bg-white-700 px-3 py-1 rounded text-white"
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
        )}
      </div>
    </div>
  );
}
