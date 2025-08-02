import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const paymentTypeSchema = new mongoose.Schema({
  paymenttype_id: {
    type: Number,
    unique: true,
    auto: true
  },
  payment_type: {
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
  timestamps: false
});

// Auto-increment plugin
paymentTypeSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'paymenttype_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
paymentTypeSchema.plugin(paginate);

// Pre-save hook to update updated_at
paymentTypeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create indexes for better performance
paymentTypeSchema.index({ paymenttype_id: 1 });
paymentTypeSchema.index({ payment_type: 1 });
paymentTypeSchema.index({ status: 1 });
paymentTypeSchema.index({ created_by: 1 });
paymentTypeSchema.index({ created_at: -1 });

const PaymentType = mongoose.model('PaymentType', paymentTypeSchema);

export default PaymentType; 