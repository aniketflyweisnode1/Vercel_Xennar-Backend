import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const paymentUPISchema = new mongoose.Schema({
  upi_id: {
    type: Number,
    unique: true,
    auto: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  UPITxt: {
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

paymentUPISchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'upi_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
paymentUPISchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
paymentUPISchema.plugin(mongoosePaginate);

export default mongoose.model('PaymentUPI', paymentUPISchema); 