"use client";
import { useEffect } from "react";

/**
 * Hook pour sauvegarder automatiquement des données dans localStorage
 * et les restaurer au chargement.
 *
 * @param key clé unique pour identifier les données (ex: "vitalDraft")
 * @param values l'objet à sauvegarder
 * @param setValues la fonction pour restaurer les données (ex: setValues)
 * @param backupUrl (optionnel) URL pour sauvegarde distante (ex: "http://localhost:4000/api/backup/vitals")
 */
export function useAutoSave<T>(key: string, values: T, setValues: (data: T) => void, backupUrl?: string) {

  // ✅ Restaure les données au chargement
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setValues(JSON.parse(saved));
      } catch (e) {
        console.warn("Erreur restauration auto-save:", e);
      }
    }
  }, [key, setValues]);

  //  Sauvegarde automatique à chaque changement
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(values));
  }, [key, values]);

  //  Sauvegarde automatique vers le serveur (toutes les 5 min)
  useEffect(() => {
    if (!backupUrl) return; // pas d’URL = pas de backup distant

    const interval = setInterval(async () => {
      try {
        const res = await fetch(backupUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (res.ok) {
          console.log(`✅ Backup cloud réussi pour ${key}`);
        } else {
          console.warn(`⚠️ Backup cloud échoué pour ${key}`);
        }
      } catch (err) {
        console.warn(`⚠️ Erreur backup cloud (${key}):`, err);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [key, values, backupUrl]);
}


