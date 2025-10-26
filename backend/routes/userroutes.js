const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/profile", async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email manquant." });
    }

    try {
      const [rows] = await db
        .promise()
        .query(
          "SELECT vorname, nachname, email, alter_jahre, geschlecht, gewicht, groesse, allergien, diagnose FROM users WHERE email = ?",
          [email]
        );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      res.json({ success: true, user: rows[0] });
    } catch (err) {
      console.error("Erreur profil utilisateur :", err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  });

  return router;
};
