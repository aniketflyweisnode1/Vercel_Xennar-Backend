import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const templateCategorySchema = new mongoose.Schema({
  TemCategory_id: {
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
templateCategorySchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'TemCategory_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
templateCategorySchema.plugin(paginate);

// Pre-save hook to update updated_at
templateCategorySchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create indexes for better performance
templateCategorySchema.index({ TemCategory_id: 1 });
templateCategorySchema.index({ Category_name: 1 });
templateCategorySchema.index({ status: 1 });
templateCategorySchema.index({ created_by: 1 });
templateCategorySchema.index({ created_at: -1 });

const TemplateCategory = mongoose.model('TemplateCategory', templateCategorySchema);

export default TemplateCategory; 