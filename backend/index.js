const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


// Connexion MySQL locale (WAMP)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Idrelle-21',
  database: 'software'
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

app.listen(4000), () => {
  console.log('Backend démarré sur http://localhost:4000');
}