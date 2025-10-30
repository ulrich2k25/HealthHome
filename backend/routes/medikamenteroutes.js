const express = require("express");

module.exports = (db) => {
  const router = express.Router();

// ➕ Ajouter un médicament
router.post("/", (req, res) => {
  const { name, dose, date, time, taken } = req.body;
  const query =
    "INSERT INTO medikamente (name, dose, date, time, taken) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [name, dose, date, time, taken || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name, dose, date, time, taken });
  });
});

// 📋 Obtenir tous les médicaments
router.get("/", (req, res) => {
  db.query("SELECT * FROM medikamente ORDER BY date ASC, time ASC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


  // ✅ Marquer comme pris
  router.put("/:id/taken", (req, res) => {
    const query = "UPDATE medikamente SET taken = 1 WHERE id = ?";
    db.query(query, [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    });
  });

  // ❌ Marquer comme oublié
  router.put("/:id/missed", (req, res) => {
    const query = "UPDATE medikamente SET taken = 0 WHERE id = ?";
    db.query(query, [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    });
  });

  // 🗑 Supprimer un médicament
  router.delete("/:id", (req, res) => {
    db.query("DELETE FROM medikamente WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    });
  });

  return router;
};
