import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const stateSchema = new mongoose.Schema({
  state_id: {
    type: Number,
    unique: true,
    auto: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country_id: {
    type: Number,
    default: 1
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
  timestamps: false
});

stateSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'state_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
stateSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
stateSchema.plugin(mongoosePaginate);

export default mongoose.model('State', stateSchema); 