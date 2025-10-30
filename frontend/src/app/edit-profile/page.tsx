"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [alter, setAlter] = useState<number | "">("");
  const [geschlecht, setGeschlecht] = useState("");
  const [gewicht, setGewicht] = useState<number | "">("");
  const [groesse, setGroesse] = useState<number | "">("");
  const [allergien, setAllergien] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Charger les infos utilisateur existantes
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      setMessage("⚠️ Kein Benutzer angemeldet!");
      setLoading(false);
      return;
    }

    setEmail(storedEmail);
    fetchUserInfo(storedEmail);
  }, []);

  // Charger les infos depuis la base de données
  const fetchUserInfo = async (email: string) => {
    try {
      const res = await axios.post("http://localhost:4000/api/user/profile", { email });
      if (res.data && res.data.user) {
        const u = res.data.user;
        setVorname(u.vorname || "");
        setNachname(u.nachname || "");
        setAlter(u.alter_jahre || "");
        setGeschlecht(u.geschlecht || "");
        setGewicht(u.gewicht || "");
        setGroesse(u.groesse || "");
        setAllergien(u.allergien || "");
      }
    } catch (err) {
      console.error("Fehler beim Laden der Daten:", err);
      setMessage("⚠️ Fehler beim Laden der Daten.");
    } finally {
      setLoading(false);
    }
  };

  // Enregistrer les modifications
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await axios.post("http://localhost:4000/api/user/edit-profile", {
        email,
        vorname,
        nachname,
        alter,
        geschlecht,
        gewicht,
        groesse,
        allergien,
      });

      if (res.data.success) {
        setMessage("✅ Daten erfolgreich gespeichert!");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setMessage("⚠️ Fehler beim Speichern der Daten.");
      }
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      setMessage("⚠️ Fehler beim Speichern der Daten.");
    }
  };

  // Bouton Abbrechen
  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f8fa] text-gray-700">
        <p>Daten werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f8fa] text-gray-800 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Profil bearbeiten
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Vorname */}
          <div>
            <label htmlFor="vorname" className="block text-sm font-medium mb-1">
              Vorname
            </label>
            <input
              id="vorname"
              type="text"
              value={vorname}
              onChange={(e) => setVorname(e.target.value)}
              title="Vorname eingeben"
              placeholder="Vorname"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Nachname */}
          <div>
            <label htmlFor="nachname" className="block text-sm font-medium mb-1">
              Nachname
            </label>
            <input
              id="nachname"
              type="text"
              value={nachname}
              onChange={(e) => setNachname(e.target.value)}
              title="Nachname eingeben"
              placeholder="Nachname"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Alter */}
          <div>
            <label htmlFor="alter" className="block text-sm font-medium mb-1">
              Alter
            </label>
            <input
              id="alter"
              type="number"
              value={alter}
              onChange={(e) => setAlter(Number(e.target.value))}
              title="Alter eingeben"
              placeholder="Alter"
              min="1"
              max="120"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Geschlecht */}
          <div>
            <label htmlFor="geschlecht" className="block text-sm font-medium mb-1">
              Geschlecht
            </label>
            <select
              id="geschlecht"
              value={geschlecht}
              onChange={(e) => setGeschlecht(e.target.value)}
              title="Geschlecht auswählen"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Bitte auswählen</option>
              <option value="Männlich">Männlich</option>
              <option value="Weiblich">Weiblich</option>
              <option value="Divers">Divers</option>
            </select>
          </div>

          {/* Gewicht */}
          <div>
            <label htmlFor="gewicht" className="block text-sm font-medium mb-1">
              Gewicht (kg)
            </label>
            <input
              id="gewicht"
              type="number"
              value={gewicht}
              onChange={(e) => setGewicht(Number(e.target.value))}
              title="Gewicht eingeben"
              placeholder="Gewicht"
              min="1"
              max="400"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Größe */}
          <div>
            <label htmlFor="groesse" className="block text-sm font-medium mb-1">
              Größe (cm)
            </label>
            <input
              id="groesse"
              type="number"
              value={groesse}
              onChange={(e) => setGroesse(Number(e.target.value))}
              title="Größe eingeben"
              placeholder="Größe"
              min="50"
              max="250"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Allergien */}
          <div>
            <label htmlFor="allergien" className="block text-sm font-medium mb-1">
              Allergien
            </label>
            <textarea
              id="allergien"
              value={allergien}
              onChange={(e) => setAllergien(e.target.value)}
              title="Allergien eingeben"
              placeholder="Allergien"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-md font-semibold"
            >
              Abbrechen
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
