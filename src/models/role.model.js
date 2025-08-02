import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const roleSchema = new mongoose.Schema({
  role_id: {
    type: Number,
    unique: true,
    auto: true
  },
  role_name: {
    type: String,
    required: true,
    trim: true,
    unique: true
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

// Add auto-increment plugin
roleSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'role_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
roleSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
roleSchema.plugin(mongoosePaginate);

// Create indexes for better performance
roleSchema.index({ role_id: 1 });
roleSchema.index({ role_name: 1 });
roleSchema.index({ status: 1 });
roleSchema.index({ created_by: 1 });
roleSchema.index({ created_at: -1 });

const Role = mongoose.model('Role', roleSchema);

export default Role; 