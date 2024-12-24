const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/books.routes');
const userRoutes = require('./routes/user.routes.');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({ origin: 'http://localhost:3000' }));
// Connexion à la base de données MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((err) => console.log('Erreur de connexion à MongoDB:', err));

// Utilisation des routes définies dans book.routes.js
app.use('/', bookRoutes);
app.use('/api/auth', userRoutes);
// Démarrage du serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
