const BookModel = require("../models/books.model");

module.exports.getBooks = async (req, res) => {
  try {
    const books = await BookModel.find();
    res.status(200).json(books);
  } catch (error) {
    console.error("Erreur lors de la récupération des livres:", error.message);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des livres." });
  }
};

module.exports.setBooks = async (req, res) => {
  try {
    const {
      userId,
      title,
      author,
      imageUrl,
      year,
      genre,
      ratings,
      averageRating,
    } = req.body;

    const newBook = new BookModel({
      userId,
      title,
      author,
      imageUrl,
      year,
      genre,
      ratings,
      averageRating,
    });

    await newBook.save();

    res.status(201).json({ message: "Livre ajouté avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'ajout du livre:", error.message);
    res.status(500).json({ message: "Erreur lors de l'ajout du livre." });
  }
};
