"use client";
import { useState, useEffect } from "react";
import { useAutoSave } from "../lib/useAutoSave"; // Hook de sauvegarde automatique


type VitalType =
  | "herz"
  | "blutdruck"
  | "schlaf"
  | "schritte"
  | "blutzucker"
  | "temperatur";

export default function Vitalwerte({ onClose }: { onClose: () => void }) {
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

  

  // Auto-remplir la date/heure actuelle
  useEffect(() => {
    if (!values.datum) {
      const now = new Date();
      const isoDate = now.toISOString().slice(0, 16);
      setValues((prev) => ({ ...prev, datum: isoDate }));
    }
  }, [values.datum]);
    useAutoSave("vitalwerte", values, setValues,"http://localhost:4000/api/backup");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typ: type, ...values }),
      });

      if (res.ok) {
        alert("Daten erfolgreich gespeichert!");
        onClose();
      } else {
        alert("Fehler beim Speichern der Daten.");
      }
    } catch (err) {
      console.error("Fehler:", err);
      alert("Serverfehler");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg transition-all">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Vitalwerte erfassen
        </h2>

        {/* Sélecteur de type */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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

        {/* Formulaire dynamique */}
        {type && (
          <div className="space-y-3">
            {type === "herz" && (
              <div className="flex flex-col">
                <label htmlFor="herz" className="text-gray-600 text-sm mb-1">
                  Herzfrequenz (BPM)
                </label>
                <input
                  id="herz"
                  name="herz"
                  type="number"
                  value={values.herz}
                  onChange={handleChange}
                  title="Herzfrequenz (BPM)"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            {type === "blutdruck" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label htmlFor="systolisch" className="text-gray-600 text-sm mb-1">
                    Systolisch
                  </label>
                  <input
                    id="systolisch"
                    name="systolisch"
                    type="number"
                    value={values.systolisch}
                    onChange={handleChange}
                    title="Systolisch"
                    className="p-3 border rounded-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="diastolisch" className="text-gray-600 text-sm mb-1">
                    Diastolisch
                  </label>
                  <input
                    id="diastolisch"
                    name="diastolisch"
                    type="number"
                    value={values.diastolisch}
                    onChange={handleChange}
                    title="Diastolisch"
                    className="p-3 border rounded-lg"
                  />
                </div>
              </div>
            )}

            {type === "schlaf" && (
              <div className="flex flex-col">
                <label htmlFor="schlaf" className="text-gray-600 text-sm mb-1">
                  Schlafdauer (Std)
                </label>
                <input
                  id="schlaf"
                  name="schlaf"
                  type="number"
                  value={values.schlaf}
                  onChange={handleChange}
                  title="Schlafdauer (Std)"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            {type === "schritte" && (
              <div className="flex flex-col">
                <label htmlFor="schritte" className="text-gray-600 text-sm mb-1">
                  Anzahl Schritte
                </label>
                <input
                  id="schritte"
                  name="schritte"
                  type="number"
                  value={values.schritte}
                  onChange={handleChange}
                  title="Anzahl Schritte"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            {type === "blutzucker" && (
              <div className="flex flex-col">
                <label htmlFor="blutzucker" className="text-gray-600 text-sm mb-1">
                  Blutzucker (mg/dL)
                </label>
                <input
                  id="blutzucker"
                  name="blutzucker"
                  type="number"
                  value={values.blutzucker}
                  onChange={handleChange}
                  title="Blutzucker (mg/dL)"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            {type === "temperatur" && (
              <div className="flex flex-col">
                <label htmlFor="temperatur" className="text-gray-600 text-sm mb-1">
                  Körpertemperatur (°C)
                </label>
                <input
                  id="temperatur"
                  name="temperatur"
                  type="number"
                  value={values.temperatur}
                  onChange={handleChange}
                  title="Körpertemperatur (°C)"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
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
                title="Datum & Uhrzeit"
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

        <button
          onClick={onClose}
          className="mt-5 text-gray-500 hover:text-gray-700 underline text-sm block mx-auto"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
