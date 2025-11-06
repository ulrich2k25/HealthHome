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
    <div className="min-h-screen bg-[#F0F4F8] text-[#1F2937] space-y-8 p-6">
      {/* Section: nouveau rendez-vous */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h3 className="font-semibold text-xl mb-4">Neuen Termin erstellen</h3>
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
                placeholder={field === "title" ? "Titel" : field === "doctor" ? "Arzt" : field === "location" ? "Ort" : ""}
                value={(form as any)[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button
          onClick={save}
                 
          className=" mt-4 bg-green-600 hover:bg-green-700 transition px-5 py-2 rounded-md text-white font-semibold"  
        >
          Speichern
        </button>
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
              </tr>
            </thead>
            <tbody>
              {items.map((t, i) => (
                <tr
                  key={t._id ?? i}
                  className="border-t border-gray-200 hover:bg-[#E3ECF3] transition"
                >
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">
                    {new Date(t.date).toLocaleDateString("sv-SE", {
                      timeZone: "Europe/Berlin",
                    })}
                  </td>
                  <td className="p-2">{t.time}</td>
                  <td className="p-2">{t.doctor}</td>
                  <td className="p-2">{t.location}</td>
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