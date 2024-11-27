const express = require("express");
const port = 3000;

const app = express();

//Middleware qui permet de traiter les données de la request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/books", require("./routes/books.routes"));
//Lancer le serveur
app.listen(port, () => console.log("Le port du serveur est le port " + port));
