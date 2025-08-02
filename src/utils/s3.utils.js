import AWS from 'aws-sdk';
import Busboy from 'connect-busboy';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Readable } from 'stream';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Generate unique filename
const generateUniqueFileName = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  const nameWithoutExt = path.basename(originalname, extension);
  return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
};

// Check if file type is allowed
const isAllowedFileType = (mimeType) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];
  return allowedTypes.includes(mimeType);
};

// Upload file to S3
const uploadFileToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read' // Make file publicly accessible
    };

    const result = await s3.upload(params).promise();
    return { success: true, result };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return { success: false, error: error.message };
  }
};

// Upload single file middleware
const uploadSingleFile = (fieldName, folder = 'uploads') => {
  return (req, res, next) => {
    // Configure busboy
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1
      }
    });

    let fileUploaded = false;
    let uploadError = null;

    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname !== fieldName) {
        file.resume(); // Skip this file
        return;
      }

      if (!filename) {
        uploadError = 'No file provided';
        return;
      }

      if (!isAllowedFileType(mimetype)) {
        uploadError = 'Invalid file type. Only images, documents, and archives are allowed.';
        file.resume();
        return;
      }

      try {
        // Read file buffer
        const chunks = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', async () => {
          const fileBuffer = Buffer.concat(chunks);
          const uniqueFileName = generateUniqueFileName(filename);
          const s3FileName = `${folder}/${uniqueFileName}`;

          // Upload to S3
          const uploadResult = await uploadFileToS3(fileBuffer, s3FileName, mimetype);

          if (uploadResult.success) {
            req.uploadedFile = {
              originalName: filename,
              fileName: s3FileName,
              fileSize: fileBuffer.length,
              mimeType: mimetype,
              location: uploadResult.result.Location,
              bucket: uploadResult.result.Bucket
            };
            fileUploaded = true;
          } else {
            uploadError = uploadResult.error;
          }
        });

        file.on('error', (err) => {
          uploadError = err.message;
        });

      } catch (error) {
        uploadError = error.message;
      }
    });

    busboy.on('field', (fieldname, val) => {
      req.body = req.body || {};
      req.body[fieldname] = val;
    });

    busboy.on('finish', () => {
      if (uploadError) {
        return res.status(400).json({
          success: false,
          message: uploadError
        });
      }

      if (!fileUploaded) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      next();
    });

    busboy.on('error', (err) => {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    });

    req.pipe(busboy);
  };
};

// Upload multiple files middleware
const uploadMultipleFiles = (fieldName, maxCount = 5, folder = 'uploads') => {
  return (req, res, next) => {
    // Configure busboy
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: maxCount
      }
    });

    const uploadedFiles = [];
    let uploadError = null;
    let fileCount = 0;

    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname !== fieldName) {
        file.resume(); // Skip this file
        return;
      }

      if (!filename) {
        uploadError = 'No file provided';
        return;
      }

      if (fileCount >= maxCount) {
        file.resume(); // Skip if max count reached
        return;
      }

      if (!isAllowedFileType(mimetype)) {
        uploadError = 'Invalid file type. Only images, documents, and archives are allowed.';
        file.resume();
        return;
      }

      try {
        // Read file buffer
        const chunks = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', async () => {
          const fileBuffer = Buffer.concat(chunks);
          const uniqueFileName = generateUniqueFileName(filename);
          const s3FileName = `${folder}/${uniqueFileName}`;

          // Upload to S3
          const uploadResult = await uploadFileToS3(fileBuffer, s3FileName, mimetype);

          if (uploadResult.success) {
            uploadedFiles.push({
              originalName: filename,
              fileName: s3FileName,
              fileSize: fileBuffer.length,
              mimeType: mimetype,
              location: uploadResult.result.Location,
              bucket: uploadResult.result.Bucket
            });
            fileCount++;
          } else {
            uploadError = uploadResult.error;
          }
        });

        file.on('error', (err) => {
          uploadError = err.message;
        });

      } catch (error) {
        uploadError = error.message;
      }
    });

    busboy.on('field', (fieldname, val) => {
      req.body = req.body || {};
      req.body[fieldname] = val;
    });

    busboy.on('finish', () => {
      if (uploadError) {
        return res.status(400).json({
          success: false,
          message: uploadError
        });
      }

      if (uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      req.uploadedFiles = uploadedFiles;
      next();
    });

    busboy.on('error', (err) => {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    });

    req.pipe(busboy);
  };
};

// Delete file from S3
const deleteFileFromS3 = async (fileName) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName
    };

    const result = await s3.deleteObject(params).promise();
    return { success: true, result };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return { success: false, error: error.message };
  }
};

// Get file URL (presigned URL for private files)
const getFileUrl = async (fileName, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return { success: true, url };
  } catch (error) {
    console.error('Error generating file URL:', error);
    return { success: false, error: error.message };
  }
};

// List files in a folder
const listFilesInFolder = async (folder = 'uploads', maxKeys = 100) => {
  try {
    const params = {
      Bucket: bucketName,
      Prefix: folder + '/',
      MaxKeys: maxKeys
    };

    const result = await s3.listObjectsV2(params).promise();
    return { success: true, files: result.Contents || [] };
  } catch (error) {
    console.error('Error listing files:', error);
    return { success: false, error: error.message };
  }
};

// Check if file exists
const fileExists = async (fileName) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName
    };

    await s3.headObject(params).promise();
    return { success: true, exists: true };
  } catch (error) {
    if (error.code === 'NotFound') {
      return { success: true, exists: false };
    }
    return { success: false, error: error.message };
  }
};

export {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFileFromS3,
  getFileUrl,
  listFilesInFolder,
  fileExists,
  generateUniqueFileName,
  s3,
  bucketName
}; 