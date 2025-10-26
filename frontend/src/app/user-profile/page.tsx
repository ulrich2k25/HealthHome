"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
  diagnose?: string;
  doktor_diagnosen?: string;
  zusatz_info?: string;
  diagnoses?: Diagnosis[];
}

export default function UserProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("email");

    if (!email) {
      router.push("/login");
    } else {
      setIsAuthorized(true);

      axios
        .post("http://localhost:4000/api/user/profile", { email })
        .then((res) => setUser(res.data.user))
        .catch((err) => {
          console.error(err);
          router.push("/login");
        })
        .finally(() => setLoading(false));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("email");
    router.push("/login");
  };

  const handleClose = () => {
    router.push("/dashboard");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous pouvez ajouter un appel API pour sauvegarder les données
    alert("Données sauvegardées (simulation)");
  };

  const handleDeleteField = (field: keyof User) => {
    if (user) {
      setUser({ ...user, [field]: field === 'alter_jahre' || field === 'gewicht' || field === 'groesse' ? undefined : '' });
    }
  };

  const handleEditDiagnosis = (index: number) => {
    setEditingDiagnosis(index);
    // Ici, vous pouvez implémenter la logique d'édition (par exemple, ouvrir un modal ou activer l'édition en ligne)
    alert(`Édition de la diagnose ${index + 1} (simulation)`);
  };

  const handleDeleteDiagnosis = (index: number) => {
    if (user && user.diagnoses) {
      const updatedDiagnoses = user.diagnoses.filter((_, i) => i !== index);
      setUser({ ...user, diagnoses: updatedDiagnoses });
      // Ici, vous pouvez ajouter un appel API pour supprimer la diagnose
      alert(`Diagnose ${index + 1} supprimée (simulation)`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Lade Profil...</p>
      </div>
    );
  }

  if (!isAuthorized || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Benutzer nicht angemeldet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-xl bg-gray-800 p-6 rounded-2xl space-y-6">
        {/* Header avec bouton de fermeture */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl"
            title="Zurück zum Dashboard"
          >
            ×
          </button>
          <div>
            <h1 className="text-2xl font-bold">Benutzerprofil</h1>
            <p className="text-gray-400">Ihre persönlichen Informationen</p>
          </div>
        </div>

        {/* Formulaire utilisateur */}
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="vorname" className="block text-sm text-gray-400">Vorname</label>
              <div className="flex gap-2">
                <input
                  id="vorname"
                  type="text"
                  value={user.vorname}
                  onChange={(e) => setUser({ ...user, vorname: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleDeleteField('vorname')}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                  title="Löschen"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="nachname" className="block text-sm text-gray-400">Nachname</label>
              <div className="flex gap-2">
                <input
                  id="nachname"
                  type="text"
                  value={user.nachname}
                  onChange={(e) => setUser({ ...user, nachname: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleDeleteField('nachname')}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                  title="Löschen"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className="block text-sm text-gray-400">E-Mail-Adresse</label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
                required
              />
              <button
                type="button"
                onClick={() => handleDeleteField('email')}
                className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                title="Löschen"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="alter" className="block text-sm text-gray-400">Alter</label>
              <div className="flex gap-2">
                <input
                  id="alter"
                  type="number"
                  value={user.alter_jahre || ""}
                  onChange={(e) => setUser({ ...user, alter_jahre: parseInt(e.target.value) || undefined })}
                  className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteField('alter_jahre')}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                  title="Löschen"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="geschlecht" className="block text-sm text-gray-400">Geschlecht</label>
              <div className="flex gap-2">
                <select
                  id="geschlecht"
                  value={user.geschlecht || ""}
                  onChange={(e) => setUser({ ...user, geschlecht: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
                >
                  <option value="">Nicht angegeben</option>
                  <option value="Weiblich">Weiblich</option>
                  <option value="Männlich">Männlich</option>
                  <option value="Divers">Divers</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleDeleteField('geschlecht')}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                  title="Löschen"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="gewicht" className="block text-sm text-gray-400">Gewicht (kg)</label>
              <div className="flex gap-2">
                <input
                  id="gewicht"
                  type="number"
                  value={user.gewicht || ""}
                  onChange={(e) => setUser({ ...user, gewicht: parseFloat(e.target.value) || undefined })}
                  className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteField('gewicht')}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                  title="Löschen"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="groesse" className="block text-sm text-gray-400">Größe (cm)</label>
              <div className="flex gap-2">
                <input
                  id="groesse"
                  type="number"
                  value={user.groesse || ""}
                  onChange={(e) => setUser({ ...user, groesse: parseFloat(e.target.value) || undefined })}
                  className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteField('groesse')}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                  title="Löschen"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="allergien" className="block text-sm text-gray-400">Allergien</label>
            <div className="flex gap-2">
              <textarea
                id="allergien"
                placeholder="z.B. Penicillin, Erdnüsse"
                value={user.allergien || ""}
                onChange={(e) => setUser({ ...user, allergien: e.target.value })}
                rows={2}
                className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
              />
              <button
                type="button"
                onClick={() => handleDeleteField('allergien')}
                className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm self-start"
                title="Löschen"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="diagnose" className="block text-sm text-gray-400">Diagnose</label>
            <div className="flex gap-2">
              <input
                id="diagnose"
                type="text"
                value={user.diagnose || ""}
                onChange={(e) => setUser({ ...user, diagnose: e.target.value })}
                className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
              />
              <button
                type="button"
                onClick={() => handleDeleteField('diagnose')}
                className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                title="Löschen"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="doktor_diagnosen" className="block text-sm text-gray-400">Diagnosen vom Doktor</label>
            <div className="flex gap-2">
              <textarea
                id="doktor_diagnosen"
                value={user.doktor_diagnosen || ""}
                onChange={(e) => setUser({ ...user, doktor_diagnosen: e.target.value })}
                rows={3}
                className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
              />
              <button
                type="button"
                onClick={() => handleDeleteField('doktor_diagnosen')}
                className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm self-start"
                title="Löschen"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="zusatz_info" className="block text-sm text-gray-400">Zusätzliche Informationen</label>
            <div className="flex gap-2">
              <textarea
                id="zusatz_info"
                value={user.zusatz_info || ""}
                onChange={(e) => setUser({ ...user, zusatz_info: e.target.value })}
                rows={3}
                className="flex-1 px-3 py-2 rounded-md border bg-gray-900 text-white"
              />
              <button
                type="button"
                onClick={() => handleDeleteField('zusatz_info')}
                className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm self-start"
                title="Löschen"
              >
                ×
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium"
          >
            Speichern
          </button>
        </form>

        {/* Section Diagnosen */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Diagnosen</h2>
          {user.diagnoses && user.diagnoses.length > 0 ? (
            user.diagnoses.map((diag, index) => (
              <div key={diag.id} className="bg-gray-700 p-4 rounded-lg space-y-2">
                <p><strong>Diagnose:</strong> {diag.diagnosis}</p>
                <p><strong>Kommentare des Doktors:</strong> {diag.doctorComments}</p>
                <p><strong>Datum:</strong> {diag.date}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditDiagnosis(index)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white text-sm"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDeleteDiagnosis(index)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Keine Diagnosen vorhanden.</p>
          )}
        </div>

        {/* Bouton déconnexion */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium"
          >
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
