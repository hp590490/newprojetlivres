const multer = require('multer');
const path = require('path'); // gérer les chemins de fichiers
const sharp = require('sharp'); // bibliothèque de redimension img
const fs = require('fs');
// lieu de stockage des img
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// middleware pour vérifier si ce sont bien des img (en fonction de leur extension) et leur donner des propriétés de taille et de poids par la suite
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Taille max de 2 MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées !'));
  },
});

// middleware pour redimensionner l'image après upload
const resizeImage = (req, res, next) => {
  // On vérifie si un fichier a été téléchargé
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path; // chemin dans lequel le fichier est stocké
  const fileName = req.file.filename;
  const outputFilePath = path.join('uploads', `resized_${fileName}`); // stocker les fichiers redimensionnés dans uploads

  sharp(filePath)
    .resize({ width: 206, height: 260 })
    .toFile(outputFilePath)
    .then(() => {
      // remplace le fichier original par le fichier redimensionné
      fs.unlink(filePath, () => {
        req.file.path = outputFilePath;
        next();
      });
    })
    .catch((error) => {
      console.log(error);
      return next();
    });
};

module.exports = { upload, resizeImage };
