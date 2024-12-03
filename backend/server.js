const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/books.routes');
const userRoutes = require('./routes/user');
const app = express();
const path = require('path');

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à la base de données MongoDB
mongoose
  .connect(
    'mongodb+srv://ZerkaTritek:HP123456@cluster0.teep7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((err) => console.log('Erreur de connexion à MongoDB:', err));

// Utilisation des routes définies dans book.routes.js
app.use('/', bookRoutes);
app.use('/api/auth', userRoutes);
// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
