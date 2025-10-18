# 🏥 HealthHome – Intelligente App für Gesundheitsbetreuung zu Hause

HealthHome ist eine Web- und Mobile-App, die es Nutzerinnen und Nutzern ermöglicht, ihre Gesundheit von zu Hause aus zu verwalten.  
Die Anwendung bündelt mehrere Funktionen in einer zentralen Plattform: Verwaltung von Gesundheitsprofilen, Erinnerungen zur Medikamenteneinnahme, Dokumentation von Vitalwerten, ein Gesundheitskalender sowie der sichere Datenaustausch mit Ärztinnen und Ärzten.  

---

## 🚀 Hauptfunktionen
- ✅ Benutzerprofil: Anlegen und Bearbeiten persönlicher Gesundheitsdaten (Alter, Gewicht, Allergien, Vorerkrankungen usw.)  
- ✅ Verwaltung von Medikamenten mit automatischen Erinnerungen  
- ✅ Dokumentation von Vitalwerten (Blutdruck, Blutzucker, Gewicht, Puls usw.)  
- ✅ Terminplaner für Arztbesuche, Vorsorgeuntersuchungen und Impfungen  
- ✅ Push-Benachrichtigungen für wichtige Erinnerungen (Medikamente, Bewegung, Termine)  
- ✅ Datenexport als PDF oder CSV für Ärztinnen und Ärzte  
- 🔄 Automatisches Cloud-Backup und Wiederherstellung (geplant)  
- 👨‍👩‍👧 Familien- und Pflegemodus zur Verwaltung mehrerer Profile (optional, geplant)  
- ⌚ Integration von Wearables oder Smart-Home-Geräten (optional, geplant)  

---

## 🛠️ Verwendete Technologien
- **Frontend**: [Next.js](https://nextjs.org/) mit React, TypeScript und TailwindCSS  
- **Backend**: [Node.js](https://nodejs.org/) mit [Express](https://expressjs.com/)  
- **Datenbank**: MongoDB (geplant) oder Firebase (optional)  
- **Versionsverwaltung**: Git und GitHub  

---

## 📂 Projektstruktur

---

HealthHome/
│── frontend/ → Next.js App (Benutzeroberfläche)
│── backend/ → Node.js/Express API (Datenverwaltung)

## ⚙️ Installation & Start

### 1️⃣ Repository klonen
```bash
git clone https://github.com/ulrich2k25/HealthHome.git
cd HealthHome

2️⃣ Frontend starten
cd frontend
npm install
npm run dev

➡️ Anwendung öffnen unter: http://localhost:3001

3️⃣ Backend starten
cd ../backend
npm install
node index.js

➡️ API erreichbar unter: http://localhost:4000

👥 Team

Das Projekt wird als gemeinschaftliche Arbeit im Team entwickelt.
Alle Mitglieder tragen Verantwortung und beteiligen sich am Fortschritt.

📌 Roadmap

 Projektinitialisierung (Frontend + Backend)

 Modul Benutzerprofil implementieren

 Modul Medikamentenverwaltung hinzufügen

 Gesundheitskalender integrieren

 Datenexport einbauen

 Cloud-Backup und Multi-Profile (optional)