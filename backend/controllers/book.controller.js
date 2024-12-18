const BookModel = require('../models/books.model');
const mongoose = require('mongoose');

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
    res.status(200).json({
      ...book.toObject(),
      imageUrl: book.originalImageUrl || book.imageUrl, // priorité à l'image originale
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du livre :', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports.getBestsBooks = async (req, res) => {
  try {
    // récupère les 3 meilleurs livres selon leur averageRating
    const bestBooks = await BookModel.find()
      .sort({ averageRating: -1 }) // Trier par averageRating décroissant
      .limit(3); // Limiter à 3 résultats

    res.status(200).json(bestBooks);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la récupération des meilleurs livres.',
    });
  }
};
module.exports.setBook = async (req, res) => {
  try {
    // extraire les données JSON du champ 'book' et les parser
    const bookData = JSON.parse(req.body.book);

    // vérification des champs du formulaire
    const requiredFields = ['title', 'author', 'year', 'genre'];
    const missingFields = requiredFields.filter((field) => !bookData[field]); // on vérifie pour les champs s'il y en a un manquant, si oui il est ajouté à missingFields et donc un message d'erreur est renvoyé

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Les champs suivants sont obligatoires : ${missingFields.join(
          ', '
        )}.`,
      });
    }

    // vérification de l'image uploadée
    if (!req.file) {
      return res.status(400).json({
        message: 'Une image est obligatoire.',
      });
    }

    const originalImageUrl = `${req.protocol}://${req.get('host')}/uploads/${
      req.file.filename
    }`;
    const resizedImageUrl = `${req.protocol}://${req.get(
      'host'
    )}/uploads/resized_${req.file.filename}`;

    bookData.imageUrl = resizedImageUrl;
    bookData.originalImageUrl = originalImageUrl;

    const newBook = new BookModel(bookData);
    await newBook.save();

    res.status(201).json({
      message: 'Livre ajouté avec succès !',
      book: newBook,
    });
  } catch (error) {
    console.error('Erreur lors de l’ajout du livre :', error.message);
    res.status(400).json({
      message: 'Erreur lors de l’ajout du livre.',
      error: error.message,
    });
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
  res
    .status(200)
    .json({ message: 'Le livre ' + updateBook + ' a bien été modifié' });
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
    // récupérer les données de la requête (userId et rating)
    const { userId, rating } = req.body;

    // vérifier que la note est comprise entre 0 et 5
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: 'La note doit être comprise entre 0 et 5.' });
    }

    // vérifier que le userId est valide
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId invalide.' });
    }

    // récupérer le livre par son ID
    const book = await BookModel.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé.' });
    }

    // vérifier si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find((rating) => {
      console.log('Vérification rating.userId :', rating.userId);
      return rating.userId && rating.userId.toString() === userId.toString();
    });

    if (existingRating) {
      return res.status(403).json({ message: 'Vous avez déjà noté ce livre.' });
    }

    // ajouter la note dans le tableau ratings
    book.ratings.push({
      userId: userId,
      grade: rating,
    });

    // calcul de la nouvelle moyenne
    const totalRatings = book.ratings.reduce(
      (acc, rating) => acc + rating.grade, // on parcoure l'élément rating, et au fur et à mesure c'est socké dans "acc" (accumulateur), 0 c'est la valeur initiale de "acc"
      0
    );
    const averageRating = (totalRatings / book.ratings.length).toFixed(1); // limite à un chiffre après la virgule

    // mettre à jour la moyenne du livre
    book.averageRating = averageRating;

    await book.save();

    // retourne le livre avec l'image originale car flou avec img resized
    return res.status(200).json({
      ...book.toObject(), // transormer en objet JS pour pouvoir modifier les champs, là par ex cest l'imageUrl
      imageUrl: book.originalImageUrl || book.imageUrl,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des ratings :', error.message);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
