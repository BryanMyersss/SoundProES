const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

const storage = new GridFsStorage({
    url: process.env.DB,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
          throw new Error('Invalid file type');
        }

        return {
            bucketName: "photos",
            filename: `${Date.now()}-${file.originalname}`,
        };
    },
});

const upload = multer({
  storage,
  limits: {
      fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
  }
});

module.exports = upload;
