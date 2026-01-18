const express = require("express");
const router = express.Router();
const multer = require("multer");
const ImageKit = require("imagekit");
require("dotenv").config();

// ImageKit Configuration
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Configure storage (Memory for direct upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const response = await imagekit.upload({
      file: req.file.buffer, // required
      fileName: req.file.originalname, // required
      folder: "family-chat",
    });

    // Return the URL from ImageKit
    res.json({ filePath: response.url });
  } catch (error) {
    console.error("ImageKit upload failed", error);
    res.status(500).json({ message: "File upload failed" });
  }
});

module.exports = router;
