import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const propertyPhotoSchema = new mongoose.Schema({
  'Photo-name': {
    type: String,
    trim: true
  },
  'Photo': {
    type: String,
    default: 'default.jpg',
    trim: true
  }
}, { _id: false });

const propertySchema = new mongoose.Schema({
  property_id: {
    type: Number,
    unique: true,
    auto: true
  },
  property_title: {
    type: String,
    required: true,
    trim: true
  },
  location_of_property: { type: Number, ref: 'City', required: true },
  property_type_id: { type: Number, ref: 'PropertyType', required: true },
  transaction_type_id: { type: Number, ref: 'PropertyTransactionType', required: true },
  property_sub_type_id: { type: Number, ref: 'PropertySubType', required: true },
  internal_area: {
    type: String,
    trim: true
  },
  condition_id: { type: Number, ref: 'PropertyCondition', required: true },
  washroom_id: { type: Number, ref: 'PropertyWashroom', required: true },
  number_of_parking: {
    type: Number,
    default: 0
  },
  land_area: {
    type: String,
    trim: true
  },
  price_the_property: {
    type: Number,
    required: true
  },
  reference_number: {
    type: String,
    trim: true
  },
  location_city_id: { type: Number, ref: 'City', required: true },
  location_street: {
    type: String,
    trim: true
  },
  zip_code: {
    type: String,
    trim: true
  },
  property_photo: {
    type: [propertyPhotoSchema],
    default: [{
      'Photo-name': 'Living Room',
      'Photo': 'default.jpg'
    }]
  },
  template_id: { type: Number, ref: 'ImageTemplate' },
  music_id: { type: Number, ref: 'Music' },
  property_name: {
    type: String,
    trim: true
  },
  property_number: {
    type: String,
    trim: true
  },
  property_wing_floor: {
    type: String,
    trim: true
  },
  owner_builder_name: {
    type: String,
    trim: true
  },
  owner_builder_mobile: {
    type: String,
    trim: true
  },
  owner_builder_email: {
    type: String,
    trim: true,
    lowercase: true
  },
  company_name: {
    type: String,
    trim: true
  },
  listing_approval: {
    type: String,
    enum: ['Approved', 'Rejected', 'Pending'],
    default: 'Pending'
  },
  Soldstatus: {
    type: String,
    enum: ['Sold', 'UnSold', 'Rented'],
    default: 'UnSold'
  },
  mark_rented: {
    type: Boolean,
    default: false
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

propertySchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'property_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
propertySchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
propertySchema.plugin(mongoosePaginate);

export default mongoose.model('Property', propertySchema); 