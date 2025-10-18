const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (db) => {
  // === REGISTER ===
  router.post('/register', (req, res) => {
    const { vorname, nachname, email, password } = req.body;

    if (!email || !password || !vorname || !nachname) {
      return res.status(400).send('⚠️ Données manquantes.');
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
      if (err) return res.status(500).send('Erreur serveur.');
      if (result.length > 0) return res.status(409).send('⚠️ Cet email existe déjà.');

      const hashed = bcrypt.hashSync(password, 10);
      const sql = 'INSERT INTO users (vorname, nachname, email, password) VALUES (?, ?, ?, ?)';

      db.query(sql, [vorname, nachname, email, hashed], (err) => {
        if (err) return res.status(500).send('Erreur SQL.');
        res.status(201).send('✅ Utilisateur enregistré avec succès.');
      });
    });
  });

  // === LOGIN ===
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('⚠️ Données manquantes.');
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, data) => {
      if (err) return res.status(500).send('Erreur serveur.');
      if (data.length === 0) return res.status(404).send('❌ Utilisateur non trouvé.');

      const user = data[0];
      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) return res.status(401).send('❌ Mot de passe incorrect.');

      // Création du token JWT (valide 1h)
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret_key_dev',
        { expiresIn: '1h' }
      );

      res.json({
        message: '✅ Connexion réussie.',
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

  return router;
};
