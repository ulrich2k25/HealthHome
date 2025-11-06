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
<<<<<<< HEAD
app.use(cors({
    origin: "http://localhost:3001", // ton frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
app.use(express.json());
=======
>>>>>>> origin/feature_vidale

// 3️⃣ Activation des middlewares
app.use(cors());             // Permet à ton frontend (localhost:3001) d’appeler ton backend
app.use(express.json());     // Permet à Express de lire les données JSON dans le corps des requêtes

// ======================================================
// 🔗 Connexion à la base de données MySQL (hébergée en ligne)
// ======================================================

const db = mysql.createConnection({
<<<<<<< HEAD
  
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
=======
  host: process.env.DB_HOST,        // ex: sql.freesqldatabase.com
  user: process.env.DB_USER,        // ton identifiant
  password: process.env.DB_PASSWORD,// ton mot de passe
  database: process.env.DB_NAME,    // nom de la base
  port: process.env.DB_PORT         // souvent 3306
>>>>>>> origin/feature_vidale
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

<<<<<<< HEAD
// ✅ === Import de la route du profil utilisateur ===
const userProfileRoutes = require('./routes/userroutes')(db);
app.use('/api/user', userProfileRoutes);

const editProfileRoutes = require('./routes/editprofileroutes')(db);
app.use('/api/user', editProfileRoutes);

const diagnosisRoutes = require("./routes/diagnosisRoutes")(db);
app.use("/api/diagnosis", diagnosisRoutes);


const terminRoutes = require("./routes/termineRoutes")(db);
app.use("/api/termin", terminRoutes);


// import nutritionroutes
const nutritionRoutes = require("./routes/nutritionroutes")(db);
app.use("/api/nutrition", nutritionRoutes);

=======
// Gestion des rendez-vous
const terminRoutes = require("./routes/termineRoutes")(db);
app.use("/api/termin", terminRoutes);

// Gestion des vaccinations
>>>>>>> origin/feature_vidale
const vaccinationRoutes = require("./routes/vaccinationRoutes")(db);
app.use("/api/vaccinations", vaccinationRoutes);

// Gestion des médicaments
const medikamenteRoutes = require("./routes/medikamenteRoutes")(db);
app.use("/api/medikamente", medikamenteRoutes);

<<<<<<< HEAD
const vitalsroutes = require("./routes/vitalsroutes")(db);
app.use("/api/vitals", vitalsroutes);
 

// 🚀 Démarrage du serveur
app.listen(4000, () => {
  console.log('🚀 Backend démarré sur http://localhost:4000');
=======
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
>>>>>>> origin/feature_vidale
});


