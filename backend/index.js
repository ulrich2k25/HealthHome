// ======================================================
// 🚀 index.js — Point d’entrée du backend HealthHome
// ======================================================

// 1️⃣ Importation des modules nécessaires
const express = require('express');      // Framework web principal
const cors = require('cors');            // Autorise les requêtes cross-domain (Next.js → Express)
const mysql = require('mysql2');         // Pour se connecter à la base MySQL
require('dotenv').config();              // Charge les variables depuis le fichier .env

// 2️⃣ Création de l'application Express
const app = express();

// 3️⃣ Activation des middlewares
app.use(cors());             // Permet à ton frontend (localhost:3001) d’appeler ton backend
app.use(express.json());     // Permet à Express de lire les données JSON dans le corps des requêtes

// ======================================================
// 🔗 Connexion à la base de données MySQL (hébergée en ligne)
// ======================================================

const db = mysql.createConnection({
  host: process.env.DB_HOST,        // ex: sql.freesqldatabase.com
  user: process.env.DB_USER,        // ton identifiant
  password: process.env.DB_PASSWORD,// ton mot de passe
  database: process.env.DB_NAME,    // nom de la base
  port: process.env.DB_PORT         // souvent 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base distante :', err);
  } else {
    console.log('✅ Connecté à la base MySQL distante (FreeSQLDatabase.com)');
  }
});

// ======================================================
// 🧩 Routes de test
// ======================================================

// Test simple pour vérifier que le backend fonctionne
app.get('/', (req, res) => {
  res.send('✅ API HealthHome fonctionne parfaitement (base distante connectée)');
});

// Test SQL pour vérifier la base de données
app.get('/api/healthcheck', (req, res) => {
  db.query('SELECT 1 AS ok', (err, result) => {
    if (err) return res.status(500).send('Erreur SQL');
    res.json({ db: result[0].ok === 1 ? 'ok' : 'fail' });
  });
});

// ======================================================
// 📦 Importation des routes (modules séparés)
// ======================================================

// Authentification (login / register / verify)
const authRoutes = require("./routes/authRoutes")(db);
app.use('/api', authRoutes);

// Gestion des rendez-vous
const terminRoutes = require("./routes/termineRoutes")(db);
app.use("/api/termin", terminRoutes);

// Gestion des vaccinations
const vaccinationRoutes = require("./routes/vaccinationRoutes")(db);
app.use("/api/vaccinations", vaccinationRoutes);

// Gestion des médicaments
const medikamenteRoutes = require("./routes/medikamenteRoutes")(db);
app.use("/api/medikamente", medikamenteRoutes);

// Exportation PDF / CSV
const exportRoutes = require("./routes/exportRoutes");
app.use("/api", exportRoutes);

// Envoi des mails (PDF ou CSV au médecin)
const mailRoutes = require("./routes/mailRoutes");
app.use("/api", mailRoutes);

// ======================================================
// 🟢 Lancement du serveur Express
// ======================================================
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur http://localhost:${PORT}`);
});


