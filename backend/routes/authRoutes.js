const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

module.exports = (db) => {
  // === INSCRIPTION (étape 1 : stocke dans pending_users + envoi du code) ===
  router.post("/register", async (req, res) => {
    const { vorname, nachname, email, password } = req.body;
    if (!email || !password || !vorname || !nachname) {
      return res.status(400).send("⚠️ Données manquantes.");
    }

    try {
      // Vérifie si l'utilisateur existe déjà dans users
      const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
      if (existingUser.length > 0)
        return res.status(409).send("⚠️ Cet email existe déjà.");

      // Vérifie si un enregistrement en attente existe déjà
      const [pending] = await db.promise().query("SELECT * FROM pending_users WHERE email = ?", [email]);
      if (pending.length > 0)
        await db.promise().query("DELETE FROM pending_users WHERE email = ?", [email]); // on nettoie

      // Hash du mot de passe
      const hashed = bcrypt.hashSync(password, 10);

      // Génération du code à 6 chiffres
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Insertion dans pending_users
      await db.promise().query(
        "INSERT INTO pending_users (vorname, nachname, email, password_hash, verification_code) VALUES (?, ?, ?, ?, ?)",
        [vorname, nachname, email, hashed, code]
      );

      // Envoi de l’e-mail
      const message = `Hallo ${vorname},\n\nHier ist Ihr HealthHome-Verifizierungscode : ${code}\n\nCe code expirera dans 10 minutes.`;

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

  // === VÉRIFICATION DU CODE (étape 2 : transfert vers users) ===
  router.post("/verify-code", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).send("⚠️ Email ou code manquant.");

    try {
      // Recherche dans pending_users
      const [pending] = await db.promise().query(
        "SELECT * FROM pending_users WHERE email = ? AND verification_code = ?",
        [email, code]
      );

      if (pending.length === 0) {
        return res.status(400).send("❌ Code incorrect ou expiré.");
      }

      const user = pending[0];

      // Transfert vers users
      await db.promise().query(
        "INSERT INTO users (vorname, nachname, email, password, verified, created_at) VALUES (?, ?, ?, ?, 1, NOW())",
        [user.vorname, user.nachname, user.email, user.password_hash]
      );

      // Suppression de pending_users après transfert
      await db.promise().query("DELETE FROM pending_users WHERE email = ?", [email]);

      console.log("✅ Email vérifié et compte activé :", email);
      res.json({ success: true, message: "✅ Vérification réussie, compte activé !" });
    } catch (err) {
      console.error("Erreur lors de la vérification :", err);
      res.status(500).send("Erreur serveur lors de la vérification du code.");
    }
  });

  // === LOGIN (uniquement si verified = 1) ===
  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).send("⚠️ Données manquantes.");

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, data) => {
      if (err) return res.status(500).send("Erreur serveur.");
      if (data.length === 0)
        return res.status(404).send("❌ Utilisateur non trouvé.");

      const user = data[0];
      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid)
        return res.status(401).send("❌ Mot de passe incorrect.");

      if (user.verified === 0) {
        return res.status(403).send("⚠️ Veuillez d'abord vérifier votre email avant de vous connecter.");
      }

      // Génère le token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "secret_key_dev",
        { expiresIn: "1h" }
      );

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
    });
  });

  // === VÉRIFICATION DU TOKEN ===
  router.get("/verify-token", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ valid: false, message: "Token manquant" });

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key_dev");
      const email = decoded.email;

      db.query("SELECT verified FROM users WHERE email = ?", [email], (err, result) => {
        if (err)
          return res.status(500).json({ valid: false, message: "Erreur SQL" });
        if (result.length === 0)
          return res.status(404).json({ valid: false, message: "Utilisateur non trouvé" });

        if (result[0].verified === 1) {
          res.json({ valid: true, message: "Utilisateur vérifié" });
        } else {
          res.status(403).json({ valid: false, message: "Compte non vérifié" });
        }
      });
    } catch (err) {
      return res.status(401).json({ valid: false, message: "Token invalide ou expiré" });
    }
  });

  return router;
};
