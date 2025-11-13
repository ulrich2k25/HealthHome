const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // tu as déjà ce module
module.exports = (db) => {
  const router = express.Router();

  // 1️⃣ Demande de réinitialisation
  router.post("/request-reset", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send("E-Mail erforderlich");

    // Vérifie si l'utilisateur existe
    const [rows] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).send("Kein Benutzer mit dieser E-Mail");

    // Génère un token aléatoire
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 1000 * 60 * 10); // 10 min

    // Stocke dans la base (colonne à ajouter : reset_token, reset_expiration)
    await db.promise().query(
      "UPDATE users SET reset_token = ?, reset_expiration = ? WHERE email = ?",
      [token, expiration, email]
    );

    // Envoie un email avec le lien
    const resetLink = `http://localhost:3001/reset-password?token=${token}`;
    await sendEmail(email, "Passwort zurücksetzen", `
      <h3>Passwort zurücksetzen</h3>
      <p>Klicke auf den folgenden Link, um dein Passwort zu ändern:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Dieser Link ist 10 Minuten gültig.</p>
    `);

    res.send("E-Mail zum Zurücksetzen gesendet ✅");
  });

  // 2️⃣ Réinitialisation du mot de passe
  router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).send("Fehlende Daten");

    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_expiration > NOW()",
      [token]
    );
    if (rows.length === 0) return res.status(400).send("Ungültiger oder abgelaufener Token");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expiration = NULL WHERE id = ?",
      [hashedPassword, rows[0].id]
    );

    res.send("Passwort erfolgreich geändert ✅");
  });

  return router;
};
