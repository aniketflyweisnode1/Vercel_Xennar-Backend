import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const fileUploadSchema = new mongoose.Schema({
  file_upload_id: {
    type: Number,
    unique: true,
    auto: true
  },
  original_name: {
    type: String,
    required: true,
    trim: true
  },
  file_name: {
    type: String,
    required: true,
    trim: true
  },
  file_size: {
    type: Number,
    required: true
  },
  mime_type: {
    type: String,
    required: true,
    trim: true
  },
  file_url: {
    type: String,
    required: true,
    trim: true
  },
  bucket_name: {
    type: String,
    required: true,
    trim: true
  },
  folder: {
    type: String,
    default: 'uploads',
    trim: true
  },
  file_type: {
    type: String,
    enum: ['image', 'document', 'archive', 'other'],
    default: 'other'
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: { type: Number, ref: 'User', default: null },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: { type: Number, ref: 'User', default: null },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

fileUploadSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'file_upload_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
fileUploadSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
fileUploadSchema.plugin(mongoosePaginate);

export default mongoose.model('FileUpload', fileUploadSchema); 