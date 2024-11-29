const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/books.routes'); // Importer les routes

const app = express();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Connexion à la base de données MongoDB
mongoose
  .connect(
    'mongodb+srv://ZerkaTritek:HP123456@cluster0.teep7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((err) => console.log('Erreur de connexion à MongoDB:', err));

// Utilisation des routes définies dans book.routes.js
app.use('/api/books', bookRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
