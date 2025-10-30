"use client"; // Indique que cette page est interactive (React côté client)
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 📊 Importation de composants graphiques (Recharts)
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// ==========================
// 💓 Données fictives du graphique (BPM = battements par minute)
// ==========================
const mock = [
  { day: "Lun", bpm: 72 },
  { day: "Mar", bpm: 75 },
  { day: "Mer", bpm: 70 },
  { day: "Jeu", bpm: 78 },
  { day: "Ven", bpm: 74 },
  { day: "Sam", bpm: 76 },
  { day: "Dim", bpm: 73 },
];

// ==========================
// 🧠 Composant principal : Dashboard
// ==========================
export default function Dashboard() {
  const [data, setData] = useState(mock); // Données pour le graphique
  const [isAuthorized, setIsAuthorized] = useState(false); // Vérifie si connecté
  const [checkingAuth, setCheckingAuth] = useState(true); // Montre "chargement" pendant vérification
  const router = useRouter();

  // ==========================
  // 🧩 Vérifie si un token existe dans le localStorage
  // ==========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Si pas de token → retour à la page de login
      router.push("/login");
    } else {
      // Sinon → autorise l’accès
      setIsAuthorized(true);
    }
    setCheckingAuth(false); // On arrête l’état "chargement"
  }, [router]);

  // ==========================
  // 📈 Charge les données du graphique
  // ==========================
  useEffect(() => {
    setData(mock); // Ici tu pourrais plus tard charger des vraies données depuis le backend
  }, []);

  // ==========================
  // 🚪 Déconnexion
  // ==========================
  const handleLogout = () => {
    localStorage.removeItem("token"); // Supprime le token
    localStorage.removeItem("userId"); // Supprime aussi l’ID utilisateur
    router.push("/login"); // Retourne à la page de connexion
  };

  // ==========================
  // ⏳ Affiche un écran de chargement pendant la vérification
  // ==========================
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Vérification de la connexion...</p>
      </div>
    );
  }

  // Si non autorisé → on ne montre rien
  if (!isAuthorized) {
    return null;
  }

  // =======================================================
  // ✅ Si connecté : affichage complet du tableau de bord
  // =======================================================
  return (
    <div className="space-y-6">
      {/* === BOUTON DE DÉCONNEXION === */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Abmelden
        </button>
      </div>

      {/* === PETITS CARTONS DE STATISTIQUES === */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">BPM</div>
          <div className="text-3xl font-bold">74</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Blutdruck</div>
          <div className="text-3xl font-bold">122/79</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Schlaf</div>
          <div className="text-3xl font-bold">7,2 h</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="text-sm text-gray-400">Kalorien</div>
          <div className="text-3xl font-bold">1 950</div>
        </div>
      </div>

      {/* === GRAPHIQUE BPM === */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 h-64">
        <h3 className="text-sm text-gray-400 mb-2">Herzfrequenz (BPM)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ====================================================== */}
      {/* 📄 SECTION POUR TÉLÉCHARGER LES DONNÉES DU PATIENT */}
      {/* ====================================================== */}
      <DownloadSection />
    </div>
  );
}

// ==========================================================
// 📦 Composant séparé : DownloadSection
// Ce composant gère tout ce qui concerne l’export et l’envoi des données patient
// ==========================================================
function DownloadSection() {
  // 🧠 userId : l'identifiant unique du patient connecté
  // on le récupère depuis le navigateur (localStorage)
  const [userId, setUserId] = useState<number | null>(null);

  // 🎛️ showExportBox : sert à afficher ou cacher la petite fenêtre "Choisir PDF / CSV"
  const [showExportBox, setShowExportBox] = useState(false);

  // 🎛️ showMailBox : sert à afficher ou cacher la petite fenêtre "envoyer par mail"
  const [showMailBox, setShowMailBox] = useState(false);

  // 📧 doctorEmail : contient le texte entré par l’utilisateur dans le champ e-mail
  const [doctorEmail, setDoctorEmail] = useState("");

  // 🔁 Ce useEffect s’exécute UNE FOIS au chargement du composant
  useEffect(() => {
    // on regarde dans le stockage local si un ID utilisateur est enregistré
    const storedId = localStorage.getItem("userId");
    // si oui, on le convertit en nombre et on le stocke dans userId
    if (storedId) {
      setUserId(Number(storedId));
    }
  }, []); // tableau vide = ne s’exécute qu’une seule fois (au montage du composant)

  // =========================
  // 📄 Fonction pour télécharger le PDF
  // =========================
  const downloadPDF = async () => {
    // si aucun ID utilisateur, on arrête tout
    if (!userId) return alert("User ID not found!");

    try {
      // on appelle notre backend via une requête HTTP GET
      const response = await fetch(`http://localhost:4000/api/export/pdf?id=${userId}`);

      // si le serveur ne renvoie pas de succès (ex: erreur 404 ou 500)
      if (!response.ok) return alert("Error while downloading PDF.");

      // la réponse est un fichier → on la transforme en "blob" (fichier brut)
      const blob = await response.blob();

      // on crée une URL temporaire pour ce fichier (le navigateur la comprend)
      const url = window.URL.createObjectURL(blob);

      // on crée un lien <a> temporaire dans le document
      const link = document.createElement("a");
      // ce lien pointe vers le fichier qu'on vient de créer
      link.href = url;
      // on indique le nom du fichier à télécharger
      link.setAttribute("download", `HealthData_${userId}.pdf`);

      // on ajoute ce lien dans le corps de la page (temporairement)
      document.body.appendChild(link);
      // on simule un clic sur ce lien → ça télécharge le fichier
      link.click();
      // on enlève le lien pour nettoyer le DOM
      link.remove();

      // une fois terminé, on referme la fenêtre "choix format"
      setShowExportBox(false);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    }
  };

  // =========================
  // 📊 Fonction pour télécharger le CSV
  // =========================
  const downloadCSV = async () => {
    if (!userId) return alert("User ID not found!");
    try {
      // même principe que pour le PDF, mais cette fois l’URL vise /csv
      const response = await fetch(`http://localhost:4000/api/export/csv?id=${userId}`);
      if (!response.ok) return alert("Error while downloading CSV.");

      // conversion de la réponse en fichier brut
      const blob = await response.blob();
      // création d'une URL temporaire pour le navigateur
      const url = window.URL.createObjectURL(blob);
      // création d'un lien temporaire <a>
      const link = document.createElement("a");
      // assignation de cette URL au lien
      link.href = url;
      // définition du nom du fichier à télécharger
      link.setAttribute("download", `HealthData_${userId}.csv`);
      // ajout du lien à la page
      document.body.appendChild(link);
      // clic simulé
      link.click();
      // suppression du lien
      link.remove();

      setShowExportBox(false);
    } catch (err) {
      console.error(err);
      alert("Error generating CSV.");
    }
  };

  // =========================
  // 📧 Fonction pour envoyer le fichier par mail au médecin
  // =========================
  const sendMailToDoctor = async () => {
    // vérifie que l’utilisateur est connecté
    if (!userId) return alert("User ID not found!");
    // vérifie qu’un e-mail a bien été saisi
    if (!doctorEmail) return alert("Please enter doctor email.");

    try {
      // envoie une requête POST vers le backend
      // (on la créera ensuite dans exportRoutes.js)
      const res = await fetch("http://localhost:4000/api/export/send-email", {
        method: "POST", // méthode HTTP
        headers: { "Content-Type": "application/json" }, // on envoie du JSON
        body: JSON.stringify({
          userId: userId, // ID du patient
          email: doctorEmail, // email du médecin
        }),
      });

      // si le backend répond avec une erreur
      if (!res.ok) {
        return alert("Error while sending email.");
      }

      // si tout va bien
      alert("Email sent to doctor ✅");
      // on ferme la boîte d’envoi de mail
      setShowMailBox(false);
      // on vide le champ email
      setDoctorEmail("");
    } catch (err) {
      console.error(err);
      alert("Server error while sending email.");
    }
  };

  // =========================
  // 🖼️ AFFICHAGE (le rendu visuel)
  // =========================
  return (
    <div className="mt-6">
      {/* --- Ligne principale avec les deux boutons --- */}
      <div className="flex gap-4">
        {/* 1️⃣ Bouton principal : DATENEXPORT */}
        <button
          // quand on clique, on ouvre ou ferme la boîte PDF/CSV
          onClick={() => {
    setShowExportBox((prev) => !prev); // ouvre/ferme la boîte PDF-CSV
    setShowMailBox(false); // 🔸 ferme la boîte email si elle est ouverte
  }}
          className="bg-white text-gray-900 px-6 py-3 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2"
        >
          {/* petit emoji document pour le style */}
          📄 <span>Datenexport</span>
        </button>

        {/* 2️⃣ Bouton : Per E-Mail an Arzt senden */}
        <button
          // quand on clique, on ouvre la boîte d’envoi mail
          onClick={() => {
    setShowMailBox((prev) => !prev); // ouvre/ferme la boîte email
    setShowExportBox(false); // 🔸 ferme la boîte export si elle est ouverte
  }}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg shadow-md hover:bg-slate-800 transition flex items-center gap-2"
        >
          ✉️ <span>Per E-Mail an Arzt senden</span>
        </button>
      </div>

      {/* --- Si showExportBox = true → affiche la petite boîte blanche --- */}
      {showExportBox && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-full max-w-sm">
          <p className="text-gray-700 font-semibold mb-3">
            Wähle ein Format:
          </p>

          {/* boutons PDF et CSV dans la petite boîte */}
          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
            >
              PDF
            </button>
            <button
              onClick={downloadCSV}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
            >
              CSV
            </button>
          </div>
          <div className="flex gap-3 mb-3">
  <button onClick={downloadPDF}>PDF</button>
  <button onClick={downloadCSV}>CSV</button>
</div>

{/* 🔸 AJOUT : bouton pour fermer la boîte sans rien faire */}
<button
  onClick={() => setShowExportBox(false)}
  className="w-full border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
>
  Abbrechen
</button>

        </div>
      )}

      {/* --- Si showMailBox = true → affiche la boîte d’envoi mail --- */}
      {showMailBox && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-full max-w-sm">
          <p className="text-gray-700 font-semibold mb-3">
            E-Mail des Arztes eingeben:
          </p>

          {/* champ texte pour entrer l'adresse email */}
          <input
            type="email"
            value={doctorEmail}
            onChange={(e) => setDoctorEmail(e.target.value)}
            placeholder="arzt@example.de"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
          />

          {/* boutons pour annuler ou envoyer */}
          <div className="flex gap-3 justify-end">
  {/* 🔸 AJOUT : ferme la box mail quand on clique sur Abbrechen */}
  <button
    onClick={() => setShowMailBox(false)}
    className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
  >
    Abbrechen
  </button>

  <button
    onClick={sendMailToDoctor}
    className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
  >
    Senden
  </button>
</div>
        </div>
      )}
    </div>
  );
}
