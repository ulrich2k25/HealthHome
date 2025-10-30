const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // === Ajouter une nouvelle diagnose ===
  router.post("/add", (req, res) => {
    const { email, diagnosis, doctorComments, date } = req.body;

    if (!email || !diagnosis) {
      return res.status(400).json({ message: "E-Mail und Diagnose sind erforderlich" });
    }

    const sql = `
      INSERT INTO diagnoses (user_email, diagnosis, doctor_comments, date)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [email, diagnosis, doctorComments, date], (err) => {
      if (err) {
        console.error("❌ Fehler beim Hinzufügen der Diagnose:", err);
        return res.status(500).json({ message: "Fehler beim Hinzufügen" });
      }
      res.json({ success: true, message: "✅ Diagnose gespeichert!" });
    });
  });

  // === Charger toutes les diagnoses d’un utilisateur ===
  router.post("/list", (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "E-Mail erforderlich" });
    }

    const sql = `
      SELECT id, diagnosis, doctor_comments AS doctorComments, date 
      FROM diagnoses WHERE user_email = ?
      ORDER BY date DESC
    `;
    db.query(sql, [email], (err, results) => {
      if (err) {
        console.error("❌ Fehler beim Laden der Diagnosen:", err);
        return res.status(500).json({ message: "Fehler beim Laden" });
      }
      res.json({ diagnoses: results });
    });
  });

  // === Supprimer une diagnose ===
  router.post("/delete", (req, res) => {
    const { id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({ success: false, message: "ID und E-Mail erforderlich" });
    }

    const sql = `DELETE FROM diagnoses WHERE id = ? AND user_email = ?`;
    db.query(sql, [id, email], (err, result) => {
      if (err) {
        console.error("❌ Fehler beim Löschen der Diagnose:", err);
        return res.status(500).json({ success: false, message: "Fehler beim Löschen" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Diagnose nicht gefunden" });
      }
      res.json({ success: true, message: "🗑️ Diagnose supprimée avec succès" });
    });
  });

  // === Modifier une diagnose ===
  router.post("/edit", (req, res) => {
    const { id, email, diagnosis, doctorComments, date } = req.body;

    if (!id || !email || !diagnosis) {
      return res.status(400).json({ success: false, message: "ID, E-Mail und Diagnose erforderlich" });
    }

    const sql = `
      UPDATE diagnoses
      SET diagnosis = ?, doctor_comments = ?, date = ?
      WHERE id = ? AND user_email = ?
    `;
    db.query(sql, [diagnosis, doctorComments, date, id, email], (err, result) => {
      if (err) {
        console.error("❌ Fehler beim Aktualisieren der Diagnose:", err);
        return res.status(500).json({ success: false, message: "Fehler beim Aktualisieren" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Diagnose nicht gefunden" });
      }
      res.json({ success: true, message: "✅ Diagnose aktualisiert!" });
    });
  });

  return router;
};
