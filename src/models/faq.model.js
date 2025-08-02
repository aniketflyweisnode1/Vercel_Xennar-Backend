import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const faqSchema = new mongoose.Schema({
  faq_id: {
    type: Number,
    unique: true,
    auto: true
  },
  faqType_id: {
    type: Number,
    ref: 'FaqType',
    required: true
  },
  industryType: {
    type: String,
    enum: ['Real Estate', 'Automobile', 'null'], // task type 
    default: 'null'
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
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

faqSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'faq_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
faqSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
faqSchema.plugin(mongoosePaginate);

export default mongoose.model('Faq', faqSchema); 