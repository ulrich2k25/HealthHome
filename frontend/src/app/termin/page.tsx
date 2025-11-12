"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import scheduleNotification from "../../utils/notifications";

type Termin = {
  id?: number; // ✅ remplacé _id par id
  title: string;
  date: string;
  time: string;
  doctor?: string;
  location?: string;
};

// ✅ API directe vers /api/termin
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/termin";

export default function TerminPage() {
  const [items, setItems] = useState<Termin[]>([]);
  const [form, setForm] = useState<Termin>({
    title: "",
    date: "",
    time: "",
    doctor: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null); // ✅ id numérique

  // ✅ Charger tous les rendez-vous
  const load = async () => {
    try {
      const res = await axios.get(API);
      setItems(res.data || []);
    } catch (err) {
      console.error("❌ Fehler beim Laden:", err);
    }
  };

  // ✅ Ajouter ou modifier un rendez-vous
  const save = async () => {
    if (!form.title || !form.date || !form.time)
      return alert("Titel, Datum und Uhrzeit sind erforderlich.");

    try {
      if (isEditing && editId) {
        // ✏️ Mise à jour
        await axios.put(`${API}/${editId}`, form);
      } else {
        // ➕ Nouveau rendez-vous
        await axios.post(API, form);
      }

      // 🔔 Planification locale
      const fullDateTime = `${form.date}T${form.time}`;
      const now = new Date();
      const target = new Date(fullDateTime);
      const delay = target.getTime() - now.getTime();

      if (!isNaN(target.getTime()) && delay > 0) {
        await scheduleNotification(
          "📅 HealthHome - Termin",
          `Erinnerung an Ihren Termin: ${form.title} um ${form.time}`,
          fullDateTime
        );
      }

      // ✅ Reset + reload
      setForm({ title: "", date: "", time: "", doctor: "", location: "" });
      setIsEditing(false);
      setEditId(null);
      load();
    } catch (err) {
      console.error("❌ Fehler beim Speichern:", err);
    }
  };

  // ✅ Supprimer un rendez-vous
  const remove = async (id: number | undefined) => {
    if (!window.confirm("Diesen Termin wirklich löschen?")) return;
    try {
      await axios.delete(`${API}/${id}`); // ✅ utilise id (numérique)
      load();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  // ✅ Préparer le formulaire pour l’édition
  const edit = (t: Termin) => {
    setForm({
      title: t.title,
      date: t.date ? t.date.split("T")[0] : "",
      time: t.time,
      doctor: t.doctor,
      location: t.location,
    });
    setIsEditing(true);
    setEditId(t.id || null); // ✅ utilise id
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1F2937] space-y-8 p-6">
      {/* Section: nouveau rendez-vous */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h3 className="font-semibold text-xl mb-4">
          {isEditing ? "Termin bearbeiten" : "Neuen Termin erstellen"}
        </h3>

        <div className="grid md:grid-cols-5 gap-4">
          {["title", "date", "time", "doctor", "location"].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="sr-only">
                {field}
              </label>
              <input
                id={field}
                type={field === "date" ? "date" : field === "time" ? "time" : "text"}
                className="p-2 rounded bg-[#E3ECF3] border border-gray-300 text-[#1F2937] placeholder-gray-500 focus:ring-2 focus:ring-blue-400 outline-none w-full"
                placeholder={
                  field === "title"
                    ? "Titel"
                    : field === "doctor"
                    ? "Arzt"
                    : field === "location"
                    ? "Ort"
                    : ""
                }
                value={(form as any)[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={save}
            className="bg-green-600 hover:bg-green-700 transition px-5 py-2 rounded-md text-white font-semibold"
          >
            {isEditing ? "Aktualisieren" : "Speichern"}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setForm({ title: "", date: "", time: "", doctor: "", location: "" });
                setIsEditing(false);
                setEditId(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 transition px-5 py-2 rounded-md text-white font-semibold"
            >
              Abbrechen
            </button>
          )}
        </div>
      </div>

      {/* Section: rendez-vous existants */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h3 className="font-semibold text-xl mb-4">Anstehende Termine</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-300">
                <th className="p-2">Titel</th>
                <th className="p-2">Datum</th>
                <th className="p-2">Uhrzeit</th>
                <th className="p-2">Arzt</th>
                <th className="p-2">Ort</th>
                <th className="p-2">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t, i) => (
                <tr
                  key={t.id ?? i} // ✅ utilise id ici
                  className="border-t border-gray-200 hover:bg-[#E3ECF3] transition"
                >
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">
                    {t.date
                      ? new Date(t.date).toLocaleDateString("sv-SE", {
                          timeZone: "Europe/Berlin",
                        })
                      : "-"}
                  </td>
                  <td className="p-2">{t.time}</td>
                  <td className="p-2">{t.doctor}</td>
                  <td className="p-2">{t.location}</td>
                  <td className="p-2 flex gap-3">
                    <button
                      onClick={() => edit(t)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Bearbeiten"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => remove(t.id)} // ✅ utilise id
                      className="text-red-500 hover:text-red-700"
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
                    className="p-2 text-gray-500 italic text-center"
                    colSpan={6}
                  >
                    Kein Termin
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
