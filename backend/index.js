const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: "http://localhost:3000", // ton frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
app.use(express.json());

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
    console.error('❌ Erreur de connexion à MySQL :', err);
  } else {
    console.log('✅ Connecté à la base de données MySQL locale (WAMP)');
  }
});

// Route test principale
app.get('/', (req, res) => {
  res.send('✅ API HealthHome fonctionne parfaitement');
});

// Test de requête SQL simple
app.get('/api/healthcheck', (req, res) => {
  db.query('SELECT 1 AS ok', (err, result) => {
    if (err) return res.status(500).send('Erreur SQL');
    res.json({ db: result[0].ok === 1 ? 'ok' : 'fail' });
  });
});

// === Import des routes d'authentification ===
const authRoutes = require("./routes/authRoutes")(db);
app.use('/api', authRoutes);

// ✅ ICI : bon import, avec “termineRoutes”
const terminRoutes = require("./routes/termineRoutes")(db);
app.use("/api/termin", terminRoutes);

// import nutritionroutes
const nutritionRoutes = require("./routes/nutritionroutes")(db);
app.use("/api/nutrition", nutritionRoutes);



// Démarrage du serveur
app.listen(4000, () => {
  console.log('🚀 Backend démarré sur http://localhost:4000');
});
 
