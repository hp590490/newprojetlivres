const BookModel = require('../models/books.model');
const mongoose = require('mongoose');
const upload = require('../middleware/multer');
const booksModel = require('../models/books.model');

module.exports.getBooks = async (req, res) => {
  try {
    const books = await BookModel.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error.message);
    res
      .status(500)
      .json({ message: 'Erreur lors de la récupération des livres.' });
  }
};
module.exports.getBook = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID non valide pour un livre.' });
  }

  try {
    const book = await BookModel.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé.' });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de la récupération du livre :', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports.getBestsBooks = async (req, res) => {
  try {
    // Récupérer les 3 meilleurs livres selon leur averageRating
    const bestBooks = await BookModel.find()
      .sort({ averageRating: -1 }) // Trier par averageRating décroissant
      .limit(3); // Limiter à 3 résultats

    // Retourner les livres
    res.status(200).json(bestBooks);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des meilleurs livres.',
    });
  }
};
module.exports.setBook = async (req, res) => {
  try {
    // Extraire les données JSON du champ 'book' et les parser
    const bookData = JSON.parse(req.body.book);

    // Récupérer les données du fichier image (si existant)
    let imageUrl = '';
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${
        req.file.filename
      }`;
    }

    // Ajouter l'URL de l'image aux données du livre
    bookData.imageUrl = imageUrl;

    // Création du nouveau livre dans la base de données
    const newBook = new BookModel(bookData);

    // Sauvegarde dans la base de données
    await newBook.save();

    res.status(201).json({
      message: 'Livre ajouté avec succès !',
      imageUrl,
    });
  } catch (error) {
    console.error('Erreur lors de l’ajout du livre :', error.message);
    res
      .status(400)
      .json({ message: 'Erreur lors de l’ajout du livre.', error });
  }
};
module.exports.editBook = async (req, res) => {
  const book = await BookModel.findById(req.params.id);

  if (!book) {
    res.status(403).json({ message: 'Requête non autorisée' });
  }
  const updateBook = await BookModel.findByIdAndUpdate(book, req.body, {
    new: true,
  });
  res.status(200).json({ updateBook });
};

module.exports.deleteBook = async (req, res) => {
  const book = await BookModel.findById(req.params.id);
  if (!book) {
    res.status(400).json({ message: "Ce livre n'existe pas !" });
  }
  await book.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Livre supprimé ' + book });
};

module.exports.ratingBook = async (req, res) => {
  try {
    // Récupérer les données de la requête (userId et rating)
    const { userId, rating } = req.body;

    // Vérifier que la note est comprise entre 0 et 5
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: 'La note doit être comprise entre 0 et 5.' });
    }

    // Vérifier que le userId est valide
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId invalide.' });
    }

    // Récupérer le livre par son ID
    const book = await BookModel.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé.' });
    }

    // Debug : Vérification de la structure des ratings
    console.log('Ratings du livre :', book.ratings);

    // Vérifier si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find((rating) => {
      console.log('Vérification rating.userId :', rating.userId);
      return rating.userId && rating.userId.toString() === userId.toString();
    });

    if (existingRating) {
      // Si la note existe déjà, on ne permet pas de la modifier
      return res.status(403).json({ message: 'Vous avez déjà noté ce livre.' });
    }

    // Ajouter la note dans le tableau ratings
    book.ratings.push({
      userId: new mongoose.Types.ObjectId(userId),
      grade: rating,
    });

    // Calcul de la nouvelle moyenne
    const totalRatings = book.ratings.reduce(
      (sum, rating) => sum + rating.grade,
      0
    );
    const averageRating = (totalRatings / book.ratings.length).toFixed(1);

    // Mettre à jour la moyenne du livre
    book.averageRating = averageRating;

    // Sauvegarder les modifications dans la base de données
    await book.save();

    // Répondre avec le livre mis à jour
    return res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des ratings :', error.message);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
