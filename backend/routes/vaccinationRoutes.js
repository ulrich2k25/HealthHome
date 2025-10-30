const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // ➕ Ajouter une vaccination
  router.post("/", (req, res) => {
    const { title, doctor, date, time, reminder } = req.body;
    const query =
      "INSERT INTO vaccinations (title, doctor, date, time, reminder) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [title, doctor, date, time, reminder], (err, result) => {
      if (err) {
        console.error("❌ Erreur lors de l'ajout :", err);
        return res.status(500).json({ error: err });
      }
      res.json({
        id: result.insertId,
        title,
        doctor,
        date,
        time,
        reminder,
      });
    });
  });

  // 📋 Obtenir toutes les vaccinations
  router.get("/", (req, res) => {
    const query = "SELECT * FROM vaccinations ORDER BY date DESC";
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Erreur lors de la récupération :", err);
        return res.status(500).json({ error: err });
      }
      res.json(results);
    });
  });

  // ✏️ Mettre à jour une vaccination
  router.put("/:id", (req, res) => {
    const { title, doctor, date, time, reminder } = req.body;
    const { id } = req.params;

    const query =
      "UPDATE vaccinations SET title=?, doctor=?, date=?, time=?, reminder=? WHERE id=?";
    db.query(query, [title, doctor, date, time, reminder, id], (err, result) => {
      if (err) {
        console.error("❌ Erreur lors de la mise à jour :", err);
        return res.status(500).json({ error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Vaccination non trouvée" });
      }
      res.json({ success: true, message: "Vaccination mise à jour avec succès" });
    });
  });

  // ❌ Supprimer une vaccination
  router.delete("/:id", (req, res) => {
    const query = "DELETE FROM vaccinations WHERE id = ?";
    db.query(query, [req.params.id], (err) => {
      if (err) {
        console.error("❌ Erreur lors de la suppression :", err);
        return res.status(500).json({ error: err });
      }
      res.json({ success: true });
    });
  });

  return router;
};
