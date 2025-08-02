import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const supportSchema = new mongoose.Schema({
  support_id: {
    type: Number,
    unique: true,
    auto: true
  },
  support_type: {
    type: String,
    enum: ['Tech', 'Task', 'Automobile', 'Real Estate'],
    required: true
  },
  ask_question: {
    type: String,
    required: true,
    trim: true
  },
  ask_user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  reply_answer: {
    type: String,
    trim: true,
    default: null
  },
  ans_by_id: {
    type: Number,
    ref: 'User',
    default: null
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

supportSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'support_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
supportSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
supportSchema.plugin(mongoosePaginate);

export default mongoose.model('Support', supportSchema); 