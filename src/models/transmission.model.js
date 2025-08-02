import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const transmissionSchema = new mongoose.Schema({
  transmission_id: {
    type: Number,
    unique: true,
    auto: true
  },
  transmission_name: {
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
transmissionSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'transmission_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
transmissionSchema.plugin(paginate);

// Pre-save hook to update updated_at
transmissionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const Transmission = mongoose.model('Transmission', transmissionSchema);

export default Transmission; 