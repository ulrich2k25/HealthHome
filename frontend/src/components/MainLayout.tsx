"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // 👈 pour savoir sur quelle page on est

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("pdf");

  // 🔹 États pour afficher / cacher les boîtes modales
  const [showExportBox, setShowExportBox] = useState(false);
  const [showMailBox, setShowMailBox] = useState(false);
  const pathname = usePathname();

  // Liste des pages publiques
  const publicPages = ["/login", "/register", "/verifyemail"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    const storedId = localStorage.getItem("userId");
    if (storedId) setUserId(Number(storedId));
  }, []);

  // Si on est sur une page publique, on cache la sidebar et l’en-tête
  const hideSidebar = publicPages.includes(pathname) || !isLoggedIn;

  // ============================================================
  // 🔸 Fonction pour télécharger un fichier depuis le backend
  // ============================================================
  const downloadFile = async (format: string) => {
    if (!userId) return alert("⚠️ Benutzer-ID nicht gefunden!");
    try {
      const response = await fetch(`http://localhost:4000/api/export/${format}?id=${userId}`);
      if (!response.ok) return alert("❌ Fehler beim Herunterladen der Datei.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `HealthData_${userId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportBox(false); // 🔹 Ferme la boîte après téléchargement
    } catch (error) {
      alert("⚠️ Fehler beim Generieren der Datei.");
    }
  };

  // ============================================================
  // 🔸 Fonction pour envoyer les données au médecin
  // ============================================================
  const sendMailToDoctor = async () => {
    if (!userId) return alert("⚠️ Benutzer-ID nicht gefunden!");
    if (!doctorEmail) return alert("Bitte E-Mail-Adresse des Arztes eingeben!");

    try {
      const response = await fetch("http://localhost:4000/api/send-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, doctorEmail, format: selectedFormat }),
      });
      if (!response.ok) throw new Error();
      alert("✅ E-Mail wurde erfolgreich gesendet!");
      setShowMailBox(false); // 🔹 Ferme la boîte après succès
      setDoctorEmail("");
    } catch {
      alert("❌ Fehler beim Senden der E-Mail.");
    }
  };

  return (
    <div className={`min-h-screen ${!hideSidebar ? "grid grid-cols-[240px_1fr]" : ""}`}>
      {/* Sidebar visible uniquement si connecté ET pas sur une page publique */}
      {!hideSidebar && (
        <aside className="bg-white border-r border-gray-300 text-gray-800 flex flex-col min-h-screen relative">
          {/* --- Haut : Logo + Liens --- */}
          <div className="p-5 flex flex-col flex-grow">
            <h1 className="text-2xl font-bold mb-8 tracking-wide">HealthHome</h1>
            <nav className="space-y-2">
              <Link className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200" href="/dashboard">
                Dashboard
              </Link>
              <Link className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200" href="/termin">
                Termine
              </Link>
              <Link className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200" href="/impfungen">
                Impfungen
              </Link>
              <Link className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200" href="/medikamente">
                Medikamente
              </Link>
              <Link className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200" href="/mahlzeit">
                Mahlzeit
              </Link>
              <Link className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 transition duration-200" href="/vitalswerte">
                Vitalswerte
              </Link>
            </nav>
          </div>

          {/* --- Bas : Boutons fixes --- */}
<div className="border-t border-gray-300 p-4 mt-8 mb-12">
            {/* Bouton principal : Datenexport */}
            <button
              onClick={() => {
                setShowExportBox((prev) => !prev);
                setShowMailBox(false);
              }}
              className="w-full bg-slate-900 text-white py-2 rounded hover:bg-white-700 transition-all shadow-md hover:shadow-lg mb-2"
            >
              📊 Datenexport
            </button>

            {/* Bouton principal : Email */}
            <button
              onClick={() => {
                setShowMailBox((prev) => !prev);
                setShowExportBox(false);
              }}
              className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
            >
              ✉️ Per Mail an Arzt senden
            </button>
          </div>

          {/* --- MODAL EXPORT --- */}
          {showExportBox && (
            <div className="absolute bottom-28 left-5 right-5 bg-white border border-gray-300 rounded-lg shadow-lg p-4 animate-fade-in">
              <h3 className="text-gray-800 font-semibold mb-3">Format wählen:</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => downloadFile("pdf")}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => downloadFile("csv")}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                >
                  📊 CSV
                </button>
              </div>
              <button
                onClick={() => setShowExportBox(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg py-2 mt-3"
              >
                Abbrechen
              </button>
            </div>
          )}

          {/* --- MODAL EMAIL --- */}
          {showMailBox && (
            <div className="absolute bottom-28 left-5 right-5 bg-white border border-gray-300 rounded-lg shadow-lg p-4 animate-fade-in">
              <h3 className="text-gray-800 font-semibold mb-3">E-Mail an Arzt senden</h3>
              <input
                type="email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder="arzt@example.de"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              />

              <label className="text-gray-700 font-medium">Format wählen:</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMailBox(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg py-2"
                >
                  Abbrechen
                </button>
                <button
                  onClick={sendMailToDoctor}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2"
                >
                  Senden
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* --- Zone principale --- */}
      <main className="p-8 bg-gray-50 text-gray-900 w-full">
        {!hideSidebar && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="text-sm text-gray-500">Prototype • v0</div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
