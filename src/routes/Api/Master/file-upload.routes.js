import express from 'express';
const router = express.Router();
import { 
  uploadSingleFileHandler,
  uploadMultipleFilesHandler,
  getFileUploadById,
  getAllFiles,
  updateFileUpload,
  deleteFileUpload,
  getFileUrlHandler,
  listS3Files,
  getPresignedUrl
} from '../../../controller/file-upload.controller.js';
import { uploadSingleFile, uploadMultipleFiles } from '../../../utils/s3.utils.js';
import auth from '../../../middleware/auth.middleware.js';

// Upload single file 2025-07-29
router.post('/single', auth, uploadSingleFile('file'), uploadSingleFileHandler);

// Upload multiple files 2025-07-29
router.post('/multiple', auth, uploadMultipleFiles('files', 5), uploadMultipleFilesHandler);

// Get file by ID 2025-07-29
router.get('/:id', auth, getFileUploadById);

// Get all files 2025-07-29
router.get('/', auth, getAllFiles);

// Update file 2025-07-29
router.put('/', auth, updateFileUpload);

// Delete file 2025-07-29
router.delete('/:id', auth, deleteFileUpload);

// Get presigned URL for file 2025-07-29
router.get('/presigned-url/:id', auth, getPresignedUrl);

// List files in S3 folder 2025-07-29
router.get('/s3-files', auth, listS3Files);

export default router; 