const express = require("express");

module.exports = (db, io) => {
  const router = express.Router();

  // 🩺 POST /api/vitals → ajoute un enregistrement
  router.post("/", async (req, res) => {
    const {
      typ,
      herz,
      systolisch,
      diastolisch,
      schlaf,
      schritte,
      blutzucker,
      temperatur,
      datum,
    } = req.body;

    const sql = `
      INSERT INTO vitalwerte 
      (typ, herz, systolisch, diastolisch, schlaf, schritte, blutzucker, temperatur, datum)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [typ, herz, systolisch, diastolisch, schlaf, schritte, blutzucker, temperatur, datum],
      (err, result) => {
        if (err) {
          console.error("❌ Fehler beim Speichern:", err);
          return res.status(500).json({ message: "Fehler beim Speichern der Vitalwerte" });
        }

        // 🟢 Émet un signal Socket.IO pour mettre à jour le dashboard
        io.emit("updateVitals");

        res.status(201).json({
          id: result.insertId,
          message: "✅ Vitalwert erfolgreich gespeichert",
        });
      }
    );
  });

  // 📋 GET /api/vitals → renvoie tous les enregistrements
  router.get("/", (req, res) => {
    db.query("SELECT * FROM vitalwerte ORDER BY datum DESC", (err, rows) => {
      if (err) {
        console.error("❌ Fehler beim Laden:", err);
        return res.status(500).json({ message: "Fehler beim Laden der Vitalwerte" });
      }
      res.json(rows);
    });
  });

  // 📅 GET /api/vitals/by-date/:date → filtre par jour
  router.get("/by-date/:date", (req, res) => {
    const { date } = req.params;
    const sql = "SELECT * FROM vitalwerte WHERE DATE(datum) = ? ORDER BY datum DESC";
    db.query(sql, [date], (err, rows) => {
      if (err) {
        console.error("❌ Fehler beim Filtern:", err);
        return res.status(500).json({ message: "Fehler beim Filtern der Vitalwerte" });
      }
      res.json(rows);
    });
  });

  // 📆 GET /api/vitals/by-range?start=...&end=...
  router.get("/by-range", (req, res) => {
    const { start, end } = req.query;
    if (!start || !end)
      return res.status(400).json({ message: "Start- und Enddatum erforderlich" });

    const sql = `
      SELECT * FROM vitalwerte 
      WHERE DATE(datum) BETWEEN ? AND ? 
      ORDER BY datum DESC
    `;
    db.query(sql, [start, end], (err, rows) => {
      if (err) {
        console.error("❌ Fehler beim Filtern:", err);
        return res.status(500).json({ message: "Fehler beim Filtern der Vitalwerte" });
      }
      res.json(rows);
    });
  });

  // ❌ DELETE /api/vitals/:id → supprime un enregistrement
  router.delete("/:id", (req, res) => {
    db.query("DELETE FROM vitalwerte WHERE id = ?", [req.params.id], (err, result) => {
      if (err) {
        console.error("❌ Fehler beim Löschen:", err);
        return res.status(500).json({ message: "Fehler beim Löschen der Vitalwerte" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Vitalwert nicht gefunden" });
      }

      // 🟢 Émet un signal Socket.IO après suppression
      io.emit("updateVitals");

      res.json({ message: "🗑️ Vitalwert gelöscht" });
    });
  });

  // 📌 GET /api/vitals/latest → renvoie le dernier enregistrement de chaque type
  router.get("/latest", (req, res) => {
    const sql = `
      SELECT t.* FROM vitalwerte t
      INNER JOIN (
        SELECT typ, MAX(datum) AS maxDatum
        FROM vitalwerte
        GROUP BY typ
      ) tm ON t.typ = tm.typ AND t.datum = tm.maxDatum
      ORDER BY t.typ
    `;
    db.query(sql, (err, rows) => {
      if (err) {
        console.error("❌ Fehler beim Laden der letzten Vitalwerte:", err);
        return res.status(500).json({ message: "Fehler beim Laden der letzten Vitalwerte" });
      }
      res.json(rows);
    });
  });

  return router;
};
