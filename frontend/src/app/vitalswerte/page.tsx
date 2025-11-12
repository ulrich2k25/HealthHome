"use client";

import { useEffect, useState } from "react";

type VitalType =
  | "herz"
  | "blutdruck"
  | "schlaf"
  | "schritte"
  | "blutzucker"
  | "temperatur";

type Vital = {
  id: number;
  typ: VitalType;
  herz?: string;
  systolisch?: string;
  diastolisch?: string;
  schlaf?: string;
  schritte?: string;
  blutzucker?: string;
  temperatur?: string;
  datum: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function VitalswertePage() {
  const [type, setType] = useState<VitalType>("herz");
  const [values, setValues] = useState({
    herz: "",
    systolisch: "",
    diastolisch: "",
    schlaf: "",
    schritte: "",
    blutzucker: "",
    temperatur: "",
    datum: new Date().toISOString().split("T")[0],
    time: "",
  });

  const [vitals, setVitals] = useState<Vital[]>([]);
  const [editing, setEditing] = useState<Vital | null>(null);
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  
  /** --- Utils --- **/
  function getWeekRangeISO(d: Date) {
    const day = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - day);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
    };
  }

  function getMonthRange(d: Date) {
    const y = d.getFullYear();
    const m = d.getMonth();
    const start = new Date(y, m, 1).toISOString().slice(0, 10);
    const end = new Date(y, m + 1, 0).toISOString().slice(0, 10);
    return { start, end };
  }

  /** --- Load Vitals --- **/
  useEffect(() => {
    const loadVitals = async () => {
      const date = new Date(selectedDate);
      let url = "";

      if (period === "day") {
        url = `${API_BASE}/api/vitals/by-date/${selectedDate}`;
      } else if (period === "week") {
        const { start, end } = getWeekRangeISO(date);
        url = `${API_BASE}/api/vitals/by-range?start=${start}&end=${end}`;
      } else {
        const { start, end } = getMonthRange(date);
        url = `${API_BASE}/api/vitals/by-range?start=${start}&end=${end}`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();
        setVitals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      }
    };

    loadVitals();
  }, [period, selectedDate]);

  /** --- Handlers --- **/
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typ: type, ...values }),
      });

       if (res.ok) {
      // ✅ Recharge la liste complète
      const date = new Date(selectedDate);
      let url = "";
      if (period === "day") {
        url = `${API_BASE}/api/vitals/by-date/${selectedDate}`;
      } else if (period === "week") {
        const { start, end } = getWeekRangeISO(date);
        url = `${API_BASE}/api/vitals/by-range?start=${start}&end=${end}`;
      } else {
        const { start, end } = getMonthRange(date);
        url = `${API_BASE}/api/vitals/by-range?start=${start}&end=${end}`;
      }
      
      const reloadRes = await fetch(url);
      const data = await reloadRes.json();
      setVitals(Array.isArray(data) ? data : []);

      // Réinitialise le formulaire
        setValues({
          herz: "",
          systolisch: "",
          diastolisch: "",
          schlaf: "",
          schritte: "",
          blutzucker: "",
          temperatur: "",
           datum: "",
          //datum: new Date().toISOString().slice(0, 16),
          time: "",
        });
      } else alert("Fehler beim Speichern der Daten.");
    } catch (err) {
      console.error("Fehler:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Wirklich löschen?")) return;
    await fetch(`${API_BASE}/api/vitals/${id}`, { method: "DELETE" });
    setVitals((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const res = await fetch(`${API_BASE}/api/vitals/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (data.success || res.ok) {
      setVitals((prev) =>
        prev.map((v) => (v.id === editing.id ? editing : v))
      );
      setEditing(null);
    }
  };

  /** --- Render --- **/
  return (
    <div className="space-y-8 p-6">
      {/* FORMULAIRE */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-center mb-4">
          Vitalwerte erfassen
        </h2>

        {/* Type selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {(
            ["herz", "blutdruck", "schlaf", "schritte", "blutzucker", "temperatur"] as VitalType[]
          ).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`p-2 rounded-lg text-sm border ${
                type === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Dynamic fields */}
        <div className="space-y-3">
          {type === "herz" && (
            <InputField
              label="Herzfrequenz (BPM)"
              name="herz"
              value={values.herz}
              onChange={handleChange}
            />
          )}
          {type === "blutdruck" && (
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Systolisch"
                name="systolisch"
                value={values.systolisch}
                onChange={handleChange}
              />
              <InputField
                label="Diastolisch"
                name="diastolisch"
                value={values.diastolisch}
                onChange={handleChange}
              />
            </div>
          )}
          {type === "schlaf" && (
            <InputField
              label="Schlafdauer (Std)"
              name="schlaf"
              value={values.schlaf}
              onChange={handleChange}
            />
          )}
          {type === "schritte" && (
            <InputField
              label="Anzahl Schritte"
              name="schritte"
              value={values.schritte}
              onChange={handleChange}
            />
          )}
          {type === "blutzucker" && (
            <InputField
              label="Blutzucker (mg/dL)"
              name="blutzucker"
              value={values.blutzucker}
              onChange={handleChange}
            />
          )}
          {type === "temperatur" && (
            <InputField
              label="Körpertemperatur (°C)"
              name="temperatur"
              value={values.temperatur}
              onChange={handleChange}
            />
          )}
           <div className="flex flex-row gap-4">
              {/* Champ Date */}
              <div className="flex flex-col flex-1">
                <label htmlFor="datum" className="text-gray-600 text-sm mb-1">
                  Datum
                </label>
                <input
                  id="datum"
                  type="date"
                  name="datum"
                  value={values.datum}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              {/* Champ Heure */}
              <div className="flex flex-col flex-1">
                <label htmlFor="uhrzeit" className="text-gray-600 text-sm mb-1">
                  Uhrzeit
                </label>
                <input
                  id="uhrzeit"
                  type="time"
                  name="uhrzeit"
                  value={values.time}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          

          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white w-full"
          >
            Speichern
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex gap-3 items-center">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="p-2 border rounded-lg bg-white"
        >
          <option value="day">Tagesansicht</option>
          <option value="week">Wochenansicht</option>
          
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border rounded-lg bg-white"
        />
      </div>

      {/* LISTE */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-center">
          Gespeicherte Vitalwerte
        </h3>

        {vitals.length === 0 ? (
          <p className="text-gray-500 text-center">Keine Einträge</p>
        ) : (
          <ul className="space-y-2">
            {vitals.map((v) => (
              <li
                key={v.id}
                className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-lg"
              >{editing?.id === v.id ? (
  <div className="flex flex-col w-full gap-2">
    {v.typ === "herz" && (
      <input
        value={editing.herz || ""}
        onChange={(e) =>
          setEditing({ ...editing, herz: e.target.value })
        }
        placeholder="Herzfrequenz (BPM)"
        className="p-2 border rounded"
      />
    )}
    {v.typ === "blutdruck" && (
      <div className="grid grid-cols-2 gap-2">
        <input
          value={editing.systolisch || ""}
          onChange={(e) =>
            setEditing({ ...editing, systolisch: e.target.value })
          }
          placeholder="Systolisch"
          className="p-2 border rounded"
        />
        <input
          value={editing.diastolisch || ""}
          onChange={(e) =>
            setEditing({ ...editing, diastolisch: e.target.value })
          }
          placeholder="Diastolisch"
          className="p-2 border rounded"
        />
      </div>
    )}
    {v.typ === "schlaf" && (
      <input
        value={editing.schlaf || ""}
        onChange={(e) =>
          setEditing({ ...editing, schlaf: e.target.value })
        }
        placeholder="Schlafdauer"
        className="p-2 border rounded"
      />
    )}
    {v.typ === "schritte" && (
      <input
        value={editing.schritte || ""}
        onChange={(e) =>
          setEditing({ ...editing, schritte: e.target.value })
        }
        placeholder="Schritte"
        className="p-2 border rounded"
      />
    )}
    {v.typ === "blutzucker" && (
      <input
        value={editing.blutzucker || ""}
        onChange={(e) =>
          setEditing({ ...editing, blutzucker: e.target.value })
        }
        placeholder="Blutzucker"
        className="p-2 border rounded"
      />
    )}
    {v.typ === "temperatur" && (
      <input
        value={editing.temperatur || ""}
        onChange={(e) =>
          setEditing({ ...editing, temperatur: e.target.value })
        }
        placeholder="Temperatur"
        className="p-2 border rounded"
      />
    )}
    <div className="flex justify-end gap-2">
      <button
        onClick={handleSaveEdit}
        className="bg-green-500 text-white px-3 py-1 rounded"
      >
        Speichern
      </button>
      <button
        onClick={() => setEditing(null)}
        className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
      >
        Abbrechen
      </button>
    </div>
  </div>
) : (
  /* reste du code */


                  <>
                    <div>
                      <p className="font-semibold capitalize">{v.typ}</p>
                      <p className="text-sm text-gray-600">
                        {v.herz || v.schritte || v.schlaf || v.blutzucker || v.temperatur || ""}{" "}
                        {v.systolisch && v.diastolisch
                          ? `${v.systolisch}/${v.diastolisch} mmHg`
                          : ""}
                      </p>
                      <p className="text-xs text-gray-500">
  {new Date(v.datum).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}
</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(v)}
                        className="text-blue-500"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-red-500"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** --- Reusable Input --- **/
function InputField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-sm mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        className="p-3 border rounded-lg"
      />
    </div>
  );
}