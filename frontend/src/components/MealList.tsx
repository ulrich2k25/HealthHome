"use client";
import React from "react";
import { MealType } from "./MealForm";

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
  meals: Meal[];
};

export default function MealList({ meals }: Props) {
  const totalCalories = meals.reduce(
    (sum, m) => sum + Number(m.calories || 0),
    0
  );

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-4">
      {/* Total calories section */}
      <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
        <div>
          <h3 className="text-gray-400 text-sm">Kalorienüberwachung</h3>
          <p className="text-xl font-bold text-white">Tägliche Kalorienbilanz</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Gegessen</p>
          <p className="text-3xl font-bold text-green-500">{totalCalories}</p>
          <span className="text-gray-400 text-sm">kcal</span>
        </div>
      </div>

      {/* Liste des repas */}
      <div>
        <h4 className="text-gray-400 text-sm mb-2">Heutige Mahlzeiten</h4>
        {meals.length === 0 ? (
          <p className="text-gray-500">Keine Einträge</p>
        ) : (
          <ul className="space-y-2">
            {meals.map((m) => (
              <li
                key={m.id}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"
              >
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
                <p className="font-semibold text-gray-200">{m.calories} kcal</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
