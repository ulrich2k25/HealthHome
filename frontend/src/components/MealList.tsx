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
  onRemove?: (id: string) => void;
};

export default function MealList({ meals, onRemove }: Props) {
  const totalCalories = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
      <h3 className="text-sm text-gray-400">Tägliche Mahlzeiten</h3>
      {meals.length === 0 ? (
        <p className="text-gray-500">Keine Einträge</p>
      ) : (
        <ul className="space-y-2">
          {meals.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between bg-gray-800 p-2 rounded-lg text-sm"
            >
              <div>
                 {m.date && (
                 <span className="mr-2 text-xs text-gray-400"> //lister la date si elle existe
                      {new Date(m.date).toLocaleDateString()}
                                        </span>
                                              )}
                {m.time && <span className="mr-2">{m.time}</span>}
               
                <span>{m.name}</span>
                <span className="ml-2 text-xs text-gray-400">({m.type})</span>
                {m.amount && <span className="ml-2 text-xs text-gray-500">— {m.amount}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{m.calories} kcal</span>
                {onRemove && (
                  <button
                    onClick={() => onRemove(m.id)}
                    className="text-red-500 text-xs"
                    type="button"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="text-right text-lg font-bold mt-3">Gesamt: {totalCalories} kcal</div>
    </div>
  );
}
