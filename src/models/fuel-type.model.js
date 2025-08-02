import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const fuelTypeSchema = new mongoose.Schema({
  fuelType_id: {
    type: Number,
    unique: true,
    auto: true
  },
  fuelType_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
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

// Auto-increment plugin
fuelTypeSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'fuelType_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
fuelTypeSchema.plugin(paginate);

// Pre-save hook to update updated_at
fuelTypeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const FuelType = mongoose.model('FuelType', fuelTypeSchema);

export default FuelType;