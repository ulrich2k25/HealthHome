// backend/routes/backupRoutes.js
const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = function (db) {
  const router = express.Router();
  const backupsDir = path.join(__dirname, "..", "backups");

  // assure le dossier backups existe
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

  // POST /api/backup  -> enregistre le backup (body JSON)
  router.post("/backup", (req, res) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `backup_${timestamp}.json`;
      const filepath = path.join(backupsDir, filename);
      fs.writeFileSync(filepath, JSON.stringify({ createdAt: new Date(), data: req.body }, null, 2), "utf-8");
      return res.status(201).json({ message: "Backup saved", file: filename });
    } catch (err) {
      console.error("Backup save error:", err);
      return res.status(500).json({ message: "Error saving backup" });
    }
  });

  // GET /api/backup/latest -> renvoie le dernier fichier backup
  router.get("/latest", (req, res) => {
    try {
      const files = fs.readdirSync(backupsDir).filter(f => f.endsWith(".json")).sort();
      if (files.length === 0) return res.status(404).json({ message: "No backups found" });
      const latest = files[files.length - 1];
      const content = fs.readFileSync(path.join(backupsDir, latest), "utf-8");
      return res.json({ file: latest, content: JSON.parse(content) });
    } catch (err) {
      console.error("Backup latest error:", err);
      return res.status(500).json({ message: "Error reading backups" });
    }
  });

  // (optionnel) GET /api/backup/list -> liste tous les backups
  router.get("/list", (req, res) => {
    try {
      const files = fs.readdirSync(backupsDir).filter(f => f.endsWith(".json")).sort();
      return res.json({ files });
    } catch (err) {
      console.error("Backup list error:", err);
      return res.status(500).json({ message: "Error listing backups" });
    }
  });

  return router;
};
