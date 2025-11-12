<<<<<<< HEAD
// =============================
// 🌐 IMPORTS
// =============================
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// =============================
// ⚙️ APP + SOCKET.IO
// =============================
=======
// ======================================================
// 🚀 index.js — Point d’entrée du backend HealthHome
// ======================================================

// 1️⃣ Importation des modules nécessaires
const express = require('express');      // Framework web principal
const cors = require('cors');            // Autorise les requêtes cross-domain (Next.js → Express)
const mysql = require('mysql2');         // Pour se connecter à la base MySQL
require('dotenv').config();              // Charge les variables depuis le fichier .env

// 2️⃣ Création de l'application Express
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
const app = express();
const server = http.createServer(app); // ⚠️ Remplace app.listen par server.listen
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // ton frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// =============================
// ⚡ MIDDLEWARES
// =============================
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

<<<<<<< HEAD
// =============================
// 💾 CONNEXION MYSQL DISTANTE
// =============================
=======
// ======================================================
// 🔗 Connexion à la base de données MySQL (hébergée en ligne)
// ======================================================

>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion MySQL :", err);
  } else {
    console.log("✅ Connecté à la base MySQL distante (FreeSQLDatabase.com)");
  }
});

<<<<<<< HEAD
// =============================
// 🧭 ROUTES DE TEST
// =============================
app.get("/", (req, res) => {
  res.send("✅ API HealthHome + Socket.IO opérationnelle !");
});

app.get("/api/healthcheck", (req, res) => {
  db.query("SELECT 1 AS ok", (err, result) => {
    if (err) return res.status(500).send("Erreur SQL");
    res.json({ db: result[0].ok === 1 ? "ok" : "fail" });
  });
});

// =============================
// 📡 SOCKET.IO ÉVÉNEMENTS GLOBAUX
// =============================
io.on("connection", (socket) => {
  console.log("🟢 Client connecté :", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté :", socket.id);
  });
});

// =============================
// 🧩 IMPORT DES ROUTES (avec io)
// =============================
=======
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
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
const authRoutes = require("./routes/authRoutes")(db);
app.use("/api", authRoutes);

const userProfileRoutes = require("./routes/userroutes")(db);
app.use("/api/user", userProfileRoutes);

const editProfileRoutes = require("./routes/editprofileroutes")(db);
app.use("/api/user", editProfileRoutes);

const diagnosisRoutes = require("./routes/diagnosisRoutes")(db);
app.use("/api/diagnosis", diagnosisRoutes);

<<<<<<< HEAD
=======

// Gestion des rendez-vous
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
const terminRoutes = require("./routes/termineRoutes")(db);
app.use("/api/termin", terminRoutes);

// ✅ Nutrition + Vitalwerte doivent recevoir io
const nutritionRoutes = require("./routes/nutritionroutes")(db, io);
app.use("/api/nutrition", nutritionRoutes);

<<<<<<< HEAD
const vitalsroutes = require("./routes/vitalsroutes")(db, io);
app.use("/api/vitals", vitalsroutes);

const vaccinationRoutes = require("./routes/vaccinationRoutes")(db);
app.use("/api/vaccinations", vaccinationRoutes);

const medikamenteRoutes = require("./routes/medikamenteroutes")(db);
=======
// Gestion des vaccinations
const vaccinationRoutes = require("./routes/vaccinationRoutes")(db);
app.use("/api/vaccinations", vaccinationRoutes);

// Gestion des médicaments
const medikamenteRoutes = require("./routes/medikamenteRoutes")(db);
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
app.use("/api/medikamente", medikamenteRoutes);

const backupRoutes = require("./routes/backupRoutes")(db);
app.use("/api/backup", backupRoutes);

<<<<<<< HEAD
// =============================
// 🚀 LANCEMENT DU SERVEUR
// =============================
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Backend + Socket.IO sur http://localhost:${PORT}`);
=======
// 🚀 Démarrage du serveur
app.listen(4000, () => {
  console.log('🚀 Backend démarré sur http://localhost:4000');
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
>>>>>>> 94e2b4840c72901e53f07dfccdda66cec976c0e7
});

})
