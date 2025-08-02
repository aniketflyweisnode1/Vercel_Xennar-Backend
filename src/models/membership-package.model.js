import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const membershipPackageSchema = new mongoose.Schema({
  package_id: {
    type: Number,
    unique: true,
    auto: true
  },
  package_name: {
    type: String,
    required: true,
    trim: true
  },
  sub_user_limit: {
    type: Number,
    required: true,
    default: 0
  },

  amount: {
    type: Number,
    required: true
  },
  duration: {
    type: Number // in days
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
membershipPackageSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'package_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
membershipPackageSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
membershipPackageSchema.plugin(mongoosePaginate);

// Create indexes for better performance
membershipPackageSchema.index({ package_id: 1 });
membershipPackageSchema.index({ status: 1 });
membershipPackageSchema.index({ created_by: 1 });
membershipPackageSchema.index({ created_at: -1 });

const MembershipPackage = mongoose.model('MembershipPackage', membershipPackageSchema);

export default MembershipPackage; 