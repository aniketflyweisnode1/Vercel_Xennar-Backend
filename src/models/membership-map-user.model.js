import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const membershipMapUserSchema = new mongoose.Schema({
  membership_map_id: {
    type: Number,
    unique: true,
    auto: true
  },
  package_id: {
    type: Number,
    ref: 'MembershipPackage',
    required: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  membership_expiry_date: {
    type: Date
  },
  membership_status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_id: {
    type: Number,
    ref: 'Payment',
    default: null
  },
  transaction_no: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: Boolean,
    default: false
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
membershipMapUserSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'membership_map_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
membershipMapUserSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
membershipMapUserSchema.plugin(mongoosePaginate);

// Create indexes for better performance
membershipMapUserSchema.index({ membership_map_id: 1 });
membershipMapUserSchema.index({ package_id: 1 });
membershipMapUserSchema.index({ user_id: 1 });
membershipMapUserSchema.index({ status: 1 });
membershipMapUserSchema.index({ created_by: 1 });
membershipMapUserSchema.index({ created_at: -1 });

const MembershipMapUser = mongoose.model('MembershipMapUser', membershipMapUserSchema);

export default MembershipMapUser; 