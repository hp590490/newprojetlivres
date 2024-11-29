const express = require("express");
const { setBooks, getBooks } = require("../controllers/book.controller");
const router = express.Router();

router.get("/", getBooks);

router.post("/", setBooks);

router.put("/:id", (req, res) => {
  res.json({ messageId: req.params.id });
});

router.delete("/:id", (req, res) => {
  res.json({ message: "Livre supprimé id : " + req.params.id });
});

module.exports = router;
