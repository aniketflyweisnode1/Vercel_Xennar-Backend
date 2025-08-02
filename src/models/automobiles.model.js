import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const automobilesSchema = new mongoose.Schema({
  Automobiles_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Title: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: Number,
    ref: 'City',
    required: true
  },
  vehicle_type: {
    type: Number,
    ref: 'VehicleType',
    required: true
  },
  vehicle_Transaction_type: {
    type: Number,
    ref: 'VehicleTransactionType',
    required: true
  },
  transmission: {
    type: Number,
    ref: 'Transmission',
    required: true
  },
  fuelType: {
    type: Number,
    ref: 'FuelType',
    required: true
  },
  brand_name: {
    type: String,
    required: true,
    trim: true
  },
  model_name: {
    type: String,
    required: true,
    trim: true
  },
  Year_built: {
    type: Number,
    required: true
  },
  Engine_capacity: {
    type: String,
    required: true,
    trim: true
  },
  colour: {
    type: String,
    required: true,
    trim: true
  },
  price_of_Vehicle: {
    type: Number,
    required: true
  },
  ReferanceNo: {
    type: String,
    unique: true,
    trim: true
  },
  recording_portrait: {
    type: String,
    default: null
  },
  recording_landscape: {
    type: String,
    default: null
  },
  vehicle_photo: [{
    type: String
  }],
  vehicle_FullPhoto: {
    type: String,
    default: null
  },
  vehicle_photowithname: [{
    name: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      default: 'default.jpg'
    }
  }],
  set_cover_photo: {
    type: String,
    default: null
  },
  setTemplate: {
    type: Number,
    ref: 'ImageTemplate',
    default: null
  },
  setMusic: {
    type: Number,
    ref: 'Music',
    default: null
  },
  VehicleNo: {
    type: String,
    required: true,
    trim: true
  },
  OwnerName: {
    type: String,
    required: true,
    trim: true
  },
  OwnerMobile: {
    type: String,
    required: true,
    trim: true
  },
  OwnerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
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
automobilesSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'Automobiles_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
automobilesSchema.plugin(paginate);

// Pre-save hook to update updated_at
automobilesSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create indexes for better performance
automobilesSchema.index({ Automobiles_id: 1 });
automobilesSchema.index({ location: 1 });
automobilesSchema.index({ vehicle_type: 1 });
automobilesSchema.index({ vehicle_Transaction_type: 1 });
automobilesSchema.index({ transmission: 1 });
automobilesSchema.index({ fuelType: 1 });
automobilesSchema.index({ brand_name: 1 });
automobilesSchema.index({ model_name: 1 });
automobilesSchema.index({ Year_built: 1 });
automobilesSchema.index({ price_of_Vehicle: 1 });
automobilesSchema.index({ ReferanceNo: 1 });
automobilesSchema.index({ VehicleNo: 1 });
automobilesSchema.index({ listing_approval: 1 });
automobilesSchema.index({ Soldstatus: 1 });
automobilesSchema.index({ status: 1 });
automobilesSchema.index({ created_by: 1 });
automobilesSchema.index({ created_at: -1 });

const Automobiles = mongoose.model('Automobiles', automobilesSchema);

export default Automobiles; 