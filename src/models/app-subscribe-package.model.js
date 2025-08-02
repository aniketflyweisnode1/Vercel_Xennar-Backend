import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const appSubscribePackageSchema = new mongoose.Schema({
  app_subscribe_package_id: {
    type: Number,
    unique: true,
    auto: true
  },
  app_subscribe_package: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
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

appSubscribePackageSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'app_subscribe_package_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
appSubscribePackageSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
appSubscribePackageSchema.plugin(mongoosePaginate);

export default mongoose.model('AppSubscribePackage', appSubscribePackageSchema); 