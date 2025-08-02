import FileUpload from '../models/file-upload.model.js';
import { 
  deleteFileFromS3, 
  getFileUrl, 
  listFilesInFolder,
 
} from '../utils/s3.utils.js';
import AWS from 'aws-sdk';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Helper function to determine file type
const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('application/pdf') || mimeType.includes('document') || mimeType.includes('excel')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  return 'other';
};

// Upload single file handler
const uploadSingleFileHandler = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileData = new FileUpload({
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      file_url: req.file.location,
      file_key: req.file.key,
      status: true,
      created_by: userId
    });

    const savedFile = await fileData.save();

    // Populate the saved file with references
    const populatedFile = await FileUpload.findOne({ file_upload_id: savedFile.file_upload_id })
      
      ;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: populatedFile
    });
  } catch (error) {
    console.error('Upload single file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// Upload multiple files
const uploadMultipleFilesHandler = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { folder = 'uploads' } = req.body;

    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const fileDataArray = req.uploadedFiles.map(file => ({
      original_name: file.originalName,
      file_name: file.fileName,
      file_size: file.fileSize,
      mime_type: file.mimeType,
      file_url: file.location,
      bucket_name: file.bucket,
      folder: folder,
      file_type: getFileType(file.mimeType),
      created_by: userId
    }));

    const savedFiles = await FileUpload.insertMany(fileDataArray);

    const populatedFiles = await FileUpload.find({ _id: { $in: savedFiles.map(f => f._id) } })
      
      ;

    res.status(201).json({
      success: true,
      message: `${savedFiles.length} files uploaded successfully`,
      data: populatedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

// Get file upload by ID
const getFileUploadById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await FileUpload.findOne({ file_upload_id: id })
      
      ;
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File upload not found'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Error getting file upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file upload',
      error: error.message
    });
  }
};

// Get all files
const getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, file_type, folder } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Filter by file type if provided
    if (file_type) {
      query.file_type = file_type;
    }
    
    // Filter by folder if provided
    if (folder) {
      query.folder = folder;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { original_name: { $regex: search, $options: 'i' } },
        { file_name: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),

      sort: { created_at: -1 }
    };

    const files = await FileUpload.paginate(query, options);

    res.json({
      success: true,
      data: files.docs,
      pagination: {
        totalDocs: files.totalDocs,
        limit: files.limit,
        totalPages: files.totalPages,
        page: files.page,
        pagingCounter: files.pagingCounter,
        hasPrevPage: files.hasPrevPage,
        hasNextPage: files.hasNextPage,
        prevPage: files.prevPage,
        nextPage: files.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting files',
      error: error.message
    });
  }
};

// Update file upload
const updateFileUpload = async (req, res) => {
  try {
    const { id, file_name, file_type, file_size, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    const updateData = {
      file_name: file_name || undefined,
      file_type: file_type || undefined,
      file_size: file_size || undefined,
      status: status !== undefined ? status : undefined,
      updated_by: userId,
      updated_at: new Date()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedFile = await FileUpload.findOneAndUpdate(
      { file_upload_id: id },
      updateData,
      { new: true, runValidators: true }
    )
    
    ;

    if (!updatedFile) {
      return res.status(404).json({
        success: false,
        message: 'File upload not found'
      });
    }

    res.json({
      success: true,
      message: 'File upload updated successfully',
      data: updatedFile
    });
  } catch (error) {
    console.error('Update file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating file upload',
      error: error.message
    });
  }
};

// Delete file upload
const deleteFileUpload = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if file exists
    const file = await FileUpload.findOne({ file_upload_id: id });
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File upload not found'
      });
    }

    // Delete from S3
    try {
      await deleteFileFromS3(file.file_key);
    } catch (s3Error) {
      console.error('S3 delete error:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await FileUpload.findOneAndDelete({ file_upload_id: id });

    res.json({
      success: true,
      message: 'File upload deleted successfully'
    });
  } catch (error) {
    console.error('Delete file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file upload',
      error: error.message
    });
  }
};

// Get file URL (presigned URL)
const getFileUrlHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresIn = 3600 } = req.query;
    
    const file = await FileUpload.findOne({ file_upload_id: id });
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const urlResult = await getFileUrl(file.file_name, parseInt(expiresIn));
    
    if (!urlResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error generating file URL',
        error: urlResult.error
      });
    }

    res.json({
      success: true,
      data: {
        file: file,
        presignedUrl: urlResult.url,
        expiresIn: parseInt(expiresIn)
      }
    });
  } catch (error) {
    console.error('Error getting file URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file URL',
      error: error.message
    });
  }
};

// List files in S3 folder
const listS3Files = async (req, res) => {
  try {
    const { folder = 'uploads', maxKeys = 100 } = req.query;
    
    const result = await listFilesInFolder(folder, parseInt(maxKeys));
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Error listing files',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        folder: folder,
        files: result.files,
        count: result.files.length
      }
    });
  } catch (error) {
    console.error('Error listing S3 files:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing files',
      error: error.message
    });
  }
};

// Get presigned URL
const getPresignedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await FileUpload.findOne({ file_upload_id: id });
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File upload not found'
      });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: file.file_key,
      Expires: 3600 // URL expires in 1 hour
    };

    const presignedUrl = await s3.getSignedUrlPromise('getObject', params);

    res.json({
      success: true,
      data: {
        presigned_url: presignedUrl,
        file_name: file.file_name,
        file_type: file.file_type,
        file_size: file.file_size
      }
    });
  } catch (error) {
    console.error('Get presigned URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating presigned URL',
      error: error.message
    });
  }
};

export {
  uploadSingleFileHandler,
  uploadMultipleFilesHandler,
  getFileUploadById,
  getAllFiles,
  updateFileUpload,
  deleteFileUpload,
  getFileUrlHandler,
  listS3Files,
  getPresignedUrl
}; 