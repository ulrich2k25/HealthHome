const express = require("express");

module.exports = (db) => {
  const router = express.Router();


  // POST /api/vitals
  router.post("/", async (req, res) => {
    const { typ, herz, systolisch, diastolisch, schlaf, schritte, blutzucker, temperatur, datum } = req.body;

    const sql = `
      INSERT INTO vitalwerte 
      (typ, herz, systolisch, diastolisch, schlaf, schritte, blutzucker, temperatur, datum)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [typ, herz, systolisch, diastolisch, schlaf, schritte, blutzucker, temperatur, datum], (err, result) => {
      if (err) {
        console.error("Fehler beim Speichern:", err);
        return res.status(500).json({ message: "Fehler beim Speichern der Vitalwerte" });
      }
      res.status(201).json({ id: result.insertId, message: "Vitalwert erfolgreich gespeichert" });
    });
  });

  // GET /api/vitals
  router.get("/", (req, res) => {
    db.query("SELECT * FROM vitalwerte ORDER BY datum DESC", (err, rows) => {
      if (err) {
        console.error("Fehler beim Laden:", err);
        return res.status(500).json({ message: "Fehler beim Laden der Vitalwerte" });
      }
      res.json(rows);
    });
  });

  // DELETE /api/vitals/:id
  router.delete("/:id", (req, res) => {
    db.query("DELETE FROM vitalwerte WHERE id = ?", [req.params.id], (err, result) => {
      if (err) {
        console.error("Fehler beim Löschen:", err);
        return res.status(500).json({ message: "Fehler beim Löschen der Vitalwerte" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Vitalwert nicht gefunden" });
      }
      res.json({ message: "Vitalwert gelöscht" });
    });
  });

  return router;
}
