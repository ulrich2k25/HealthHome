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

// =============================
// 💾 CONNEXION MYSQL DISTANTE
// =============================
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
const authRoutes = require("./routes/authRoutes")(db);
app.use("/api", authRoutes);

const userProfileRoutes = require("./routes/userroutes")(db);
app.use("/api/user", userProfileRoutes);

const editProfileRoutes = require("./routes/editprofileroutes")(db);
app.use("/api/user", editProfileRoutes);

const diagnosisRoutes = require("./routes/diagnosisRoutes")(db);
app.use("/api/diagnosis", diagnosisRoutes);

const terminRoutes = require("./routes/termineRoutes")(db);
app.use("/api/termin", terminRoutes);

// ✅ Nutrition + Vitalwerte doivent recevoir io
const nutritionRoutes = require("./routes/nutritionroutes")(db, io);
app.use("/api/nutrition", nutritionRoutes);

const vitalsroutes = require("./routes/vitalsroutes")(db, io);
app.use("/api/vitals", vitalsroutes);

const vaccinationRoutes = require("./routes/vaccinationRoutes")(db);
app.use("/api/vaccinations", vaccinationRoutes);

const medikamenteRoutes = require("./routes/medikamenteroutes")(db);
app.use("/api/medikamente", medikamenteRoutes);

const backupRoutes = require("./routes/backupRoutes")(db);
app.use("/api/backup", backupRoutes);

// =============================
// 🚀 LANCEMENT DU SERVEUR
// =============================
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Backend + Socket.IO sur http://localhost:${PORT}`);
});
