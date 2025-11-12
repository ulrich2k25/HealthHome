const express = require("express");
const { now } = require("mongoose");

module.exports = (db) => {
  const router = express.Router();

  //  Récupérer tous les repas (toutes dates)
  router.get("/", (req, res) => {
    db.query("SELECT * FROM nutrition ORDER BY date DESC", (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

//  Récupérer les repas du jour précis
router.get("/by-date/:date", (req, res) => {
  const { date } = req.params;
  const sql = "SELECT * FROM nutrition WHERE DATE(date) = ?";
  db.query(sql, [date], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

//  Récupérer les repas d’une semaine donnée (année + semaine)
  router.get("/by-week/:year/:week", (req, res) => {
    const { year, week } = req.params;
    const sql = `
      SELECT * FROM nutrition 
      WHERE YEARWEEK(date, 1) = YEARWEEK(STR_TO_DATE(CONCAT(?, 'W', LPAD(?, 2, '0')), '%XW%V'), 1)
      ORDER BY date DESC
    `;
    db.query(sql, [year, week], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });
  // Récupérer les repas d’un mois donné (année + mois)
  router.get("/by-month/:year/:month", (req, res) => {
    const { year, month } = req.params;
    const sql = `
      SELECT * FROM nutrition 
      WHERE YEAR(date) = ? AND MONTH(date) = ?
      ORDER BY date DESC
    `;
    db.query(sql, [year, month], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  
router.get("/by-range", (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: "start et end requis" });
  
    const sql = `
      SELECT * FROM nutrition
      WHERE DATE(date) BETWEEN ? AND ?
      ORDER BY date DESC
    `;
    db.query(sql, [start, end], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });


  //  Ajouter une nouvelle entrée nutritionnelle
  router.post("/", (req, res) => {
    const { name, amount, calories, time, type, date } = req.body;
    if (!name || !calories)
      return res.status(400).json({ error: "Champs obligatoires manquants" });

    const now = date || new Date().toISOString().slice(0, 10);
    const sql =
      "INSERT INTO nutrition (name, amount, calories, time, type, date) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, amount, calories, time, type, now], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({
        id: result.insertId,
        name,
        amount,
        calories,
        time,
        type,
        date: now,
      });
    });
  });

    // ✏️ Modifier un repas
  router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, amount, calories, time, type, date } = req.body;
    const sql = `
      UPDATE nutrition
      SET name=?, amount=?, calories=?, time=?, type=?, date=?
      WHERE id=?
    `;
    db.query(sql, [name, amount, calories, time, type, date, id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true, updated: result.affectedRows });
    });
  });

  // 🗑️ Supprimer un repas
  router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM nutrition WHERE id=?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true, deleted: result.affectedRows });
    });
  });


  return router;
};