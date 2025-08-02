import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const vehicleTypeSchema = new mongoose.Schema({
  vehicletype_id: {
    type: Number,
    unique: true,
    auto: true
  },
  type_name: {
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
vehicleTypeSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'vehicletype_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
vehicleTypeSchema.plugin(paginate);

// Pre-save hook to update updated_at
vehicleTypeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const VehicleType = mongoose.model('VehicleType', vehicleTypeSchema);

export default VehicleType; 