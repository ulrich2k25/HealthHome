"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import scheduleNotification from "../../utils/notifications";

type Termin = {
  _id?: string;
  title: string;
  date: string;
  time: string;
  doctor?: string;
  location?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function TerminPage() {
  const [items, setItems] = useState<Termin[]>([]);
  const [form, setForm] = useState<Termin>({
    title: "",
    date: "",
    time: "",
    doctor: "",
    location: "",
  });

  // ✅ Charger tous les rendez-vous
  const load = async () => {
    const res = await axios.get(`${API}/termin`);
    setItems(res.data || []);
  };

  // ✅ Sauvegarder un nouveau rendez-vous et planifier la notification
  const save = async () => {
    if (!form.title || !form.date || !form.time)
      return alert("Titel, Datum und Uhrzeit sind erforderlich.");

    try {
      // ➕ Enregistrement du rendez-vous
      await axios.post(`${API}/termin`, form);

      // 🔔 Planification locale
      const fullDateTime = `${form.date}T${form.time}`;
      const now = new Date();
      const target = new Date(fullDateTime);
      const delay = target.getTime() - now.getTime();

      console.log("📅 Notification prévue :", fullDateTime);
      console.log("⏳ Délai (ms) :", delay);

      if (isNaN(target.getTime()) || delay <= 0) {
        console.warn("⛔ La date est invalide ou déjà passée :", fullDateTime);
      } else {
        // 💾 Sauvegarde locale pour replanification après refresh
        localStorage.setItem(
          "pendingTerminNotification",
          JSON.stringify({
            title: "📅 HealthHome - Termin",
            message: `Erinnerung an Ihren Termin: ${form.title} um ${form.time}`,
            dateTime: fullDateTime,
          })
        );

        // 🔔 Planifie la notification (pendant que la page reste ouverte)
        await scheduleNotification(
          "📅 HealthHome - Termin",
          `Erinnerung an Ihren Termin: ${form.title} um ${form.time}`,
          fullDateTime
        );

        console.log(
          `✅ Notification programmée pour ${target.toLocaleString("de-DE", {
            timeZone: "Europe/Berlin",
          })}`
        );
      }

      // ✅ Réinitialisation du formulaire et rechargement
      setForm({ title: "", date: "", time: "", doctor: "", location: "" });
      load();
    } catch (err) {
      console.error("❌ Fehler beim Speichern oder bei der Benachrichtigung:", err);
    }
  };

  // ✅ Replanification automatique après un refresh
  useEffect(() => {
    load();

    const stored = JSON.parse(localStorage.getItem("pendingTerminNotification") || "null");
    if (stored) {
      const now = new Date().getTime();
      const target = new Date(stored.dateTime).getTime();

      if (now >= target) {
        // 🔔 Si le moment est déjà arrivé, on notifie immédiatement
        new Notification(stored.title, { body: stored.message });
        localStorage.removeItem("pendingTerminNotification");
      } else {
        // ⏳ Sinon on reprogramme
        const delay = target - now;
        console.log(
          `⏳ Replanification Termin dans ${Math.round(delay / 1000)}s`
        );
        setTimeout(() => {
          new Notification(stored.title, { body: stored.message });
          localStorage.removeItem("pendingTerminNotification");
        }, delay);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 space-y-8 p-6">
      {/* --- Section : nouveau rendez-vous --- */}
      <div className="bg-[#12182b] border border-gray-700 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-white">
          Neuen Termin erstellen
        </h3>
        <div className="grid md:grid-cols-5 gap-3">
          <input
            className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Titel"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="date"
            className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="time"
            className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
          <input
            className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Arzt"
            value={form.doctor}
            onChange={(e) => setForm({ ...form, doctor: e.target.value })}
          />
          <input
            className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ort"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <button
          onClick={save}
          className="mt-4 bg-green-600 hover:bg-green-700 transition px-5 py-2 rounded text-white font-semibold"
        >
          Speichern
        </button>
      </div>

      {/* --- Section : rendez-vous existants --- */}
      <div className="bg-[#12182b] border border-gray-700 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-white">
          Anstehende Termine
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="p-2">Titel</th>
                <th className="p-2">Datum</th>
                <th className="p-2">Uhrzeit</th>
                <th className="p-2">Arzt</th>
                <th className="p-2">Ort</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t, i) => (
                <tr
                  key={t._id ?? i}
                  className="border-t border-gray-700 hover:bg-[#1b2338] transition"
                >
                  <td className="p-2 text-gray-100">{t.title}</td>
                  <td className="p-2 text-gray-100">
                    {new Date(t.date).toLocaleDateString("sv-SE", {
                      timeZone: "Europe/Berlin",
                    })}
                  </td>
                  <td className="p-2 text-gray-100">{t.time}</td>
                  <td className="p-2 text-gray-100">{t.doctor}</td>
                  <td className="p-2 text-gray-100">{t.location}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    className="p-2 text-gray-500 italic text-center"
                    colSpan={5}
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
