import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const guidedTourSchema = new mongoose.Schema({
  guided_id: {
    type: Number,
    unique: true,
    auto: true
  },
  heading: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  video: [{
    type: String,
    trim: true
  }],
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
  timestamps: false // We're handling timestamps manually
});

guidedTourSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'guided_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
guidedTourSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
guidedTourSchema.plugin(mongoosePaginate);

export default mongoose.model('GuidedTour', guidedTourSchema); 