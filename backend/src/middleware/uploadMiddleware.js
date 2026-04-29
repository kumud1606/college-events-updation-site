import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDirectory = path.resolve(process.cwd(), "uploads");

function ensureUploadsDirectory() {
  if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination(_request, _file, callback) {
    ensureUploadsDirectory();
    callback(null, uploadsDirectory);
  },
  filename(_request, file, callback) {
    const extension = path.extname(file.originalname || "");
    const baseName = path
      .basename(file.originalname || "upload", extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 60);

    callback(null, `${Date.now()}-${baseName || "media"}${extension}`);
  }
});

function fileFilter(_request, file, callback) {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    callback(null, true);
    return;
  }

  callback(new Error("Only image and video uploads are supported."));
}

export const uploadSingleMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024
  }
}).single("media");
