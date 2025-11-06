const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // === Route : obtenir le profil utilisateur ===
  router.post('/profile', (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'E-Mail erforderlich' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) {
        console.error('❌ SQL-Fehler:', err);
        return res.status(500).json({ message: 'Serverfehler beim Abrufen der Daten' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Benutzer nicht gefunden' });
      }

      res.json({ user: results[0] });
    });
  });

  

  return router;
};
