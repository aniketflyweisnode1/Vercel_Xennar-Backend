import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const imageTemplateSchema = new mongoose.Schema({
  template_id: {
    type: Number,
    unique: true,
    auto: true
  },
  template_name: {
    type: String,
    required: true,
    trim: true
  },
  template_type: {
    type: String,
    default: 'None',
    trim: true
  },
  template_category: {
    type: Number,
    ref: 'TemplateCategory',
    default: 1
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

imageTemplateSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'template_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
imageTemplateSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
imageTemplateSchema.plugin(mongoosePaginate);

export default mongoose.model('ImageTemplate', imageTemplateSchema); 