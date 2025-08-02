import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const aboutXennarSchema = new mongoose.Schema({
  about_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Heading: {
    type: String,
    required: true,
    trim: true
  },
  tutorial_video: {
    type: String,
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

aboutXennarSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'about_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
aboutXennarSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
aboutXennarSchema.plugin(mongoosePaginate);

export default mongoose.model('AboutXennar', aboutXennarSchema); 