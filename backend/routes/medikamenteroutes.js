const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // ➕ Ajouter un médicament
  router.post("/", (req, res) => {
    const { name, dose, date, time, taken } = req.body;
    const query =
      "INSERT INTO medikamente (name, dose, date, time, taken) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [name, dose, date, time, taken || 0], (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout :", err);
        return res.status(500).json({ error: err });
      }
      res.json({ id: result.insertId, name, dose, date, time, taken });
    });
  });

  // 📋 Obtenir tous les médicaments
  router.get("/", (req, res) => {
    const query = "SELECT * FROM medikamente ORDER BY date ASC, time ASC";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération :", err);
        return res.status(500).json({ error: err });
      }
      res.json(results);
    });
  });

  // ✏️ Mettre à jour un médicament existant
  router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, dose, date, time, taken } = req.body;

    const query = `
      UPDATE medikamente
      SET name = ?, dose = ?, date = ?, time = ?, taken = ?
      WHERE id = ?
    `;
    db.query(query, [name, dose, date, time, taken || 0, id], (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour :", err);
        return res.status(500).json({ error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Médicament non trouvé" });
      }
      res.json({ success: true, message: "💊 Médicament mis à jour avec succès" });
    });
  });

  // ✅ Marquer comme pris
  router.put("/:id/taken", (req, res) => {
    const query = "UPDATE medikamente SET taken = 1 WHERE id = ?";
    db.query(query, [req.params.id], (err) => {
      if (err) {
        console.error("Erreur lors du marquage pris :", err);
        return res.status(500).json({ error: err });
      }
      res.json({ success: true });
    });
  });

  // ❌ Marquer comme oublié
  router.put("/:id/missed", (req, res) => {
    const query = "UPDATE medikamente SET taken = 0 WHERE id = ?";
    db.query(query, [req.params.id], (err) => {
      if (err) {
        console.error("Erreur lors du marquage oublié :", err);
        return res.status(500).json({ error: err });
      }
      res.json({ success: true });
    });
  });

  // 🗑 Supprimer un médicament
  router.delete("/:id", (req, res) => {
    const query = "DELETE FROM medikamente WHERE id = ?";
    db.query(query, [req.params.id], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression :", err);
        return res.status(500).json({ error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Médicament non trouvé" });
      }
      res.json({ success: true, message: "🗑️ Médicament supprimé avec succès" });
    });
  });

  return router;
};
