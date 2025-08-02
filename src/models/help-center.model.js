import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const helpCenterSchema = new mongoose.Schema({
  Center_id: {
    type: Number,
    unique: true,
    auto: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  Help_Employee_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  help_type: {
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

helpCenterSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'Center_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
helpCenterSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
helpCenterSchema.plugin(mongoosePaginate);

export default mongoose.model('Help_Center', helpCenterSchema); 