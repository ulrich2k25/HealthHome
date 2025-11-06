"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import scheduleNotification from "../../utils/notifications";

// ✅ 1. Définis ton type Vaccination une seule fois
type Vaccination = {
  id?: number | null;
  title: string;
  doctor?: string;
  date?: string;
   time?: string; // ✅ ajout ici
  reminder?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ImpfungenPage() {
  // ✅ 2. On précise que le state items contient un tableau de Vaccination
  const [items, setItems] = useState<Vaccination[]>([]);



  // ✅ 3. Même chose pour le formulaire
  const [form, setForm] = useState<Vaccination>({
    id: null,
    title: "",
    doctor: "",
    date: "",
    time: "", // ✅ nouveau champ
    reminder: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // ✅ 4. On tape aussi la réponse axios pour éviter les any/never
  const load = async () => {
    try {
      const res = await axios.get<Vaccination[]>(`${API}/vaccinations`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
    }
  };


// Sauvegarder ou mettre à jour une vaccination
const save = async () => {
  if (!form.title || !form.date || !form.time)
    return alert("Titel, Datum und Uhrzeit sind erforderlich.");

  try {
    if (isEditing && form.id) {
      // 🖊️ Modifier une vaccination
      await axios.put(`${API}/vaccinations/${form.id}`, form);
    } else {
      // ➕ Ajouter une nouvelle vaccination
      await axios.post(`${API}/vaccinations`, form);
    }

    // 🔔 Planification de la notification pour la date/heure choisies
    const fullDateTime = `${form.date}T${form.time}`;
    await scheduleNotification(
      "💉 HealthHome - Impfung",
      `Vergessen Sie nicht Ihre Impfung: ${form.title}`,
      fullDateTime
    );

    // ✅ Réinitialisation du formulaire et rechargement
    setForm({ id: null, title: "", doctor: "", date: "", time: "", reminder: "" });
    setIsEditing(false);
    load();

    console.log("✅ Impfung gespeichert und Benachrichtigung geplant:", fullDateTime);
  } catch (err) {
    console.error("❌ Fehler beim Speichern oder bei der Benachrichtigung:", err);
  }
};

  // Supprimer une vaccination
  const remove = async (id: number | null | undefined) => {
    if (!window.confirm("Diese Impfung wirklich löschen?")) return;
    try {
      await axios.delete(`${API}/vaccinations/${id}`);
      load();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  // Préparer l'édition
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
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 space-y-8 p-6">
      {/* Section : créer / modifier */}
      <div className="bg-[#12182b] border border-gray-700 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-white">
          {isEditing ? "Impfung bearbeiten" : "Neue Impfung hinzufügen"}
        </h3>

<div className="grid grid-cols-5 gap-2">
  <input
    type="text"
    className="p-2 rounded bg-[#1b2338] text-white"
    placeholder="Impfung"
    value={form.title}
    onChange={(e) => setForm({ ...form, title: e.target.value })}
  />
  <input
    type="text"
    className="p-2 rounded bg-[#1b2338] text-white"
    placeholder="Arzt"
    value={form.doctor}
    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
  />
  <input
    type="date"
    className="p-2 rounded bg-[#1b2338] text-white"
    value={form.date}
    onChange={(e) => setForm({ ...form, date: e.target.value })}
  />
  <input
    type="time" // ✅ nouveau champ heure
    className="p-2 rounded bg-[#1b2338] text-white"
    value={form.time || ""}
    onChange={(e) => setForm({ ...form, time: e.target.value })}
  />
  <input
    type="date"
    className="p-2 rounded bg-[#1b2338] text-white"
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
              className="bg-gray-600 hover:bg-gray-700 transition px-5 py-2 rounded text-white font-semibold"
            >
              Abbrechen
            </button>
          )}
        </div>
      </div>

      {/* Section : vaccinations existantes */}
      <div className="bg-[#12182b] border border-gray-700 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-white">
          Anstehende Impfungen
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
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
                  className="border-t border-gray-700 hover:bg-[#1b2338] transition"
                >
                  <td className="p-2 text-gray-100">{v.title}</td>
                  <td className="p-2 text-gray-100">{v.doctor}</td>
                  <td className="p-2 text-gray-100">
                    {v.date ? v.date.split("T")[0] : "-"}
                  </td>
                  <td className="p-2 text-gray-100">
                    {v.reminder ? v.reminder.split("T")[0] : "-"}
                  </td>
                  <td className="p-2 flex gap-3">
                    <button
                      onClick={() => edit(v)}
                      className="text-blue-400 hover:text-blue-600"
                      title="Bearbeiten"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => remove(v.id)}
                      className="text-red-400 hover:text-red-600"
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