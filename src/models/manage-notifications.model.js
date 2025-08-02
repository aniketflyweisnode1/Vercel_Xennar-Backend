import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const manageNotificationsSchema = new mongoose.Schema({
  manage_notification_id: {
    type: Number,
    unique: true,
    auto: true
  },
  notification_title: {
    type: String,
    required: true,
    trim: true
  },
  notification_message: {
    type: String,
    required: true,
    trim: true
  },
  notification_type: {
    type: String,
    enum: ['email', 'sms', 'push', 'whatsapp', 'all'],
    default: 'all'
  },
  notification_status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  target_users: {
    type: [Number],
    ref: 'User',
    default: []
  },
  send_to_all: {
    type: Boolean,
    default: false
  },
  scheduled_at: {
    type: Date,
    default: null
  },
  sent_at: {
    type: Date,
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
  timestamps: false
});

// Auto-increment plugin
manageNotificationsSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'manage_notification_id',
  start_seq: 1,
  disable_on_update: true
});

// Pagination plugin
manageNotificationsSchema.plugin(paginate);

// Pre-save hook to update updated_at
manageNotificationsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create indexes for better performance
manageNotificationsSchema.index({ manage_notification_id: 1 });
manageNotificationsSchema.index({ notification_type: 1 });
manageNotificationsSchema.index({ notification_status: 1 });
manageNotificationsSchema.index({ status: 1 });
manageNotificationsSchema.index({ created_by: 1 });
manageNotificationsSchema.index({ created_at: -1 });
manageNotificationsSchema.index({ scheduled_at: 1 });
manageNotificationsSchema.index({ sent_at: 1 });

const ManageNotifications = mongoose.model('ManageNotifications', manageNotificationsSchema);

export default ManageNotifications; 