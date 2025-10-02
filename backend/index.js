
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Route test
app.get('/', (req, res) => {
  res.send('✅ API HealthHome fonctionne');
});

app.listen(4000, () => {
  console.log('Backend démarré sur http://localhost:4000');
});