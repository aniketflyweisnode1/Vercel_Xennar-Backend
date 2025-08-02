import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const notificationSchema = new mongoose.Schema({
  notification_id: {
    type: Number,
    unique: true,
    auto: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  massage: {
    type: String,
    required: true,
    trim: true
  },
  notification_view: {
    type: Boolean,
    default: false
  },
  notification_type: {
    type: String,
    default: 'None'
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

notificationSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'notification_id',
  start_seq: 1,
  disable_on_update: true
});

notificationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

notificationSchema.plugin(mongoosePaginate);

export default mongoose.model('Notification', notificationSchema); 