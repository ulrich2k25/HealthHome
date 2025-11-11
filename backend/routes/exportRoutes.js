// ======================================================
// 📦 exportRoutes.js — Exportation PDF & CSV des données utilisateur
// ======================================================

require("dotenv").config(); // Charge les variables d’environnement depuis .env
const express = require("express");
const mysql = require("mysql2");
const { Parser } = require("json2csv"); // Conversion JSON → CSV
const PDFDocument = require("pdfkit"); // Génération de fichiers PDF

// Création du routeur Express (mini API)
const router = express.Router();

// ======================================================
// 🔗 Connexion à la base MySQL
// ======================================================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// ======================================================
// 🧾 Fonction utilitaire pour générer le PDF complet
// ======================================================
function generateFullPDF(res, user, vitals, meds, vaccines, appointments, nutrition, diagnoses) {
  // Création du document PDF
  const doc = new PDFDocument({ margin: 50 });

  // Préparation de la réponse HTTP : type de fichier et nom
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=Gesundheitsdaten_${user.vorname}.pdf`);

  // On relie le flux de sortie du PDF à la réponse HTTP
  doc.pipe(res);

  // --- TITRE ---
  doc.fontSize(20).text("Gesundheitsdaten – HealthHome", { align: "center" });
  doc.moveDown(2);

  // --- Informations du patient ---
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
    .text(`Kommentare für Ärzte: ${user.kommentar_aerzte || ""}`)
    
    .moveDown(1.5);

  // --- Vitalwerte ---
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

  // --- Medikamente ---
  doc.fontSize(14).text("Medikamente", { underline: true });
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

  // --- Impfungen ---
  doc.fontSize(14).text("Impfungen", { underline: true });
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

  // --- Termine ---
  doc.fontSize(14).text("Termine", { underline: true });
  doc.moveDown(0.5);
  if (appointments.length > 0) {
    appointments.forEach((t) => {
      doc
        .fontSize(12)
        .text(`Datum: ${t.datum || ""}`)
        .text(`Uhrzeit: ${t.uhrzeit || ""}`)
        .text(`Titel/Beschreibung: ${t.titel || t.beschreibung || ""}`)
        .moveDown();
    });
  } else {
    doc.fontSize(12).text("Keine Termine gefunden.").moveDown();
  }

  // --- Mahlzeiten ---
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

  // --- Diagnosen ---
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

  // --- Pied de page ---
  doc.moveDown(2);
  doc.fontSize(12).text("Danke, dass Sie HealthHome verwenden!", { align: "center" });

  // On clôture et envoie le PDF
  doc.end();
}

// ======================================================
// 📤 ROUTE : Export CSV
// ======================================================
router.get("/export/csv", async (req, res) => {
  const userId = req.query.id;
  if (!userId) return res.status(400).send("ID utilisateur manquant.");

  try {
    // --- Lecture des données utilisateur ---
    const [userRows] = await db
      .promise()
      .query("SELECT id, vorname, nachname, email, alter_jahre, geschlecht, gewicht, groesse, allergien, kommentar_aerzte  FROM users WHERE id = ?", [userId]);
    if (userRows.length === 0) return res.status(404).send("Utilisateur non trouvé.");

    const user = userRows[0];

    // --- Lecture des autres tables ---
    const [vitals] = await db.promise().query("SELECT * FROM vitalwerte WHERE users_id = ?", [userId]);
    const [meds] = await db.promise().query("SELECT * FROM medikamente WHERE user_id = ?", [userId]);
    const [vaccines] = await db.promise().query("SELECT * FROM vaccinations WHERE user_id = ?", [userId]);
    const [appointments] = await db.promise().query("SELECT * FROM termin WHERE user_id = ?", [userId]);
    const [nutrition] = await db.promise().query("SELECT * FROM nutrition WHERE user_id = ?", [userId]);
    const [diagnoses] = await db.promise().query("SELECT * FROM diagnoses WHERE user_id = ?", [userId]);

    // --- Organisation du CSV ---
    const data = {
      Benutzer: user,
      Vitalwerte: vitals,
      Medikamente: meds,
      Impfungen: vaccines,
      Termine: appointments,
      Ernährung: nutrition,
      Diagnosen: diagnoses,
    };

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`Gesundheitsdaten_${user.vorname}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("Erreur export CSV:", err);
    res.status(500).send("Fehler beim Erstellen der CSV-Datei.");
  }
});

// ======================================================
// 📄 ROUTE : Export PDF
// ======================================================
router.get("/export/pdf", async (req, res) => {
  const userId = req.query.id;
  if (!userId) return res.status(400).send("ID utilisateur manquant.");

  try {
    // --- Lecture des données utilisateur ---
    const [userRows] = await db
      .promise()
      .query("SELECT id, vorname, nachname, email, alter_jahre, geschlecht, gewicht, groesse, allergien, kommentar_aerzte  FROM users WHERE id = ?", [userId]);
    if (userRows.length === 0) return res.status(404).send("Utilisateur non trouvé.");

    const user = userRows[0];

    // --- Lecture des autres tables ---
    const [vitals] = await db.promise().query("SELECT * FROM vitalwerte WHERE users_id = ?", [userId]);
    const [meds] = await db.promise().query("SELECT * FROM medikamente WHERE user_id = ?", [userId]);
    const [vaccines] = await db.promise().query("SELECT * FROM vaccinations WHERE user_id = ?", [userId]);
    const [appointments] = await db.promise().query("SELECT * FROM termin WHERE user_id = ?", [userId]);
    const [nutrition] = await db.promise().query("SELECT * FROM nutrition WHERE user_id = ?", [userId]);
    const [diagnoses] = await db.promise().query("SELECT * FROM diagnoses WHERE user_id = ?", [userId]);

    // --- Génération du PDF complet ---
    generateFullPDF(res, user, vitals, meds, vaccines, appointments, nutrition, diagnoses);
  } catch (err) {
    console.error("Erreur export PDF:", err);
    res.status(500).send("Fehler beim Erstellen der PDF-Datei.");
  }
});

// ======================================================
// 🧩 EXPORT DU ROUTER
// ======================================================
module.exports = router;
 