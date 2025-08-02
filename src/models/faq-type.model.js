import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const faqTypeSchema = new mongoose.Schema({
  faqType_id: {
    type: Number,
    unique: true,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    default: null
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
  timestamps: false // We're handling timestamps manually
});

faqTypeSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'faqType_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
faqTypeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
faqTypeSchema.plugin(mongoosePaginate);

export default mongoose.model('FaqType', faqTypeSchema); 