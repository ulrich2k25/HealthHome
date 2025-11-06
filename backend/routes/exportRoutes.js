// ========================
// IMPORTATION DES MODULES
// ========================

// Express = framework pour créer des routes HTTP (comme /api/export)
const express = require('express');

// MySQL2 = permet de se connecter à ta base de données MySQL
const mysql = require('mysql2');

// json2csv = transforme les données JSON en fichier CSV
const { Parser } = require('json2csv');

// pdfkit = permet de créer un fichier PDF depuis du texte
const PDFDocument = require('pdfkit');

// On crée un "router" Express : il contiendra toutes les routes d'export
const router = express.Router();


// ========================
// CONNEXION À TA BASE DE DONNÉES MYSQL
// ========================

const db = mysql.createConnection({
 host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});


// ========================
// ROUTE : EXPORT CSV
// ========================

/*
  ➤ Cette route permet d'exporter les données d'un SEUL utilisateur
  sous format CSV.
  Exemple : http://localhost:4000/api/export/csv?id=8
*/
router.get('/export/csv', (req, res) => {
  // On récupère l'ID du patient depuis l'URL : ?id=8
  const userId = req.query.id;

  // Si l'ID est manquant, on renvoie une erreur
  if (!userId) return res.status(400).send('ID utilisateur manquant.');

  // Requête SQL : on récupère SEULEMENT les infos du bon utilisateur
  const query = 'SELECT vorname, nachname, email, created_at, verified FROM users WHERE id = ?';

  // On exécute la requête MySQL
  db.query(query, [userId], (err, results) => {
    // En cas d’erreur de base de données
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.status(500).send('Erreur de base de données.');
    }

    // Si aucun utilisateur trouvé (ex : ID inexistant)
    if (results.length === 0) {
      return res.status(404).send('Utilisateur non trouvé.');
    }

    // On convertit les données SQL en CSV avec json2csv
    const parser = new Parser();
    const csv = parser.parse(results);

    // On indique au navigateur que la réponse est un fichier CSV
    res.header('Content-Type', 'text/csv');
    res.attachment(`mes_donnees_utilisateur_${userId}.csv`);

    // On envoie le fichier au navigateur pour téléchargement
    res.send(csv);
  });
});


// ========================
// ROUTE : EXPORT PDF
// ========================

/*
  ➤ Même principe, mais cette fois on génère un PDF au lieu d’un CSV.
  Exemple : http://localhost:4000/api/export/pdf?id=8
*/
router.get('/export/pdf', (req, res) => {
  // Récupération de l'ID du patient depuis l’URL
  const userId = req.query.id;

  // Si aucun ID n’est fourni → message d’erreur
  if (!userId) return res.status(400).send('ID utilisateur manquant.');

  // Requête SQL : on sélectionne les colonnes utiles du bon utilisateur
  const query = 'SELECT vorname, nachname, email, created_at, verified FROM users WHERE id = ?';

  // On exécute la requête MySQL
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.status(500).send('Erreur de base de données.');
    }

    // Si aucun utilisateur trouvé
    if (results.length === 0) {
      return res.status(404).send('Utilisateur non trouvé.');
    }

    // On récupère le premier (et seul) utilisateur trouvé
    const user = results[0];

    // Création du document PDF
    const doc = new PDFDocument();

    // On prépare la réponse HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=mes_donnees_${user.vorname}.pdf`);

    // On envoie le PDF directement au navigateur
    doc.pipe(res);

    // === CONTENU DU PDF ===
    doc.fontSize(18).text('Mes données personnelles HealthHome', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(`Prénom : ${user.vorname}`);
    doc.text(`Nom : ${user.nachname}`);
    doc.text(`Email : ${user.email}`);
    doc.text(`Compte créé le : ${user.created_at}`);
    doc.text(`Compte vérifié : ${user.verified ? 'Oui' : 'Non'}`);
    doc.moveDown(2);
    doc.text('Merci d’utiliser HealthHome 💚', { align: 'center' });

    // On termine et envoie le PDF
    doc.end();
  });
});


// ========================
// EXPORT DU ROUTER
// ========================

// Cette ligne rend les routes accessibles depuis index.js
module.exports = router;
