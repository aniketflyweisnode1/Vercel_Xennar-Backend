import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const taskSchema = new mongoose.Schema({
  task_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Title_Description: {
    type: String,
    required: true,
    trim: true
  },
  Task_name: {
    type: String,
    required: true,
    trim: true
  },
  Task_address: {
    type: String,
    required: true,
    trim: true
  },
  Task_type: {
    type: String,
    enum: ['Real Estate', 'Automobile'],
    required: true
  },
  Assign_to_id: {
    type: Number,
    ref: 'User',
    default: null
  },
  Task_status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  property_location_id: {
    type: Number,
    ref: 'City',
    default: null
  },
  property_type_id: {
    type: Number,
    ref: 'PropertyType',
    default: null
  },
  transaction_type_id: {
    type: Number,
    ref: 'PropertyTransactionType',
    default: null
  },
  property_sub_type_id: {
    type: Number,
    ref: 'PropertySubType',
    default: null
  },
  internal_area: {
    type: String,
    trim: true,
    default: null
  },
  condition: {
    type: Number,
    ref: 'PropertyCondition',
    default: null
  },
  washroom: {
    type: Number,
    ref: 'PropertyWashroom',
    default: null
  },
  number_of_Parking: {
    type: Number,
    default: 0
  },
  land_area: {
    type: String,
    trim: true,
    default: null
  },
  price_of_the_property: {
    type: Number,
    default: 0
  },
  ReferenceNo: {
    type: String,
    trim: true,
    default: null
  },
  Task_Reminder: {
    type: Boolean,
    default: false
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
taskSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'task_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
taskSchema.plugin(paginate);

// Pre-save hook to update updated_at
taskSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create indexes for better performance
taskSchema.index({ task_id: 1 });
taskSchema.index({ Task_name: 1 });
taskSchema.index({ Task_type: 1 });
taskSchema.index({ Assign_to_id: 1 });
taskSchema.index({ Task_status: 1 });
taskSchema.index({ property_location_id: 1 });
taskSchema.index({ property_type_id: 1 });
taskSchema.index({ transaction_type_id: 1 });
taskSchema.index({ property_sub_type_id: 1 });
taskSchema.index({ ReferenceNo: 1 });
taskSchema.index({ Task_Reminder: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ created_by: 1 });
taskSchema.index({ created_at: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task; 