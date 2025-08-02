import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const membershipOfferHeadingsSchema = new mongoose.Schema({
  heading_id: {
    type: Number,
    unique: true,
    auto: true
  },
  package_id: {
    type: Number,
    ref: 'MembershipPackage',
    required: true
  },
  heading_text: {
    type: String,
    required: true,
    trim: true
  },
  heading_emozi: {
    type: String,
    trim: true
  },
  sub_heading_text: {
    type: String,
    trim: true
  },
  sub_heading_emozi: {
    type: String,
    trim: true
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
membershipOfferHeadingsSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'heading_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
membershipOfferHeadingsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
membershipOfferHeadingsSchema.plugin(mongoosePaginate);

// Create indexes for better performance
membershipOfferHeadingsSchema.index({ heading_id: 1 });
membershipOfferHeadingsSchema.index({ package_id: 1 });
membershipOfferHeadingsSchema.index({ status: 1 });
membershipOfferHeadingsSchema.index({ created_by: 1 });
membershipOfferHeadingsSchema.index({ created_at: -1 });

const MembershipOfferHeadings = mongoose.model('MembershipOfferHeadings', membershipOfferHeadingsSchema);

export default MembershipOfferHeadings; 