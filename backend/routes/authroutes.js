const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (db) => {
  // REGISTER
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

  return router;
};
