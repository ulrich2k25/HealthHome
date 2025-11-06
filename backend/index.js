const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: "http://localhost:3001", // ton frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
app.use(express.json());

<<<<<<< HEAD
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
=======
// 🌍 Connexion MySQL hébergée en ligne
const db = mysql.createConnection({
  
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


>>>>>>> 6333950b4fb5375d050a553419a550de7dd83354
db.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base distante :', err);
  } else {
    console.log('✅ Connecté à la base MySQL distante (FreeSQLDatabase.com)');
  }
});

// Route test principale
app.get('/', (req, res) => {
  res.send('✅ API HealthHome fonctionne parfaitement (base distante connectée)');
});

// Test de requête SQL simple
app.get('/api/healthcheck', (req, res) => {
  db.query('SELECT 1 AS ok', (err, result) => {
    if (err) return res.status(500).send('Erreur SQL');
    res.json({ db: result[0].ok === 1 ? 'ok' : 'fail' });
  });
});

// === Import des routes ===
const authRoutes = require("./routes/authRoutes")(db);
app.use('/api', authRoutes);

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

const vaccinationRoutes = require("./routes/vaccinationRoutes")(db);
app.use("/api/vaccinations", vaccinationRoutes);

const medikamenteRoutes = require("./routes/medikamenteroutes")(db);
app.use("/api/medikamente", medikamenteRoutes);

const vitalsroutes = require("./routes/vitalsroutes")(db);
app.use("/api/vitals", vitalsroutes);

const backupRoutes = require("./routes/backupRoutes")(db);
app.use("/api/backup", backupRoutes);

 

// 🚀 Démarrage du serveur
app.listen(4000, () => {
  console.log('🚀 Backend démarré sur http://localhost:4000');
});
