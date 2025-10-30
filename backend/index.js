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

// Connexion MySQL locale (WAMP)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'healthhome'
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

// ➕ Nouvelle route pour les vaccinations
const vaccinationRoutes = require("./routes/vaccinationRoutes")(db);
app.use("/api/vaccinations", vaccinationRoutes);

const medikamenteRoutes = require("./routes/medikamenteRoutes")(db);
app.use("/api/medikamente", medikamenteRoutes);
 



// Démarrage du serveur
app.listen(4000, () => {
  console.log('🚀 Backend démarré sur http://localhost:4000');
});
 
