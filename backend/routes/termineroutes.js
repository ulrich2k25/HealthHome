const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // 🟢 Récupérer tous les rendez-vous
  router.get("/", (req, res) => {
    db.query("SELECT * FROM termin", (err, results) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur de base de données" });
      }
      res.json(results);
    });
  });

  // 🟡 Ajouter un rendez-vous
  router.post("/", (req, res) => {
    const { title, date, time, doctor, location } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const sql =
      "INSERT INTO termin (title, date, time, doctor, location) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [title, date, time, doctor, location], (err, result) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur lors de l'insertion" });
      }

      res.status(201).json({
        id: result.insertId,
        title,
        date,
        time,
        doctor,
        location,
      });
    });
  });

  // ✏️ Modifier un rendez-vous existant
  router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { title, date, time, doctor, location } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const sql = `
      UPDATE termin
      SET title = ?, date = ?, time = ?, doctor = ?, location = ?
      WHERE id = ?
    `;
    db.query(sql, [title, date, time, doctor, location, id], (err, result) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur lors de la mise à jour" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Rendez-vous non trouvé" });
      }

      res.json({ success: true, message: "✅ Rendez-vous mis à jour avec succès" });
    });
  });

  // 🗑️ Supprimer un rendez-vous
  router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM termin WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur lors de la suppression" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Rendez-vous non trouvé" });
      }

      res.json({ success: true, message: "🗑️ Rendez-vous supprimé avec succès" });
    });
  });

  return router;
};
