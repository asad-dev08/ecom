import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image file to the server
 * @param {Object} file - The file object from multer
 * @param {String} folder - The subfolder to store the image in (e.g., 'banners', 'products')
 * @returns {Promise<String>} - The path to the uploaded image
 */
export const uploadImage = async (file, folder) => {
  try {
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'upload', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    await fs.writeFile(filePath, file.buffer);

    // Return the relative path to be stored in database
    return `/upload/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Deletes an image file from the server
 * @param {String} imagePath - The path to the image file
 * @returns {Promise<void>}
 */
export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) return;

    const fullPath = path.join(process.cwd(), imagePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error if file doesn't exist
    if (error.code !== 'ENOENT') {
      throw new Error('Failed to delete image');
    }
  }
}; 