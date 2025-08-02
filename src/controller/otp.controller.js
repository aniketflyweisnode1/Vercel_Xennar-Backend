import OTP from '../models/otp.model.js';
import { generateOTP, validateOTP } from '../utils/otp.utils.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Create a new OTP
const createOTP = async (req, res) => {
  try {
    const { otp_type, status, created_by } = req.body;
    
    // Validate required fields
    if (!otp_type) {
      return res.status(400).json({
        success: false,
        message: 'OTP type is required'
      });
    }

    // Validate OTP type
    const validOTPTypes = ['Login', 'Payment', 'Registration'];
    if (!validOTPTypes.includes(otp_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP type. Must be one of: Login, Payment, Registration'
      });
    }

    // Generate 4-digit OTP automatically
    const generatedOTP = generateOTP();

    const otpData = new OTP({
      otp: generatedOTP,
      otp_type,
      status: status !== undefined ? status : true,
      created_by: created_by || null
    });

    const savedOTP = await otpData.save();
    
    res.status(201).json({
      success: true,
      message: 'OTP created successfully',
      data: {
        otp_id: savedOTP.otp_id,
        otp_type: savedOTP.otp_type,
        status: savedOTP.status,
        created_at: savedOTP.created_at,
        // Don't send the actual OTP in response for security
        message: '4-digit OTP generated successfully'
      }
    });
  } catch (error) {
    console.error('Error creating OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating OTP',
      error: error.message
    });
  }
};

// Update OTP by ID
const updateOTP = async (req, res) => {
  try {
    const { id, otp, otp_type, status, updated_by } = req.body;
    
    // Check if ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'OTP ID is required'
      });
    }

    // Check if OTP exists
    const existingOTP = await OTP.findOne({ otp_id: id });
    if (!existingOTP) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found'
      });
    }

    // Validate OTP type if provided
    if (otp_type) {
      const validOTPTypes = ['Login', 'Payment', 'Registration'];
      if (!validOTPTypes.includes(otp_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP type. Must be one of: Login, Payment, Registration'
        });
      }
    }

    const updateData = {
      otp: otp || existingOTP.otp,
      otp_type: otp_type || existingOTP.otp_type,
      status: status !== undefined ? status : existingOTP.status,
      updated_by: updated_by || null,
      updated_at: new Date()
    };

    const updatedOTP = await OTP.findOneAndUpdate(
      { otp_id: id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'OTP updated successfully',
      data: updatedOTP
    });
  } catch (error) {
    console.error('Error updating OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating OTP',
      error: error.message
    });
  }
};

// Get OTP by ID
const getOTPById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const otp = await OTP.findOne({ otp_id: id });
    
    if (!otp) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found'
      });
    }

    res.json({
      success: true,
      data: otp
    });
  } catch (error) {
    console.error('Error getting OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting OTP',
      error: error.message
    });
  }
};

// Get all OTPs
const getAllOTPs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, otp_type, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Filter by OTP type if provided
    if (otp_type) {
      query.otp_type = otp_type;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { otp: { $regex: search, $options: 'i' } },
        { otp_type: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'created_by', select: 'name email' },
        { path: 'updated_by', select: 'name email' }
      ],
      sort: { created_at: -1 }
    };

    const otps = await OTP.paginate(query, options);

    res.json({
      success: true,
      data: otps.docs,
      pagination: {
        totalDocs: otps.totalDocs,
        limit: otps.limit,
        totalPages: otps.totalPages,
        page: otps.page,
        pagingCounter: otps.pagingCounter,
        hasPrevPage: otps.hasPrevPage,
        hasNextPage: otps.hasNextPage,
        prevPage: otps.prevPage,
        nextPage: otps.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting OTPs:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting OTPs',
      error: error.message
    });
  }
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId },  "jdfhjdhgjknk76%^&&*Hjhkj$GHG", {
    expiresIn: '7d'
  });
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { otp, otp_type, user_id } = req.body;
    // console.log(otp, otp_type, user_id);
    if (!otp || !otp_type || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'OTP, OTP type, and user ID are required'
      });
    }

    // Validate OTP format (4 digits)
    if (!validateOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Must be 4 digits'
      });
    }

    // Find active OTP
    const otpData = await OTP.findOne({
      otp,
      otp_type,
      status: true,
      created_by: user_id
    }).sort({ created_at: -1 });
   
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or OTP expired'
      });
    }

    // Check if OTP is expired (15 minutes)
    const otpAge = Date.now() - otpData.created_at.getTime();
    const otpExpiryTime = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (otpAge > otpExpiryTime) {
      // Mark OTP as expired
      await OTP.findOneAndUpdate({ otp_id: otpData._id }, { status: false });
      
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Mark OTP as used
    await OTP.findOneAndUpdate({ otp_id: otpData.otp_id }, { 
      status: false,
      updated_at: new Date()
    });

    // Get user details
    const user = await User.findOne({ user_id: user_id }).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate auth token
    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: 'OTP verified successfully. Login completed.',
      data: {
        user: {
          _id: user._id,
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          acceptpolicy: user.acceptpolicy,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        token,
        OTP: { otp_id: otpData.otp_id, otp: otpData.otp, otp_type: otpData.otp_type, status: otpData.status },
        verified_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// Get OTP value (for testing purposes - remove in production)
const getOTPValue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const otp = await OTP.findOne({ otp_id: id }).select('otp otp_type created_at');
    
    if (!otp) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found'
      });
    }

    // Check if OTP is expired (15 minutes)
    const otpAge = Date.now() - otp.created_at.getTime();
    const otpExpiryTime = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (otpAge > otpExpiryTime) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    res.json({
      success: true,
      data: {
        otp: otp.otp,
        otp_type: otp.otp_type,
        created_at: otp.created_at
      }
    });
  } catch (error) {
    console.error('Error getting OTP value:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting OTP value',
      error: error.message
    });
  }
};

export {
  createOTP,
  updateOTP,
  getOTPById,
  getAllOTPs,
  verifyOTP,
  getOTPValue
}; 