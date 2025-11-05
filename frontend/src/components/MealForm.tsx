"use client";
import React, { useState } from "react";

export type MealType = "Frühstück" | "Mittagessen" | "Abendessen" | "Snack";

export type MealFormValues = {
  name: string;
  amount: string;
  calories: string; // on garde string ici pour l'input, on convertira en number à l'envoi
  time: string;
  type: MealType;
  date?: string;
};

type Meal = {
  id: string;
  name: string;
  amount?: string;
  calories: number;
  time?: string;
  type: MealType;
  date?: string;
};

type Props = {
  onAddMeal: (meal: Meal) => void;
};

export default function MealForm({ onAddMeal }: Props) {
  const [meal, setMeal] = useState<MealFormValues>({
    name: "",
    amount: "",
    calories: "",
    time: "",
    type: "Frühstück",
    date: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMeal((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!meal.name || meal.calories === "") return;

    const newMeal: Meal = {
      id: Date.now().toString(),
      name: meal.name,
      amount: meal.amount || undefined,
      calories: Number(meal.calories) || 0,
      time: meal.time || undefined,
      type: meal.type,
      date: meal.date || undefined,
    };

    onAddMeal(newMeal);

    setMeal({
      name: "",
      amount: "",
      calories: "",
      time: "",
      type: "Frühstück",
      date: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3"
    >
      <div className="grid md:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label htmlFor="meal-name" className="text-gray-400 text-sm mb-1">Mahlzeit</label>
          <input
            id="meal-name"
            name="name"
            value={meal.name}
            onChange={handleChange}
            placeholder="Mahlzeit"
            title="Mahlzeit"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="meal-amount" className="text-gray-400 text-sm mb-1">Menge</label>
          <input
            id="meal-amount"
            name="amount"
            value={meal.amount}
            onChange={handleChange}
            placeholder="Menge (g/ml)"
            title="Menge"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="meal-calories" className="text-gray-400 text-sm mb-1">Kalorien</label>
          <input
            id="meal-calories"
            type="number"
            name="calories"
            value={meal.calories}
            onChange={handleChange}
            placeholder="Kalorien"
            title="Kalorien"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="meal-date" className="text-gray-400 text-sm mb-1">Datum</label>
          <input
            id="meal-date"
            name="date"
            type="date"
            value={meal.date || ""}
            onChange={handleChange}
            title="Datum"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="meal-time" className="text-gray-400 text-sm mb-1">Uhrzeit</label>
          <input
            id="meal-time"
            name="time"
            type="time"
            value={meal.time}
            onChange={handleChange}
            title="Uhrzeit"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="meal-type" className="text-gray-400 text-sm mb-1">Typ</label>
          <select
            id="meal-type"
            name="type"
            value={meal.type}
            onChange={handleChange}
            title="Typ"
            className="p-2 rounded-lg bg-gray-800 text-white"
          >
            <option>Frühstück</option>
            <option>Mittagessen</option>
            <option>Abendessen</option>
            <option>Snack</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white w-full"
      >
        Hinzufügen
      </button>
    </form>
  );
}
