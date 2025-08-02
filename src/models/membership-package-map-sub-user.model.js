import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const membershipPackageMapSubUserSchema = new mongoose.Schema({
  package_sub_user_id: {
    type: Number,
    unique: true,
    auto: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  membership_package_id: {
    type: Number,
    ref: 'MembershipPackage',
    required: true
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

membershipPackageMapSubUserSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'package_sub_user_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
membershipPackageMapSubUserSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
membershipPackageMapSubUserSchema.plugin(mongoosePaginate);

export default mongoose.model('MembershipPackageMapSubUser', membershipPackageMapSubUserSchema); 