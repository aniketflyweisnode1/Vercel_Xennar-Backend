import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const propertySubTypeSchema = new mongoose.Schema({
  property_sub_type_id: {
    type: Number,
    unique: true,
    auto: true
  },
  property_type_id: { type: Number, ref: 'PropertyType', required: true },
  property_sub_type: {
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

propertySubTypeSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'property_sub_type_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
propertySubTypeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
propertySubTypeSchema.plugin(mongoosePaginate);

export default mongoose.model('PropertySubType', propertySubTypeSchema); 