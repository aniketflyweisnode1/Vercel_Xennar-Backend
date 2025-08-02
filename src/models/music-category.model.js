import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const musicCategorySchema = new mongoose.Schema({
  MCategory_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Category_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: Number,
    ref: 'User',
    default: null
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Auto-increment plugin
musicCategorySchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'MCategory_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
musicCategorySchema.plugin(paginate);

// Pre-save hook to update updated_at
musicCategorySchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create indexes for better performance
musicCategorySchema.index({ MCategory_id: 1 });
musicCategorySchema.index({ Category_name: 1 });
musicCategorySchema.index({ status: 1 });
musicCategorySchema.index({ created_by: 1 });
musicCategorySchema.index({ created_at: -1 });

const MusicCategory = mongoose.model('MusicCategory', musicCategorySchema);

export default MusicCategory; 