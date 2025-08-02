import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const citySchema = new mongoose.Schema({
  city_id: {
    type: Number,
    unique: true,
    auto: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state_id: { type: Number, ref: 'State', required: true },
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

citySchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'city_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
citySchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
citySchema.plugin(mongoosePaginate);

export default mongoose.model('City', citySchema); 