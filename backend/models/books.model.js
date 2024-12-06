const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  userId: String,
  title: String,
  author: String,
  imageUrl: String,
  originalImageUrl: String,
  year: Number,
  genre: String,
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      grade: { type: Number, required: true },
    },
  ],
  averageRating: { type: Number, default: 0 },
});

module.exports = mongoose.model('book', bookSchema);
