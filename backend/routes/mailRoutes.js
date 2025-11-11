// ======================================================
// 📧 mailRoutes.js — Envoi de PDF ou CSV par e-mail
// ======================================================

// Chargement des dépendances nécessaires
require("dotenv").config(); // Pour lire les variables du fichier .env
const express = require("express");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

// Création du routeur Express (mini API)
const router = express.Router();

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

// ======================================================
// 🧾 Fonction pour générer un PDF COMPLET (patient + données)
// ======================================================

function generatePDF(filePath, user, vitals, meds, vaccines, appointments, nutrition, diagnoses) {
  // 🔹 On passe maintenant le `filePath` en premier paramètre !
  return new Promise((resolve, reject) => {
    try {
      // Création du document PDF
      const doc = new PDFDocument({ margin: 50 });

      // Flux d’écriture vers le fichier
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // === TITRE ===
      doc.fontSize(20).text("Gesundheitsdaten – HealthHome", { align: "center" });
      doc.moveDown(2);

      // === Infos du patient ===
      doc.fontSize(14).text("Patientendaten", { underline: true });
      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .text(`Vorname: ${user.vorname}`)
        .text(`Nachname: ${user.nachname}`)
        .text(`E-Mail: ${user.email}`)
        .text(`Alter: ${user.alter_jahre || ""}`)
        .text(`Geschlecht: ${user.geschlecht || ""}`)
        .text(`Gewicht: ${user.gewicht || ""}`)
        .text(`Größe: ${user.groesse || ""}`)
        .text(`Allergien: ${user.allergien || ""}`)
        .text(`Kommentare für Ärzte: ${user.kommentar_aerzte || ""}`);
      doc.moveDown(1.5);

      // === Vitalwerte ===
      doc.fontSize(14).text("Vitalwerte", { underline: true });
      doc.moveDown(0.5);
      if (vitals.length > 0) {
        vitals.forEach((v) => {
          doc
            .fontSize(12)
            .text(`Datum: ${v.datum || ""}`)
            .text(`Blutdruck: ${v.blutdruck || ""}`)
            .text(`BPM: ${v.bpm || ""}`)
            .text(`Blutzucker: ${v.blutzucker || ""}`)
            .moveDown();
        });
      } else {
        doc.fontSize(12).text("Keine Vitaldaten gefunden.").moveDown();
      }

      // === Medikamente ===
      doc.fontSize(14).text("Medikamente", { underline: true });
      doc.moveDown(0.5);
      if (meds.length > 0) {
        meds.forEach((m) => {
          doc
            .fontSize(12)
            .text(`Name: ${m.name || ""}`)
            .text(`Dosierung: ${m.dosierung || ""}`)
            .text(`Häufigkeit: ${m.haeufigkeit || ""}`)
            .text(`Beginn: ${m.start_datum || ""}`)
            .text(`Ende: ${m.ende_datum || ""}`)
            .moveDown();
        });
      } else {
        doc.fontSize(12).text("Keine Medikamente gefunden.").moveDown();
      }

      // === Impfungen ===
      doc.fontSize(14).text("Impfungen", { underline: true });
      doc.moveDown(0.5);
      if (vaccines.length > 0) {
        vaccines.forEach((v) => {
          doc
            .fontSize(12)
            .text(`Impfstoff: ${v.name || ""}`)
            .text(`Datum: ${v.datum || ""}`)
            .text(`Arzt: ${v.arzt || ""}`)
            .moveDown();
        });
      } else {
        doc.fontSize(12).text("Keine Impfungen gefunden.").moveDown();
      }

      // === Termine ===
      doc.fontSize(14).text("Termine", { underline: true });
      doc.moveDown(0.5);
      if (appointments.length > 0) {
        appointments.forEach((t) => {
          doc
            .fontSize(12)
            .text(`Datum: ${t.datum || ""}`)
            .text(`Uhrzeit: ${t.uhrzeit || ""}`)
            .text(`Titel / Beschreibung: ${t.titel || t.beschreibung || ""}`)
            .moveDown();
        });
      } else {
        doc.fontSize(12).text("Keine Termine gefunden.").moveDown();
      }

      // === Diagnosen ===
      doc.fontSize(14).text("Diagnosen", { underline: true });
      doc.moveDown(0.5);
      if (diagnoses.length > 0) {
        diagnoses.forEach((d) => {
          doc
            .fontSize(12)
            .text(`Datum: ${d.datum || ""}`)
            .text(`Diagnose: ${d.diagnose || ""}`)
            .text(`Beschreibung: ${d.beschreibung || ""}`)
            .moveDown();
        });
      } else {
        doc.fontSize(12).text("Keine Diagnosen gefunden.").moveDown();
      }

      // === Ernährung ===
      doc.fontSize(14).text("Ernährung", { underline: true });
      doc.moveDown(0.5);
      if (nutrition.length > 0) {
        nutrition.forEach((n) => {
          doc
            .fontSize(12)
            .text(`Name: ${n.name || ""}`)
            .text(`Menge: ${n.amount || ""}`)
            .text(`Kalorien: ${n.calories || ""}`)
            .text(`Zeit: ${n.time || ""}`)
            .text(`Typ: ${n.type || ""}`)
            .moveDown();
        });
      } else {
        doc.fontSize(12).text("Keine Mahlzeitdaten gefunden.").moveDown();
      }

      // === Pied de page ===
      doc.moveDown(2);
      doc.fontSize(12).text("Danke, dass Sie HealthHome verwenden!", { align: "center" });

      // Fin du document
      doc.end();

      // Gestion des événements d’écriture
      stream.on("finish", () => {
        console.log("📄 PDF fertig erstellt:", filePath);
        resolve();
      });
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

// ======================================================
// 📤 Route POST : Envoi de l’e-mail au médecin
// ======================================================

router.post("/send-data", async (req, res) => {
  console.log("📩 Requête reçue sur /api/send-data !");
  try {
    const { userId, doctorEmail, format } = req.body;

    // --- Vérification des champs requis ---
    if (!userId || !doctorEmail) {
      return res.status(400).send("⚠️ Données manquantes.");
    }

    // --- Récupération des infos utilisateur ---
    const [userRows] = await db
      .promise()
      .query(
        "SELECT id, vorname, nachname, email, alter_jahre, geschlecht, gewicht, groesse, allergien, kommentar_aerzte FROM users WHERE id = ?",
        [userId]
      );
    if (userRows.length === 0) return res.status(404).send("❌ Benutzer nicht gefunden.");
    const user = userRows[0];

    // --- Récupération de toutes les données liées ---
    const [vitals] = await db.promise().query("SELECT * FROM vitalwerte WHERE users_id = ?", [userId]);
    const [meds] = await db.promise().query("SELECT * FROM medikamente WHERE user_id = ?", [userId]);
    const [vaccines] = await db.promise().query("SELECT * FROM vaccinations WHERE user_id = ?", [userId]);
    const [appointments] = await db.promise().query("SELECT * FROM termin WHERE user_id = ?", [userId]);
    const [diagnoses] = await db.promise().query("SELECT * FROM diagnoses WHERE user_id = ?", [userId]);
    const [nutrition] = await db.promise().query("SELECT * FROM nutrition WHERE user_id = ?", [userId]);

    // --- Création du dossier temporaire ---
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const fileName = `HealthData_${userId}.${format}`;
    const filePath = path.join(tempDir, fileName);

    // --- Génération du fichier selon le format ---
    if (format === "pdf") {
      await generatePDF(filePath, user, vitals, meds, vaccines, appointments, nutrition, diagnoses);
    } else if (format === "csv") {
      const parser = new Parser();
      const csv = parser.parse({ user, vitals, meds, vaccines, appointments, nutrition, diagnoses });
      fs.writeFileSync(filePath, csv, "utf8");
    } else {
      return res.status(400).send("❌ Format non supporté.");
    }

    // --- Envoi du mail ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: `"HealthHome" <${process.env.EMAIL_USER}>`,
      to: doctorEmail,
      subject: "📄 Gesundheitsdaten des Patienten - HealthHome",
      text: `Guten Tag,\n\nim Anhang finden Sie die Gesundheitsdaten des Patienten ${user.vorname} ${user.nachname}.\n\nMit freundlichen Grüßen,\nIhr HealthHome-Team`,
      attachments: [{ filename: fileName, path: filePath }],
    };

    await transporter.sendMail(mailOptions);
    fs.unlinkSync(filePath); // Supprime le fichier temporaire

    console.log("✅ E-Mail erfolgreich gesendet an:", doctorEmail);
    res.json({ success: true, message: "📤 E-Mail wurde erfolgreich gesendet!" });
  } catch (err) {
    console.error("❌ Fehler beim E-Mail-Versand:", err);
    res.status(500).json({
      success: false,
      message: "❌ Fehler beim Senden der E-Mail.",
      error: err.message,
    });
  }
});

// ======================================================
// 🧩 Export du router
// ======================================================
module.exports = router;
