const express = require("express");
const { now } = require("mongoose");

module.exports = (db) => {
  const router = express.Router();

  // 🟢 Récupérer toutes les entrées nutritionnelles
  router.get("/", (req, res) => {
    db.query("SELECT * FROM nutrition", (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });
  // 🟡 Ajouter une nouvelle entrée nutritionnelle
  router.post("/", (req, res) => {
     console.log("POST /api/nutrition body:", req.body); 
    const { name, amount, calories, time, type, } = req.body;
    if (!name || !calories)
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    
    const now =new Date();
    const sql =
      "INSERT INTO nutrition (name, amount, calories, time, type,  date) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, amount, calories, time, type, now], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      // Renvoie le repas ajouté avec son ID
      res.status(201).json({
        id: result.insertId,
        name,
        amount,
        calories,
        time,
        type,
        date: now
      });
    });
  });

  return router;
};
