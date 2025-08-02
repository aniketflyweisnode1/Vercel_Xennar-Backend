import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const membershipOfferHeadingsLinesSchema = new mongoose.Schema({
  lines_id: {
    type: Number,
    unique: true,
    auto: true
  },
  package_id: {
    type: Number,
    ref: 'MembershipPackage',
    required: true
  },
  heading_id: {
    type: Number,
    ref: 'MembershipOfferHeadings',
    required: true
  },
  line_text: {
    type: String,
    required: true,
    trim: true
  },
  line_emozi: {
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
membershipOfferHeadingsLinesSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'lines_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
membershipOfferHeadingsLinesSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
membershipOfferHeadingsLinesSchema.plugin(mongoosePaginate);

// Create indexes for better performance
membershipOfferHeadingsLinesSchema.index({ lines_id: 1 });
membershipOfferHeadingsLinesSchema.index({ package_id: 1 });
membershipOfferHeadingsLinesSchema.index({ heading_id: 1 });
membershipOfferHeadingsLinesSchema.index({ status: 1 });
membershipOfferHeadingsLinesSchema.index({ created_by: 1 });
membershipOfferHeadingsLinesSchema.index({ created_at: -1 });

const MembershipOfferHeadingsLines = mongoose.model('MembershipOfferHeadingsLines', membershipOfferHeadingsLinesSchema);

export default MembershipOfferHeadingsLines; 