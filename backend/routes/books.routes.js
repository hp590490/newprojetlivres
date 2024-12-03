const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');

const {
  setBook,
  getBooks,
  editBook,
  getBook,
  deleteBook,
} = require('../controllers/book.controller');
const router = express.Router();

router.get('/api/books', getBooks);
router.get('/api/books/:id', getBook);
router.post('/api/books', auth, upload.single('image'), setBook);

router.put('/api/books/:id', auth, editBook);
router.delete('/:id', deleteBook);

module.exports = router;
