import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const paymentSchema = new mongoose.Schema({
  payment_id: {
    type: Number,
    unique: true,
    auto: true
  },
  payment_type_id: {
    type: Number,
    ref: 'PaymentType',
    required: true
  },
  payment_by_user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  payment_get_by_user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transaction_no: {
    type: String,
    trim: true,
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: 0
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
paymentSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'payment_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
paymentSchema.plugin(paginate);

// Pre-save hook to update updated_at
paymentSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create indexes for better performance
paymentSchema.index({ payment_id: 1 });
paymentSchema.index({ payment_type_id: 1 });
paymentSchema.index({ payment_by_user_id: 1 });
paymentSchema.index({ payment_get_by_user_id: 1 });
paymentSchema.index({ payment_status: 1 });
paymentSchema.index({ transaction_no: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ created_by: 1 });
paymentSchema.index({ created_at: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment; 