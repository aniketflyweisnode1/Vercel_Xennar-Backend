import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import AutoIncrement from 'mongoose-sequence';

const otpSchema = new mongoose.Schema({
    otp_id: {
        type: Number,
        unique: true,
        default: () => Date.now()
    },
    otp: {
        type: String,
        required: true,
        trim: true
    },
    otp_type: {
        type: String,
        required: true,
        enum: ['Login', 'Payment', 'Registration'],
        trim: true
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



// Update the updated_at field before saving
otpSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Add pagination plugin
otpSchema.plugin(mongoosePaginate);

export default mongoose.model('OTP', otpSchema);
