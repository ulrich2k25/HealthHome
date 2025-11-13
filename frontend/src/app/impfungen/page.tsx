"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import scheduleNotification from "../../utils/notifications";

type Vaccination = {
  id?: number | null;
  title: string;
  doctor?: string;
  date?: string;
  time?: string;
  reminder?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ImpfungenPage() {
  const [items, setItems] = useState<Vaccination[]>([]);
  const [form, setForm] = useState<Vaccination>({
    id: null,
    title: "",
    doctor: "",
    date: "",
    time: "",
    reminder: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get<Vaccination[]>(`${API}/vaccinations`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
    }
  };

  const save = async () => {
    if (!form.title || !form.date || !form.time)
      return alert("Titel, Datum und Uhrzeit sind erforderlich.");

    try {
      if (isEditing && form.id) {
        await axios.put(`${API}/vaccinations/${form.id}`, form);
      } else {
        await axios.post(`${API}/vaccinations`, form);
      }

      const fullDateTime = `${form.date}T${form.time}`;
      await scheduleNotification(
        "💉 HealthHome - Impfung",
        `Vergessen Sie nicht Ihre Impfung: ${form.title}`,
        fullDateTime
      );

      setForm({ id: null, title: "", doctor: "", date: "", time: "", reminder: "" });
      setIsEditing(false);
      load();

      console.log("✅ Impfung gespeichert und Benachrichtigung geplant:", fullDateTime);
    } catch (err) {
      console.error("❌ Fehler beim Speichern oder bei der Benachrichtigung:", err);
    }
  };

  const remove = async (id: number | null | undefined) => {
    if (!window.confirm("Diese Impfung wirklich löschen?")) return;
    try {
      await axios.delete(`${API}/vaccinations/${id}`);
      load();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  const edit = (v: Vaccination) => {
    setForm({
      id: v.id,
      title: v.title,
      doctor: v.doctor,
      date: v.date ? v.date.split("T")[0] : "",
      reminder: v.reminder ? v.reminder.split("T")[0] : "",
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black space-y-8 p-6">
      {/* Formularbereich */}
      <div className="bg-white border border-gray-300 rounded-2xl p-5 shadow">
        <h3 className="font-semibold text-xl mb-4">
          {isEditing ? "Impfung bearbeiten" : "Neue Impfung hinzufügen"}
        </h3>

        <div className="grid grid-cols-5 gap-2">
          <input
            type="text"
            className="p-2 rounded border border-gray-300 bg-white text-black"
            placeholder="Impfung"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="text"
            className="p-2 rounded border border-gray-300 bg-white text-black"
            placeholder="Arzt"
            value={form.doctor}
            onChange={(e) => setForm({ ...form, doctor: e.target.value })}
          />
          <input
            type="date"
            className="p-2 rounded border border-gray-300 bg-white text-black"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="time"
            className="p-2 rounded border border-gray-300 bg-white text-black"
            value={form.time || ""}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
          <input
            type="date"
            className="p-2 rounded border border-gray-300 bg-white text-black"
            placeholder="Erinnerung"
            value={form.reminder}
            onChange={(e) => setForm({ ...form, reminder: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={save}
            className="bg-green-600 hover:bg-green-700 transition px-5 py-2 rounded text-white font-semibold"
          >
            {isEditing ? "Aktualisieren" : "Speichern"}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setForm({
                  id: null,
                  title: "",
                  doctor: "",
                  date: "",
                  reminder: "",
                });
                setIsEditing(false);
              }}
              className="bg-gray-500 hover:bg-gray-600 transition px-5 py-2 rounded text-white font-semibold"
            >
              Abbrechen
            </button>
          )}
        </div>
      </div>

      {/* Liste der Impfungen */}
      <div className="bg-white border border-gray-300 rounded-2xl p-5 shadow">
        <h3 className="font-semibold text-xl mb-4">Anstehende Impfungen</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-300">
                <th className="p-2">Titel</th>
                <th className="p-2">Arzt</th>
                <th className="p-2">Datum</th>
                <th className="p-2">Erinnerung</th>
                <th className="p-2">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v, i) => (
                <tr
                  key={v.id ?? i}
                  className="border-t border-gray-300 hover:bg-gray-100 transition"
                >
                  <td className="p-2">{v.title}</td>
                  <td className="p-2">{v.doctor}</td>
                  <td className="p-2">{v.date ? v.date.split("T")[0] : "-"}</td>
                  <td className="p-2">{v.reminder ? v.reminder.split("T")[0] : "-"}</td>
                  <td className="p-2 flex gap-3">
                    <button
                      onClick={() => edit(v)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Bearbeiten"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => remove(v.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-2 text-center text-gray-500 italic"
                  >
                    Keine Impfungen vorhanden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
