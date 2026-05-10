const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const baseDir = path.join(__dirname, '..', 'uploads');
    const folder = file.fieldname === 'resume' ? 'resumes' : 'avatars';
    const uploadPath = path.join(baseDir, folder);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + '-' + Date.now() + ext;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const avatarTypes = ['.png', '.jpg', '.jpeg', '.webp'];
  const resumeTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'avatar' && avatarTypes.includes(ext)) {
    return cb(null, true);
  }
  if (file.fieldname === 'resume' && resumeTypes.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Unsupported file type'), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
