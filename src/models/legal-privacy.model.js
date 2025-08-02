import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const legalPrivacySchema = new mongoose.Schema({
  Privacy_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Heading: {
    type: String,
    required: true,
    trim: true
  },
  subHeading: {
    type: String,
    required: true,
    trim: true
  },
  description: {
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

legalPrivacySchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'Privacy_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
legalPrivacySchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
legalPrivacySchema.plugin(mongoosePaginate);

export default mongoose.model('LegalPrivacy', legalPrivacySchema); 