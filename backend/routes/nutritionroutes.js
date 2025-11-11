// ======================================================
// 🍽️ nutritionRoutes.js — Gestion des données nutritionnelles (Mahlzeit)
// ======================================================

const express = require("express");

// ⚠️ Import inutile dans ce cas — "mongoose" n'est pas utilisé
// const { now } = require("mongoose"); ← à retirer

module.exports = (db) => {
  const router = express.Router();

  // ======================================================
  // 📋 GET — Récupérer toutes les entrées nutritionnelles
  // ======================================================
  router.get("/", (req, res) => {
    // On récupère toutes les lignes de la table "nutrition"
    const sql = "SELECT * FROM nutrition ORDER BY date DESC";

    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Erreur MySQL :", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }

      // ✅ Réponse avec toutes les entrées nutritionnelles
      res.json(results);
    });
  });

  // ======================================================
  // ➕ POST — Ajouter une nouvelle entrée nutritionnelle
  // ======================================================
  router.post("/", (req, res) => {
    console.log("📩 POST /api/nutrition reçu avec body :", req.body);

    // On récupère les champs du corps de la requête
    const { name, amount, calories, time, type, date } = req.body;

    // Vérification des champs obligatoires
    if (!name || !calories) {
      return res.status(400).json({ error: "Champs obligatoires manquants (name, calories)." });
    }

    // Si aucune date n’est fournie, on met la date actuelle
    const now = date ? new Date(date) : new Date();

    // Requête SQL d’insertion
    const sql = `
      INSERT INTO nutrition (name, amount, calories, time, type, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // On exécute la requête avec les valeurs fournies
    db.query(sql, [name, amount || "", calories, time || "", type || "", now], (err, result) => {
      if (err) {
        console.error("❌ Erreur MySQL :", err);
        return res.status(500).json({ error: "Erreur lors de l'ajout du repas." });
      }

      // ✅ On renvoie l'objet nouvellement créé avec son ID
      res.status(201).json({
        id: result.insertId,
        name,
        amount: amount || "",
        calories,
        time: time || "",
        type: type || "",
        date: now.toISOString().split("T")[0], // format lisible YYYY-MM-DD
      });
    });
  });

  // ======================================================
  // 🧩 Export du router
  // ======================================================
  return router;
};
