import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const propertyWashroomSchema = new mongoose.Schema({
  property_washroom_id: {
    type: Number,
    unique: true,
    auto: true
  },
  property_washroom: {
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

propertyWashroomSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'property_washroom_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
propertyWashroomSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
propertyWashroomSchema.plugin(mongoosePaginate);

export default mongoose.model('PropertyWashroom', propertyWashroomSchema); 