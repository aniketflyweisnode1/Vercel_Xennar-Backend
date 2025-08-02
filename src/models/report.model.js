import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const reportSchema = new mongoose.Schema({
  report_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Total_Task: {
    type: Number,
    default: 0
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  status: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  last_completed_Task: {
    type: Date,
    default: null
  },
  TaskBreakdown: [{
    task_type: {
      type: String,
      trim: true
    },
    total_tasks: {
      type: Number,
      default: 0
    },
    completed_tasks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
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

reportSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'report_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
reportSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
reportSchema.plugin(mongoosePaginate);

export default mongoose.model('Report', reportSchema); 