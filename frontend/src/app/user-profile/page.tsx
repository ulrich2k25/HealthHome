"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { UserCircle, Edit, Trash2, Plus, X } from "lucide-react";

interface Diagnosis {
  id: string;
  diagnosis: string;
  doctorComments: string;
  date: string;
}

interface User {
  vorname: string;
  nachname: string;
  email: string;
  alter_jahre?: number;
  geschlecht?: string;
  gewicht?: number;
  groesse?: number;
  allergien?: string;
  diagnoses?: Diagnosis[];
}

export default function UserProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editDiagnosisId, setEditDiagnosisId] = useState<string | null>(null);
  const [newDiagnosis, setNewDiagnosis] = useState({
    diagnosis: "",
    doctorComments: "",
    date: "",
  });
  const [editData, setEditData] = useState({
    diagnosis: "",
    doctorComments: "",
    date: "",
  });

  const router = useRouter();

  // Charger les données utilisateur
  useEffect(() => {
    const email = localStorage.getItem("email");

    if (!email) {
      router.push("/login");
    } else {
      setIsAuthorized(true);

      axios
        .post("http://localhost:4000/api/user/profile", { email })
        .then(async (res) => {
          const userData = res.data.user;
          const diagRes = await axios.post("http://localhost:4000/api/diagnosis/list", { email });
          setUser({ ...userData, diagnoses: diagRes.data.diagnoses });
        })
        .catch((err) => {
          console.error(err);
          router.push("/login");
        })
        .finally(() => setLoading(false));
    }
  }, [router]);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("email");
    router.push("/login");
  };

  // Retour au dashboard
  const handleClose = () => {
    router.push("/dashboard");
  };

  // Modifier le profil utilisateur
  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  // Ajouter un diagnostic
  const handleAddDiagnosis = () => {
    setShowAddForm(true);
  };

  // Sauvegarder un diagnostic
  const handleSaveDiagnosis = async () => {
    const email = localStorage.getItem("email");
    if (!email) return;

    if (!newDiagnosis.diagnosis.trim()) {
      alert("Bitte geben Sie eine Diagnose ein.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/api/diagnosis/add", {
        email,
        diagnosis: newDiagnosis.diagnosis,
        doctorComments: newDiagnosis.doctorComments,
        date: newDiagnosis.date,
      });

      if (response.data.success) {
        const diagRes = await axios.post("http://localhost:4000/api/diagnosis/list", { email });
        setUser((prev) => prev ? { ...prev, diagnoses: diagRes.data.diagnoses } : prev);
        setShowAddForm(false);
        setNewDiagnosis({ diagnosis: "", doctorComments: "", date: "" });
      }
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      alert("Fehler beim Speichern der Diagnose!");
    }
  };

  // Supprimer un diagnostic (base + affichage)
  const handleDeleteDiagnosis = async (id: string) => {
    const email = localStorage.getItem("email");
    if (!email) return;

    if (!confirm("Möchten Sie diese Diagnose wirklich löschen?")) return;

    try {
      const res = await axios.post("http://localhost:4000/api/diagnosis/delete", { id, email });

      if (res.data.success) {
        setUser((prev) =>
          prev
            ? { ...prev, diagnoses: prev.diagnoses?.filter((d) => d.id !== id) }
            : prev
        );
      } else {
        alert("Fehler beim Löschen der Diagnose!");
      }
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      alert("Fehler beim Löschen!");
    }
  };

  // Activer le mode édition
  const handleEditDiagnosis = (diag: Diagnosis) => {
    setEditDiagnosisId(diag.id);
    setEditData({
      diagnosis: diag.diagnosis,
      doctorComments: diag.doctorComments,
      date: diag.date,
    });
  };

  // Sauvegarder la modification
  const handleSaveEdit = async (id: string) => {
    const email = localStorage.getItem("email");
    if (!email) return;

    try {
      const res = await axios.post("http://localhost:4000/api/diagnosis/edit", {
        id,
        email,
        diagnosis: editData.diagnosis,
        doctorComments: editData.doctorComments,
        date: editData.date,
      });

      if (res.data.success) {
        const diagRes = await axios.post("http://localhost:4000/api/diagnosis/list", { email });
        setUser((prev) => prev ? { ...prev, diagnoses: diagRes.data.diagnoses } : prev);
        setEditDiagnosisId(null);
      } else {
        alert("Fehler beim Aktualisieren!");
      }
    } catch (err) {
      console.error("Fehler beim Bearbeiten:", err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f8fa] text-gray-700">
        <p>Lade Profil...</p>
      </div>
    );

  if (!isAuthorized || !user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f8fa] text-gray-700">
        <p>Benutzer nicht angemeldet.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-gray-800 p-6 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <button onClick={handleClose} className="text-red-400 hover:text-red-600 text-xl" title="Zurück zum Dashboard">
            <X />
          </button>

          <button
            onClick={handleEditProfile}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700"
            title="Profil bearbeiten"
          >
            <Edit size={16} />
            Bearbeiten
          </button>
        </div>

        {/* Profil info */}
        <div className="flex flex-col items-center space-y-3 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-5xl text-gray-500">
            <UserCircle size={48} aria-label="Profilbild" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Benutzerprofil</h1>
          <p className="text-gray-500">Ihre persönlichen Informationen</p>
        </div>

        {/* Informations utilisateur */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500" htmlFor="vorname">Vorname</label>
            <p id="vorname" className="bg-gray-50 p-2 rounded-md">{user.vorname}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500" htmlFor="nachname">Nachname</label>
            <p id="nachname" className="bg-gray-50 p-2 rounded-md">{user.nachname}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-500" htmlFor="email">E-Mail-Adresse</label>
            <p id="email" className="bg-gray-50 p-2 rounded-md">{user.email}</p>
          </div>
        </div>

        {/* Diagnosen */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Diagnosen</h2>
            <button
              onClick={handleAddDiagnosis}
              className="flex items-center gap-2 bg-white-600 hover:bg-white-700 text-black px-3 py-2 rounded-lg text-sm"
              title="Diagnose hinzufügen"
            >
              <Plus size={16} /> Diagnose hinzufügen
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-3">
              <div>
                <label className="text-sm text-gray-600" htmlFor="diagnosis">Diagnose</label>
                <input
                  id="diagnosis"
                  type="text"
                  title="Diagnose eingeben"
                  placeholder="z. B. Bluthochdruck"
                  value={newDiagnosis.diagnosis}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosis: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-800 p-2 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600" htmlFor="kommentar">Kommentar des Arztes</label>
                <textarea
                  id="kommentar"
                  title="Kommentar eingeben"
                  placeholder="Empfehlung des Arztes..."
                  value={newDiagnosis.doctorComments}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, doctorComments: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-800 p-2 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600" htmlFor="datum">Datum</label>
                <input
                  id="datum"
                  type="date"
                  title="Datum der Diagnose auswählen"
                  placeholder="TT/MM/JJJJ"
                  value={newDiagnosis.date}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, date: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-800 p-2 rounded-md"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddForm(false)} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm text-gray-700">Abbrechen</button>
                <button onClick={handleSaveDiagnosis} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">Speichern</button>
              </div>
            </div>
          )}

          {/* Liste des Diagnosen */}
          {user.diagnoses && user.diagnoses.length > 0 ? (
            user.diagnoses.map((diag) => (
              <div key={diag.id} className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-3">
                {editDiagnosisId === diag.id ? (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Diagnose</label>
                      <input
                        type="text"
                        title="Diagnose bearbeiten"
                        placeholder="Diagnose aktualisieren..."
                        value={editData.diagnosis}
                        onChange={(e) => setEditData({ ...editData, diagnosis: e.target.value })}
                        className="w-full bg-white border border-gray-300 text-gray-800 p-2 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Kommentar des Arztes</label>
                      <textarea
                        title="Kommentar bearbeiten"
                        placeholder="Neuen Kommentar eingeben..."
                        value={editData.doctorComments}
                        onChange={(e) => setEditData({ ...editData, doctorComments: e.target.value })}
                        className="w-full bg-white border border-gray-300 text-gray-800 p-2 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Datum</label>
                      <input
                        type="date"
                        title="Datum bearbeiten"
                        placeholder="TT/MM/JJJJ"
                        value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        className="w-full bg-white border border-gray-300 text-gray-800 p-2 rounded-md"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditDiagnosisId(null)} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm text-gray-700">Abbrechen</button>
                      <button onClick={() => handleSaveEdit(diag.id)} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">Speichern</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-gray-800">{diag.diagnosis}</p>
                      <p className="text-sm text-gray-500">Datum: {diag.date}</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-3 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Kommentar des Arztes:</p>
                      <p className="text-gray-700">{diag.doctorComments}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEditDiagnosis(diag)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-black text-sm">
                        <Edit size={14} /> Bearbeiten
                      </button>
                      <button onClick={() => handleDeleteDiagnosis(diag.id)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-black text-sm">
                        <Trash2 size={14} /> Löschen
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Keine Diagnosen vorhanden.</p>
          )}
        </div>

        {/* Logout */}
        <div className="flex justify-end mt-6">
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium">
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
