const BookModel = require('../models/books.model');
const mongoose = require('mongoose');
const upload = require('../middleware/multer');

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
