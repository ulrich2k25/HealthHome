"use client";
import { useEffect, useState } from "react";
import axios from "axios";

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
  const [form, setForm] = useState<Termin>({ title: "", date: "", time: "", doctor: "", location: "" });

  const load = async () => {
    const res = await axios.get(`${API}/termin`);
    setItems(res.data || []);
  };

  const save = async () => {
    if (!form.title || !form.date || !form.time) return alert("Titel, Datum, Uhrzeit sind obligatoires.");
    await axios.post(`${API}/termin`, form);
    setForm({ title: "", date: "", time: "", doctor: "", location: "" });
    load();
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("HealthHome", { body: `Termin gespeichert: ${form.title} ${form.date} ${form.time}` });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(p => p === "granted" && new Notification("HealthHome", { body: "Benachrichtigung aktiviert" }));
      }
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h3 className="font-semibold mb-3">Neuen Termin erstellen</h3>
        <div className="grid md:grid-cols-5 gap-3">
          <input className="p-2 rounded text-black" placeholder="Titel" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <input type="date" className="p-2 rounded text-black" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
          <input type="time" className="p-2 rounded text-black" value={form.time} onChange={e=>setForm({...form, time:e.target.value})}/>
          <input className="p-2 rounded text-black" placeholder="Arzt" value={form.doctor} onChange={e=>setForm({...form, doctor:e.target.value})}/>
          <input className="p-2 rounded text-black" placeholder="Ort" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
        </div>
        <button onClick={save} className="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Speichern</button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h3 className="font-semibold mb-3">Anstehende Termine</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="p-2">Titel</th>
                <th className="p-2">Datum</th>
                <th className="p-2">Uhrzeit</th>
                <th className="p-2">Arzt</th>
                <th className="p-2">Ort</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t, i) => (
                <tr key={t._id ?? i} className="border-t border-gray-800">
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">{t.date}</td>
                  <td className="p-2">{t.time}</td>
                  <td className="p-2">{t.doctor}</td>
                  <td className="p-2">{t.location}</td>
                </tr>
              ))}
              {items.length === 0 && <tr><td className="p-2 text-gray-500" colSpan={5}>Kein Termin</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
