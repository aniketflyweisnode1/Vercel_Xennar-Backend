import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const notificationsMapUserSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  notification_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true
  },
  notification_view: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Add pagination plugin
notificationsMapUserSchema.plugin(mongoosePaginate);

// Create compound index for user_id and notification_id to ensure uniqueness
notificationsMapUserSchema.index({ user_id: 1, notification_id: 1 }, { unique: true });

// Create index for better query performance
notificationsMapUserSchema.index({ user_id: 1, status: 1 });
notificationsMapUserSchema.index({ notification_view: 1 });
notificationsMapUserSchema.index({ created_at: -1 });

const NotificationsMapUser = mongoose.model('NotificationsMapUser', notificationsMapUserSchema);

export default NotificationsMapUser; 