import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const propertyUserSubscribeSchema = new mongoose.Schema({
  property_user_subscribe_id: {
    type: Number,
    unique: true,
    auto: true
  },
  property_user_subscribe: {
    type: String,
    required: true,
    trim: true
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

propertyUserSubscribeSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'property_user_subscribe_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
propertyUserSubscribeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
propertyUserSubscribeSchema.plugin(mongoosePaginate);

export default mongoose.model('PropertyUserSubscribe', propertyUserSubscribeSchema); 