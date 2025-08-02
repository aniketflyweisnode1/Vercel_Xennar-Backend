import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const musicSchema = new mongoose.Schema({
  music_id: {
    type: Number,
    unique: true,
    auto: true
  },
  music_name: {
    type: String,
    required: true,
    trim: true
  },
  music_category: {
    type: Number,
    ref: 'MusicCategory',
    default: 1
  },
  music_file: {
    type: String,
    default: 'default.mp3',
    trim: true
  },
  music_type: {
    type: String,
    default: 'None',
    trim: true
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

musicSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'music_id',
  start_seq: 1,
  disable_on_update: true
});

// Update the updated_at field before saving
musicSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
musicSchema.plugin(mongoosePaginate);

export default mongoose.model('Music', musicSchema); 