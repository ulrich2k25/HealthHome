const express = require("express");

module.exports = (db, io) => {
  const router = express.Router();

  // --- POST /api/vitals : Ajouter un enregistrement ---
  router.post("/", (req, res) => {
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
        io.emit("updateVitals");
        res.status(201).json({ id: result.insertId, message: "✅ Vitalwert erfolgreich gespeichert" });
      }
    );
  });

  // --- GET /api/vitals : Tous les enregistrements ---
  router.get("/", (req, res) => {
    db.query("SELECT * FROM vitalwerte ORDER BY datum DESC", (err, rows) => {
      if (err) {
        console.error("❌ Fehler beim Laden:", err);
        return res.status(500).json({ message: "Fehler beim Laden der Vitalwerte" });
      }
      res.json(rows);
    });
  });

  // --- GET /api/vitals/by-date/:date ---
  // Renvoie les valeurs pour un jour précis
  router.get("/by-date/:date", (req, res) => {
    const { date } = req.params;
    const sql = `
      SELECT * FROM vitalwerte 
      WHERE DATE(datum) = ?
      ORDER BY datum DESC
    `;
    db.query(sql, [date], (err, rows) => {
      if (err) {
        console.error("❌ Fehler beim Laden nach Datum:", err);
        return res.status(500).json({ message: "Fehler beim Filtern der Vitalwerte" });
      }
      res.json(rows);
    });
  });

  // --- GET /api/vitals/by-range?start=YYYY-MM-DD&end=YYYY-MM-DD ---
  // Pour filtrer par semaine ou plage de dates
  router.get("/by-range", (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: "Start und Enddatum erforderlich" });
    }
    const sql = `
      SELECT * FROM vitalwerte
      WHERE DATE(datum) BETWEEN ? AND ?
      ORDER BY datum DESC
    `;
    db.query(sql, [start, end], (err, rows) => {
      if (err) {
        console.error("❌ Fehler beim Laden nach Zeitraum:", err);
        return res.status(500).json({ message: "Fehler beim Filtern der Vitalwerte" });
      }
      res.json(rows);
    });
  });

  // --- GET /api/vitals/latest : dernier enregistrement ---
  router.get("/latest", (req, res) => {
    db.query("SELECT * FROM vitalwerte ORDER BY datum DESC LIMIT 1", (err, rows) => {
      if (err) {
        console.error("❌ Fehler beim Laden des letzten Vitalwerts:", err);
        return res.status(500).json({ message: "Fehler beim Laden des letzten Vitalwerts" });
      }
      res.json(rows[0] || {});
    });
  });

  // --- PUT /api/vitals/:id : Modifier un enregistrement ---
  router.put("/:id", (req, res) => {
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
      UPDATE vitalwerte
      SET typ=?, herz=?, systolisch=?, diastolisch=?, schlaf=?, schritte=?, blutzucker=?, temperatur=?, datum=?
      WHERE id=?
    `;

    db.query(
      sql,
      [typ, herz, systolisch, diastolisch, schlaf, schritte, blutzucker, temperatur, datum, req.params.id],
      (err, result) => {
        if (err) {
          console.error("❌ Fehler beim Aktualisieren:", err);
          return res.status(500).json({ message: "Fehler beim Aktualisieren der Vitalwerte" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Kein Eintrag gefunden" });
        }
        io.emit("updateVitals");
        res.json({ success: true, message: "✅ Vitalwert aktualisiert" });
      }
    );
  });

  // --- DELETE /api/vitals/:id ---
  router.delete("/:id", (req, res) => {
    db.query("DELETE FROM vitalwerte WHERE id = ?", [req.params.id], (err, result) => {
      if (err) {
        console.error("❌ Fehler beim Löschen:", err);
        return res.status(500).json({ message: "Fehler beim Löschen der Vitalwerte" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Vitalwert nicht gefunden" });
      }
      io.emit("updateVitals");
      res.json({ message: "🗑️ Vitalwert gelöscht" });
    });
  });

  return router;
};
