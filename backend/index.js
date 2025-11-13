// ======================================================
// 🚀 index.js — Point d’entrée du backend HealthHome
// ======================================================

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// 1️⃣ Création de l’application Express
const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ======================================================
// 🔗 Connexion à la base de données MySQL
// ======================================================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base distante :", err);
  } else {
    console.log("✅ Connecté à la base MySQL distante (Hostinger ou FreeSQLDatabase)");
  }
});

// ======================================================
// ⚡ Serveur HTTP + Socket.IO (⚠️ Doit être avant les routes)
// ======================================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Nouveau client connecté :", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté :", socket.id);
  });
});

// ======================================================
// 🧩 Routes
// ======================================================
app.get("/", (req, res) => {
  res.send("✅ API HealthHome fonctionne parfaitement (base distante connectée)");
});

app.get("/api/healthcheck", (req, res) => {
  db.query("SELECT 1 AS ok", (err, result) => {
    if (err) return res.status(500).send("Erreur SQL");
    res.json({ db: result[0].ok === 1 ? "ok" : "fail" });
  });
});

// --- Authentification ---
const authRoutes = require("./routes/authRoutes")(db);
app.use("/api", authRoutes);

// --- Profil utilisateur ---
const userProfileRoutes = require("./routes/userroutes")(db);
app.use("/api/user", userProfileRoutes);

// --- Édition du profil utilisateur ---
const editProfileRoutes = require("./routes/editprofileroutes")(db);
app.use("/api/user", editProfileRoutes);

// --- Diagnostic médical ---
const diagnosisRoutes = require("./routes/diagnosisRoutes")(db);
app.use("/api/diagnosis", diagnosisRoutes);

// --- Rendez-vous ---
const terminRoutes = require("./routes/termineRoutes")(db);
app.use("/api/termin", terminRoutes);

// --- Nutrition ---
const nutritionRoutes = require("./routes/nutritionroutes")(db);
app.use("/api/nutrition", nutritionRoutes);

// --- Vaccinations ---
const vaccinationRoutes = require("./routes/vaccinationRoutes")(db);
app.use("/api/vaccinations", vaccinationRoutes);

// --- Médicaments ---
const medikamenteRoutes = require("./routes/medikamenteRoutes")(db);
app.use("/api/medikamente", medikamenteRoutes);

// --- Valeurs vitales (⚡ socket.io inclus) ---
const vitalsroutes = require("./routes/vitalsroutes")(db, io);
app.use("/api/vitals", vitalsroutes);

// --- Exportation PDF / CSV ---
const exportRoutes = require("./routes/exportRoutes");
app.use("/api", exportRoutes);

// --- Envoi des mails ---
const mailRoutes = require("./routes/mailRoutes");
app.use("/api", mailRoutes);

const resetPasswordRoutes = require("./routes/resetPasswordRoutes")(db);
app.use("/api", resetPasswordRoutes);


// ======================================================
// 🟢 Lancement du serveur
// ======================================================
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur http://localhost:${PORT}`);
});
