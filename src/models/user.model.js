import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';
const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role_id: {
    type: Number,
    ref: 'Role',
    default: 1
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String
  },
  user_industryType: {
    type: String,
    enum: ['Real Estate', 'Automobile', 'null'], // task type 
    default: 'null'
  },
  instagram: {
    type: String,
    trim: true,
    default: null
  },
  facebook: {
    type: String,
    trim: true,
    default: null
  },
  YouTube: {
    type: String,
    trim: true,
    default: null
  },
  Twitter: {
    type: String,
    trim: true,
    default: null
  },
  bio: {
    type: String,
    trim: true,
    default: null,
    maxlength: 500
  },
  notification_active: {
    type: Boolean,
    default: true
  },
  notification_whatsapp: {
    type: Boolean,
    default: true
  },
  Task_Remidner: {
    type: Boolean,
    default: true
  },
  Biometric_Authentications: {
    type: Boolean,
    default: false
  },
  acceptpolicy: {
    type: Boolean,
    default: true
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    default: null
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

userSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'user_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

export default mongoose.model('User', userSchema); 