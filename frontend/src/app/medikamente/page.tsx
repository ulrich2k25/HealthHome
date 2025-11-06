"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import scheduleNotification from "../../utils/notifications";
import { useAutoSave } from "../../lib/useAutoSave";

type Medikament = {
  id?: number;
  name: string;
  dose: string;
  date?: string;
  time: string;
  taken: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function MedikamentePage() {
  const [items, setItems] = useState<Medikament[]>([]);
  const [form, setForm] = useState<Medikament>({
    name: "",
    dose: "",
    date: "",
    time: "",
    taken: false,
  });
  useAutoSave("medikamente", form, setForm, "http://localhost:4000/api/backup");

  // ✅ Charger tous les médicaments
  const load = async () => {
    const res = await axios.get<Medikament[]>(`${API}/medikamente`);
    setItems(res.data || []);
  };

  // ✅ Sauvegarder un médicament + planifier la notification
  const save = async () => {
    if (!form.name || !form.time)
      return alert("Name und Uhrzeit sind erforderlich.");

    await axios.post(`${API}/medikamente`, form);

    // 1️⃣ On prend la date saisie ou la date d'aujourd'hui
    const dateString = form.date
      ? form.date
      : new Date().toISOString().split("T")[0];
    const fullDateTime = `${dateString}T${form.time}`;
    const now = new Date();
    const target = new Date(fullDateTime);
    const delay = target.getTime() - now.getTime();

    console.log("💊 Notification prévue :", fullDateTime);
    console.log("⏳ Délai (ms) :", delay);

    // 2️⃣ Vérifie si la date est future
    if (isNaN(target.getTime()) || delay <= 0) {
      console.warn("⛔ La date est invalide ou déjà passée :", fullDateTime);
    } else {
      // 💾 Sauvegarde dans localStorage pour replanifier après refresh
      localStorage.setItem(
        "pendingMedNotification",
        JSON.stringify({
          title: "💊 HealthHome",
          message: `Vergessen Sie nicht, Ihre Medikamente einzunehmen : ${form.name}`,
          dateTime: fullDateTime,
        })
      );

      // 🔔 Notification immédiate (si la page reste ouverte)
      await scheduleNotification(
        "💊 HealthHome",
        `Vergessen Sie nicht, Ihre Medikamente einzunehmen : ${form.name}`,
        fullDateTime
      );

      console.log(
        `✅ Notification programmée pour ${target.toLocaleString("de-DE", {
          timeZone: "Europe/Berlin",
        })}`
      );
    }

    // 🧹 Vide le formulaire et recharge la liste
    setForm({ name: "", dose: "", date: "", time: "", taken: false });
    load();
  };

  // ✅ Replanifie la notification après un refresh de la page
  useEffect(() => {
    load();

    const stored = JSON.parse(localStorage.getItem("pendingMedNotification") || "null");
    if (stored) {
      const now = new Date().getTime();
      const target = new Date(stored.dateTime).getTime();

      if (now >= target) {
        // 🔔 Si l'heure est passée, on notifie tout de suite
        new Notification(stored.title, { body: stored.message });
        localStorage.removeItem("pendingMedNotification");
      } else {
        // ⏳ Sinon on reprogramme la notification
        const delay = target - now;
        console.log(
          `⏳ Replanification médicament dans ${Math.round(delay / 1000)}s`
        );
        setTimeout(() => {
          new Notification(stored.title, { body: stored.message });
          localStorage.removeItem("pendingMedNotification");
        }, delay);
      }
    }
  }, []);

  // ✅ Actions : pris, oublié, supprimé
  const markTaken = async (id: number) => {
    await axios.put(`${API}/medikamente/${id}/taken`);
    load();
  };

  const markMissed = async (id: number) => {
    await axios.put(`${API}/medikamente/${id}/missed`);
    load();
  };

  const remove = async (id: number) => {
    await axios.delete(`${API}/medikamente/${id}`);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 space-y-8 p-6">
      {/* Section: ajouter un médicament */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-gray-900">Neues Medikament hinzufügen</h3>
        <form className="grid md:grid-cols-4 gap-3" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <label className="flex flex-col">
            <span className="text-sm text-gray-700 mb-1">Medikament</span>
            <input
              className="p-2 rounded border border-gray-300 text-gray-900"
              placeholder="Medikament"
              title="Medikament"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 mb-1">Dosis</span>
            <input
              className="p-2 rounded border border-gray-300 text-gray-900"
              placeholder="Dosis (z.B. 100mg)"
              title="Dosis"
              value={form.dose}
              onChange={(e) => setForm({ ...form, dose: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 mb-1">Datum</span>
            <input
              type="date"
              className="p-2 rounded border border-gray-300 text-gray-900"
              title="Datum"
              value={form.date || ""}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 mb-1">Uhrzeit</span>
            <input
              type="time"
              className="p-2 rounded border border-gray-300 text-gray-900"
              title="Uhrzeit"
              value={form.time || ""}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </label>

          <div className="col-span-4 mt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 transition px-5 py-2 rounded-md text-white font-semibold"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>

      {/* Section: liste des médicaments */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-gray-900">Medikamente heute</h3>
        <div className="grid gap-3">
          {items.map((m) => (
            <div
              key={m.id}
              className="flex flex-col md:flex-row justify-between items-center bg-gray-100 border border-gray-200 rounded-lg p-4 hover:bg-gray-200 transition"
            >
              <div>
                <p className="text-gray-900 text-lg font-medium">{m.name}</p>
                <p className="text-gray-600 text-sm">
                  {m.dose || "–"} • {m.date ? m.date.split("T")[0] : "-"} um {m.time?.substring(0, 5)}
                </p>
              </div>

              <div className="flex gap-2 mt-3 md:mt-0">
                <button
                  onClick={() => markTaken(m.id!)}
                  className={`px-4 py-1 rounded ${m.taken ? "bg-green-600" : "bg-gray-400 hover:bg-green-600"} text-white`}
                >
                  Eingenommen
                </button>
                <button
                  onClick={() => markMissed(m.id!)}
                  className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Vergessen
                </button>
                <button
                  onClick={() => remove(m.id!)}
                  className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-gray-500 italic text-center">Keine Medikamente vorhanden</p>
          )}
        </div>
      </div>
    </div>
  );
}
