const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

exports.uploadFile = async (file) => {
    try {
        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Write file to uploads directory
        await fs.promises.writeFile(filePath, file.buffer);

        // Return the relative path
        return `/uploads/${fileName}`;
    } catch (error) {
        throw new Error('Error uploading file: ' + error.message);
    }
};

exports.getFilePath = (relativePath) => {
    if (!relativePath) return null;
    return path.join(__dirname, '..', relativePath);
};

exports.deleteFile = async (relativePath) => {
    try {
        const fullPath = path.join(__dirname, '..', relativePath);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};