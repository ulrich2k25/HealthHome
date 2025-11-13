const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

// 🧠 Dictionnaire temporaire pour stocker les tentatives
const loginAttempts = {}; // { email: { count: number, lastAttempt: timestamp } }

module.exports = (db) => {
  // === INSCRIPTION ===
  router.post("/register", async (req, res) => {
    const { vorname, nachname, email, password } = req.body;
    if (!email || !password || !vorname || !nachname) {
      return res.status(400).send("⚠️ Données manquantes.");
    }

    try {
      const [existingUser] = await db
        .promise()
        .query("SELECT * FROM users WHERE email = ?", [email]);
      if (existingUser.length > 0)
        return res.status(409).send("⚠️ Cet email existe déjà.");

      const [pending] = await db
        .promise()
        .query("SELECT * FROM pending_users WHERE email = ?", [email]);
      if (pending.length > 0)
        await db.promise().query("DELETE FROM pending_users WHERE email = ?", [email]);

      const hashed = bcrypt.hashSync(password, 10);
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await db
        .promise()
        .query(
          "INSERT INTO pending_users (vorname, nachname, email, password_hash, verification_code) VALUES (?, ?, ?, ?, ?)",
          [vorname, nachname, email, hashed, code]
        );

      const message = `Hallo ${vorname},\n\nHier ist Ihr HealthHome-Verifizierungscode : ${code}\n\n Dieser Code läuft in 10 Minuten ab.`;
      await sendEmail(email, "Code de vérification HealthHome", message);

      console.log("✉️ Email de vérification envoyé à :", email);
      res.status(201).json({
        success: true,
        message: "✅ Inscription en attente, code envoyé par email.",
      });
    } catch (err) {
      console.error("Erreur inscription :", err);
      res.status(500).send("Erreur serveur lors de l'inscription.");
    }
  });

  // === VÉRIFICATION DU CODE ===
  router.post("/verify-code", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).send("⚠️ Email ou code manquant.");

    try {
      const [pending] = await db
        .promise()
        .query(
          "SELECT * FROM pending_users WHERE email = ? AND verification_code = ?",
          [email, code]
        );

      if (pending.length === 0) {
        return res.status(400).send("❌ Code incorrect ou expiré.");
      }

      const user = pending[0];

      await db
        .promise()
        .query(
          "INSERT INTO users (vorname, nachname, email, password, verified, created_at) VALUES (?, ?, ?, ?, 1, NOW())",
          [user.vorname, user.nachname, user.email, user.password_hash]
        );

      await db.promise().query("DELETE FROM pending_users WHERE email = ?", [email]);

      console.log("✅ Email vérifié et compte activé :", email);
      res.json({ success: true, message: "✅ Vérification réussie, compte activé !" });
    } catch (err) {
      console.error("Erreur lors de la vérification :", err);
      res.status(500).send("Erreur serveur lors de la vérification du code.");
    }
  });

  // === LOGIN (avec limitation d'essais) ===
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).send("⚠ Données manquantes.");

    try {
      // 🔒 Vérifie les tentatives précédentes
      const record = loginAttempts[email] || { count: 0, lastAttempt: 0 };
      const now = Date.now();

      // Si 5 échecs en moins de 10 minutes → bloquer
      if (record.count >= 3 && now - record.lastAttempt < 10 * 60 * 1000) {
        return res
          .status(429)
          .send("⛔ Trop de tentatives. Réessaie dans 10 minutes.");
      }

      const [rows] = await db
        .promise()
        .query("SELECT * FROM users WHERE email = ?", [email]);

      if (rows.length === 0) {
        // Compte inexistant → incrémente le compteur
        loginAttempts[email] = { count: record.count + 1, lastAttempt: now };
        return res.status(404).send("❌ Utilisateur non trouvé.");
      }

      const user = rows[0];
      const isValid = bcrypt.compareSync(password, user.password);

      if (!isValid) {
        // ❌ Mauvais mot de passe → incrémente le compteur
        loginAttempts[email] = { count: record.count + 1, lastAttempt: now };
        return res.status(401).send("❌ Mot de passe incorrect.");
      }

      if (user.verified === 0)
        return res
          .status(403)
          .send("⚠ Veuillez d'abord vérifier votre email avant de vous connecter.");

      // ✅ Connexion réussie → reset du compteur
      delete loginAttempts[email];

      // 🔐 Génère un token JWT valable 30 jours
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "secret_key_dev",

        //delai de validite du token
       { expiresIn: "30m" } // 10 minutes

      );

      // 💾 Sauvegarde du token
      await db
        .promise()
        .query("UPDATE users SET auth_token = ? WHERE email = ?", [token, email]);

      res.json({
        message: "✅ Connexion réussie.",
        token,
        user: {
          id: user.id,
          vorname: user.vorname,
          nachname: user.nachname,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("Erreur login :", err);
      res.status(500).send("Erreur serveur lors du login.");
    }
  });

  // === VÉRIFICATION DU TOKEN ===
  router.post("/verify-token", async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token)
      return res.status(400).json({ valid: false, message: "Email ou token manquant" });

    try {
      jwt.verify(token, process.env.JWT_SECRET || "ton_secret_jwt");

      const [rows] = await db
        .promise()
        .query("SELECT auth_token FROM users WHERE email = ?", [email]);

      if (rows.length === 0)
        return res.json({ valid: false, message: "Utilisateur introuvable" });

      if (rows[0].auth_token === token) {
        return res.json({ valid: true, message: "Token valide" });
      } else {
        return res.json({ valid: false, message: "Token invalide" });
      }
    } catch (err) {
      return res
        .status(401)
        .json({ valid: false, message: "Token expiré ou invalide." });
    }
  });

  return router;
};
