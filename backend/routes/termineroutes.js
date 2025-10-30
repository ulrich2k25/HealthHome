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

  return router;
};
