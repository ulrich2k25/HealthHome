// ======================================================
// 📧 mailRoutes.js — Envoi de PDF ou CSV par e-mail
// ======================================================

require("dotenv").config(); // Pour lire le fichier .env
const express = require("express");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

// Création du "router" Express (mini API)
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
function generatePDF(user, vitals, meds, vaccines, appointments, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // === TITRE ===
      doc.fontSize(20).text("Gesundheitsdaten – HealthHome", { align: "center" });
      doc.moveDown(2);

      // === Infos du patient ===
      doc.fontSize(14).text("👤 Patientendaten", { underline: true });
      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .text(`Vorname: ${user.vorname}`)
        .text(`Nachname: ${user.nachname}`)
        .text(`E-Mail: ${user.email}`)
        .text(`Konto erstellt am: ${user.created_at}`)
        .text(`Verifiziert: ${user.verified ? "Ja" : "Nein"}`);
      doc.moveDown(1.5);

      // === Vitalwerte ===
      doc.fontSize(14).text("💓 Vitalwerte", { underline: true });
      doc.moveDown(0.5);
      if (vitals.length > 0) {
        vitals.forEach((v) => {
          doc
            .fontSize(12)
            .text(`Datum: ${v.datum || v.date || ""}`)
            .text(`Blutdruck: ${v.blutdruck || ""}`)
            .text(`BPM: ${v.bpm || ""}`)
            .text(`Blutzucker: ${v.blutzucker || ""}`)
            .moveDown();
        });
      } else {
        doc.fontSize(12).text("Keine Vitaldaten gefunden.").moveDown();
      }

      // === Medikamente ===
      doc.fontSize(14).text("💊 Medikamente", { underline: true });
      doc.moveDown(0.5);
      if (meds.length > 0) {
        meds.forEach((m) => {
          doc
            .fontSize(12)
            .text(`Name: ${m.name || m.medikament || ""}`)
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
      doc.fontSize(14).text("💉 Impfungen", { underline: true });
      doc.moveDown(0.5);
      if (vaccines.length > 0) {
        vaccines.forEach((v) => {
          doc
            .fontSize(12)
            .text(`Impfstoff: ${v.name || v.impfung || ""}`)
            .text(`Datum: ${v.datum || ""}`)
            .text(`Arzt: ${v.arzt || ""}`)
            .moveDown();
        });
      } else {
        doc.fontSize(12).text("Keine Impfungen gefunden.").moveDown();
      }

      // === Termine ===
      doc.fontSize(14).text("📅 Termine", { underline: true });
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

      doc.moveDown(2);
      doc
        .fontSize(12)
        .text("💚 Danke, dass Sie HealthHome verwenden!", { align: "center" });

      // Fin du doc
      doc.end();

      // Quand l’écriture du fichier est terminée
      stream.on("finish", () => {
        console.log("📄 PDF fertig erstellt:", filePath);
        resolve();
      });

      // En cas d’erreur d’écriture
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

    if (!userId || !doctorEmail) {
      return res.status(400).send("⚠️ Données manquantes.");
    }

    // --- Récupération des données principales du patient ---
    const [userRows] = await db
      .promise()
      .query(
        "SELECT id, vorname, nachname, email, created_at, verified FROM users WHERE id = ?",
        [userId]
      );

    if (userRows.length === 0) {
      return res.status(404).send("❌ Benutzer nicht gefunden.");
    }
    const user = userRows[0];

    // --- Récupération des données associées ---
    const [vitals] = await db
      .promise()
      .query("SELECT * FROM vitalwerte");

    const [meds] = await db
      .promise()
      .query("SELECT * FROM medikamente");

    const [vaccines] = await db
      .promise()
      .query("SELECT * FROM vaccinations");

    const [appointments] = await db
      .promise()
      .query("SELECT * FROM termin");

    // --- Dossier temporaire ---
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log("🗂️ Dossier 'temp' créé :", tempDir);
    }

    const fileName = `HealthData_${userId}.${format}`;
    const filePath = path.join(tempDir, fileName);

    // --- Génération du fichier selon le format ---
    if (format === "pdf") {
      await generatePDF(user, vitals, meds, vaccines, appointments, filePath);
    } else if (format === "csv") {
      // Ici on sérialise plusieurs sections en CSV
      const parser = new Parser();
      const csv = parser.parse({
        user,
        vitals,
        meds,
        vaccines,
        appointments,
      });
      fs.writeFileSync(filePath, csv, "utf8");
    } else {
      return res.status(400).send("❌ Format non supporté.");
    }

    // ======================================================
    // 📬 Envoi de l’e-mail avec le fichier en PJ
    // ======================================================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HealthHome" <${process.env.EMAIL_USER}>`,
      to: doctorEmail,
      subject: "📄 Gesundheitsdaten des Patienten - HealthHome",
      text: `Guten Tag,\n\nim Anhang finden Sie die Gesundheitsdaten des Patienten ${user.vorname} ${user.nachname}.\n\nMit freundlichen Grüßen,\nIhr HealthHome-Team`,
      attachments: [{ filename: fileName, path: filePath }],
    };

    await transporter.sendMail(mailOptions);

    // On supprime le fichier temporaire
    fs.unlinkSync(filePath);

    console.log("✅ E-Mail erfolgreich gesendet an:", doctorEmail);
    res.json({
      success: true,
      message: "📤 E-Mail wurde erfolgreich gesendet!",
    });
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
