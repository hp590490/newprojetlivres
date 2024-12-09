const express = require('express');
const auth = require('../middleware/auth');
const { upload, resizeImage } = require('../middleware/multer');

const {
  setBook,
  getBooks,
  editBook,
  getBook,
  deleteBook,
  ratingBook,
  getBestsBooks,
} = require('../controllers/book.controller');
const router = express.Router();

router.get('/api/books', getBooks);
router.get('/api/books/bestrating', getBestsBooks);
router.get('/api/books/:id', getBook);

router.post('/api/books', upload.single('image'), resizeImage, setBook);

router.post('/api/books/:id/rating', auth, ratingBook);

router.put('/api/books/:id', auth, editBook);

router.delete('/api/books/:id', deleteBook);

module.exports = router;
