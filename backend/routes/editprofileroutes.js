const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/edit-profile", (req, res) => {
    const {
      email,
      vorname,
      nachname,
      alter,
      geschlecht,
      gewicht,
      groesse,
      allergien,
      kommentar_aerzte,
      datum, // 🆕 ajouté
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "E-Mail erforderlich" });
    }

    // Vérifier si l'utilisateur existe
    const sqlCheck = "SELECT * FROM users WHERE email = ?";
    db.query(sqlCheck, [email], (err, results) => {
      if (err) return res.status(500).json({ message: "SQL-Fehler" });

      if (results.length === 0) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      // 🧩 Mettre à jour les données
      const sqlUpdate = `
        UPDATE users 
        SET vorname = ?, nachname = ?, alter_jahre = ?, geschlecht = ?, 
            gewicht = ?, groesse = ?, allergien = ?, kommentar_aerzte = ?, datum = ?
        WHERE email = ?
      `;

      db.query(
        sqlUpdate,
        [vorname, nachname, alter, geschlecht, gewicht, groesse, allergien, kommentar_aerzte, datum, email],
        (err2) => {
          if (err2) {
            console.error("❌ Fehler beim Aktualisieren:", err2);
            return res.status(500).json({ message: "Fehler beim Aktualisieren" });
          }

          res.json({ success: true, message: "✅ Daten erfolgreich gespeichert!" });
        }
      );
    });
  });

  return router;
};
