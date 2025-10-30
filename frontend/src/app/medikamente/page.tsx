"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import scheduleNotification from "../../utils/notifications";

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

  const load = async () => {
    const res = await axios.get<Medikament[]>(`${API}/medikamente`);
    setItems(res.data || []);
  };

 const save = async () => {
  if (!form.name || !form.time) return alert("Name und Uhrzeit sind erforderlich.");

  await axios.post(`${API}/medikamente`, form);

  // ✅ Planifie la notification avant de vider le formulaire
 const dateString = form.date ? form.date : new Date().toISOString().split("T")[0];
const fullDateTime = `${dateString}T${form.time}`;

await scheduleNotification(
  "💊 HealthHome",
  `Vergessen Sie nicht, Ihre Medikamente einzunehmen : ${form.name}`,
  fullDateTime // ✅ on envoie une seule valeur propre
);


  // ✅ Ensuite on vide le formulaire et recharge la liste
  setForm({ name: "", dose: "", time: "", taken: false });
  load();
};


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

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 space-y-8 p-6">
      {/* Section: ajouter un médicament */}
      <div className="bg-[#12182b] border border-gray-700 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-white">Neues Medikament hinzufügen</h3>
    <div className="grid md:grid-cols-4 gap-3">
  <input
    className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white placeholder-gray-400"
    placeholder="Medikament"
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
  />
  <input
    className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white placeholder-gray-400"
    placeholder="Dosis (z.B. 100mg)"
    value={form.dose}
    onChange={(e) => setForm({ ...form, dose: e.target.value })}
  />
  <input
    type="date"
    className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white"
    value={form.date || ""}
    onChange={(e) => setForm({ ...form, date: e.target.value })}
  />
  <input
    type="time"
    className="p-2 rounded bg-[#1b2338] border border-gray-600 text-white"
    value={form.time || ""}
    onChange={(e) => setForm({ ...form, time: e.target.value })}
  />
</div>

        <button
          onClick={save}
          className="mt-4 bg-green-600 hover:bg-green-700 transition px-5 py-2 rounded text-white font-semibold"
        >
          Speichern
        </button>
      </div>

      {/* Section: liste des médicaments */}
      <div className="bg-[#12182b] border border-gray-700 rounded-2xl p-5 shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-white">Medikamente heute</h3>
        <div className="grid gap-3">
          {items.map((m) => (
            <div
              key={m.id}
              className="flex flex-col md:flex-row justify-between items-center bg-[#1b2338] border border-gray-700 rounded-lg p-4 hover:bg-[#222b46] transition"
            >
              <div>
                <p className="text-white text-lg font-medium">{m.name}</p>

                <p className="text-gray-400 text-sm">
                {m.dose || "–"} • {m.date ? m.date.split("T")[0] : "-"} um {m.time?.substring(0, 5)}
               </p>

                <p className="text-gray-400 text-sm">
                  {m.dose || "–"} • {m.time?.substring(0, 5)}
                </p>
              </div>
              <div className="flex gap-2 mt-3 md:mt-0">
                <button
                  onClick={() => markTaken(m.id!)}
                  className={`px-4 py-1 rounded ${
                    m.taken ? "bg-green-600" : "bg-gray-600 hover:bg-green-700"
                  } text-white`}
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
                  className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-800 text-white"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-gray-400 italic text-center">Keine Medikamente vorhanden</p>
          )}
        </div>
      </div>
    </div>
  );
}
