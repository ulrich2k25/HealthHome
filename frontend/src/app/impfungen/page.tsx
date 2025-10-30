"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import scheduleNotification from "../../utils/notifications";

// ✅ Définition du type
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

  // ✅ Charger la liste depuis le backend
  const load = async () => {
    try {
      const res = await axios.get<Vaccination[]>(`${API}/vaccinations`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
    }
  };

  // ✅ Sauvegarder ou mettre à jour une vaccination
  const save = async () => {
    if (!form.title || !form.date || !form.time)
      return alert("Titel, Datum und Uhrzeit sind erforderlich.");

    try {
      // 1️⃣ Enregistrer en DB
      if (isEditing && form.id) {
        await axios.put(`${API}/vaccinations/${form.id}`, form);
      } else {
        await axios.post(`${API}/vaccinations`, form);
      }

      // 2️⃣ Déterminer la date cible
      const dateBase =
        form.reminder && form.reminder.trim() !== "" ? form.reminder : form.date;

      const fullDateTime = `${dateBase}T${form.time}`;
      const now = new Date();
      const target = new Date(fullDateTime);
      const delay = target.getTime() - now.getTime();

      console.log("🕒 Notification prévue pour :", fullDateTime);
      console.log("⏳ Délai (ms) :", delay);

      // 3️⃣ Vérifie validité
      if (isNaN(target.getTime()) || delay <= 0) {
        console.warn("⛔ La date est invalide ou déjà passée :", fullDateTime);
      } else {
        // 💾 Sauvegarde la notification localement (persistance après refresh)
        localStorage.setItem(
          "pendingNotification",
          JSON.stringify({
            title: "💉 HealthHome - Erinnerung",
            message: `Vergessen Sie nicht Ihre Impfung: ${form.title}`,
            dateTime: fullDateTime,
          })
        );

        // 🔔 Planifie aussi immédiatement (utile si la page reste ouverte)
        await scheduleNotification(
          "💉 HealthHome - Erinnerung",
          `Vergessen Sie nicht Ihre Impfung: ${form.title}`,
          fullDateTime
        );

        console.log(
          `✅ Notification programmée pour ${target.toLocaleString("de-DE", {
            timeZone: "Europe/Berlin",
          })}`
        );
      }

      // 🧹 Réinitialisation
      setForm({
        id: null,
        title: "",
        doctor: "",
        date: "",
        time: "",
        reminder: "",
      });
      setIsEditing(false);
      load();
    } catch (err) {
      console.error("❌ Fehler beim Speichern oder bei der Benachrichtigung:", err);
    }
  };

  // ✅ Vérifie les notifications planifiées après un refresh
  useEffect(() => {
    load();

    const stored = JSON.parse(localStorage.getItem("pendingNotification") || "null");
    if (stored) {
      const now = new Date().getTime();
      const target = new Date(stored.dateTime).getTime();

      if (now >= target) {
        // 🔔 Si le moment est déjà arrivé, on affiche maintenant
        new Notification(stored.title, { body: stored.message });
        localStorage.removeItem("pendingNotification");
      } else {
        // ⏳ Sinon on reprogramme proprement
        const delay = target - now;
        console.log(`⏳ Replanification après refresh dans ${Math.round(delay / 1000)}s`);
        setTimeout(() => {
          new Notification(stored.title, { body: stored.message });
          localStorage.removeItem("pendingNotification");
        }, delay);
      }
    }
  }, []);

  // ✅ Supprimer une vaccination
  const remove = async (id: number | null | undefined) => {
    if (!window.confirm("Diese Impfung wirklich löschen?")) return;
    try {
      await axios.delete(`${API}/vaccinations/${id}`);
      load();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  // ✅ Édition
  const edit = (v: Vaccination) => {
    setForm({
      id: v.id,
      title: v.title,
      doctor: v.doctor,
      date: v.date ? v.date.split("T")[0] : "",
      time: v.time || "",
      reminder: v.reminder ? v.reminder.split("T")[0] : "",
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 space-y-8 p-6">
      {/* --- Formulaire --- */}
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
            type="time"
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
                setForm({ id: null, title: "", doctor: "", date: "", time: "", reminder: "" });
                setIsEditing(false);
              }}
              className="bg-gray-600 hover:bg-gray-700 transition px-5 py-2 rounded text-white font-semibold"
            >
              Abbrechen
            </button>
          )}
        </div>
      </div>

      {/* --- Tableau des vaccinations --- */}
      <div className="bg-[#12182b] border border-gray-700 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-white">Anstehende Impfungen</h3>

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
                    {v.date
                      ? new Date(v.date).toLocaleDateString("sv-SE", {
                          timeZone: "Europe/Berlin",
                        })
                      : "-"}
                  </td>
                  <td className="p-2 text-gray-100">
                    {v.reminder
                      ? new Date(v.reminder).toLocaleDateString("sv-SE", {
                          timeZone: "Europe/Berlin",
                        })
                      : "-"}
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
                  <td colSpan={5} className="p-2 text-center text-gray-500 italic">
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
