"use client";
import { useState, useEffect } from "react";

type VitalType = "herz" | "blutdruck" | "schlaf" | "schritte" | "blutzucker" | "temperatur";

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

  //  Gérer la saisie
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  //  Sauvegarde (tu pourras ensuite connecter au backend)
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

        {/*  Sélecteur de type */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["herz", "blutdruck", "schlaf", "schritte", "blutzucker", "temperatur"] as VitalType[]).map(
            (t) => (
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
            )
          )}
        </div>

        {/*  Formulaire dynamique */}
        {type && (
          <div className="space-y-3">
            {type === "herz" && (
              <input
                name="herz"
                type="number"
                placeholder="Herzfrequenz (BPM)"
                value={values.herz}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            )}
            {type === "blutdruck" && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="systolisch"
                  type="number"
                  placeholder="Systolisch"
                  value={values.systolisch}
                  onChange={handleChange}
                  className="p-3 border rounded-lg"
                />
                <input
                  name="diastolisch"
                  type="number"
                  placeholder="Diastolisch"
                  value={values.diastolisch}
                  onChange={handleChange}
                  className="p-3 border rounded-lg"
                />
              </div>
            )}
            {type === "schlaf" && (
              <input
                name="schlaf"
                type="number"
                placeholder="Schlafdauer (Std)"
                value={values.schlaf}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            )}
            {type === "schritte" && (
              <input
                name="schritte"
                type="number"
                placeholder="Anzahl Schritte"
                value={values.schritte}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            )}
            {type === "blutzucker" && (
              <input
                name="blutzucker"
                type="number"
                placeholder="Blutzucker (mg/dL)"
                value={values.blutzucker}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            )}
            {type === "temperatur" && (
              <input
                name="temperatur"
                type="number"
                placeholder="Körpertemperatur (°C)"
                value={values.temperatur}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Datum & Uhrzeit</label>
              <input
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



        {/*  Bouton Annuler */}
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
