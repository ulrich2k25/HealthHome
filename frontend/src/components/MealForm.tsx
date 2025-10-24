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
  name="date"
  type="date"
  value={meal.date || ""}
  onChange={handleChange}
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
  );
}
