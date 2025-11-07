"use client";

import { useEffect, useState } from "react";
import { useAutoSave } from "../../lib/useAutoSave";

type VitalType =
  | "herz"
  | "blutdruck"
  | "schlaf"
  | "schritte"
  | "blutzucker"
  | "temperatur";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function VitalwertePage() {
  const [type, setType] = useState<VitalType | null>(null);
  const [values, setValues] = useState({
    herz: "",
    systolisch: "",
    diastolisch: "",
    schlaf: "",
    schritte: "",
    blutzucker: "",
    temperatur: "",
    datum: "",
  });

  // Auto-date
  useEffect(() => {
    if (!values.datum) {
      const now = new Date();
      const isoDate = now.toISOString().slice(0, 16);
      setValues((prev) => ({ ...prev, datum: isoDate }));
    }
  }, [values.datum]);

  useAutoSave("vitalwerte", values, setValues, "http://localhost:4000/api/backup");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!type) return alert("Bitte wählen Sie einen Typ aus.");

    try {
      const res = await fetch(`${API}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typ: type, ...values }),
      });

      if (res.ok) {
        alert("Daten erfolgreich gespeichert!");
        setValues({
          herz: "",
          systolisch: "",
          diastolisch: "",
          schlaf: "",
          schritte: "",
          blutzucker: "",
          temperatur: "",
          datum: new Date().toISOString().slice(0, 16),
        });
      } else {
        alert("Fehler beim Speichern der Daten.");
      }
    } catch (err) {
      console.error("Fehler:", err);
      alert("Serverfehler");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 space-y-8 p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Vitalwerte erfassen
        </h2>

        {/* Buttons für Typ */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {(
            ["herz", "blutdruck", "schlaf", "schritte", "blutzucker", "temperatur"] as VitalType[]
          ).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`p-3 rounded-xl font-medium border transition ${
                type === t
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Dynamische Eingabe je nach Typ */}
        {type && (
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

            <div className="flex flex-col">
              <label htmlFor="datum" className="text-gray-600 text-sm mb-1">
                Datum & Uhrzeit
              </label>
              <input
                id="datum"
                type="datetime-local"
                name="datum"
                value={values.datum}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Speichern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
      <label htmlFor={name} className="text-gray-600 text-sm mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        className="w-full p-3 border rounded-lg"
      />
    </div>
  );
}
