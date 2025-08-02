import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import { generateOTP } from '../utils/otp.utils.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId },  "jdfhjdhgjknk76%^&&*Hjhkj$GHG", {
    expiresIn:  '7d'
  });
};

// Login user
const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validate input
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile and password are required'
      });
    }

    // Find user by mobile
    const user = await User.findOne({ mobile });
 
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials1'
      });
    }

    // Check if user is active
    if (!user.status) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password using bcrypt
    
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials2'
      });
    }

    // Generate and save OTP for login
    const generatedOTP = generateOTP();
    console.log('Generated OTP:', generatedOTP);
    
    try {
      // Create OTP data
      const otpData = new OTP({
        otp: generatedOTP,
        otp_type: 'Login',
        status: true,
        created_by: user.user_id
      });

   
      const savedOTP = await otpData.save();
      console.log('OTP saved successfully:', savedOTP);
      
      // Remove password from response
      const userResponse = {
        _id: user._id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role_id: user.role_id,
        user_industryType: user.user_industryType,
        acceptpolicy: user.acceptpolicy,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      res.json({
        success: true,
        message: 'Login successful. Please verify OTP to continue.',
        data: {
          user: userResponse,
          OTP: { otp_id: savedOTP.otp_id, otp: savedOTP.otp },
          message: 'OTP has been generated for verification'
        }
      });
    } catch (otpError) {
      console.error('Error saving OTP:', otpError);
      return res.status(500).json({
        success: false,
        message: 'Error generating OTP',
        error: otpError.message
      });
    }


  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Register user
const register = async (req, res) => {
  try {
    const { name, email, mobile, password, acceptpolicy } = req.body;

    // Validate input
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, mobile, and password are required'
      });
    }

    // Check if user with email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if user with mobile already exists
    const existingUserByMobile = await User.findOne({ mobile });
    if (existingUserByMobile) {
      return res.status(400).json({
        success: false,
        message: 'User with this mobile number already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      acceptpolicy: acceptpolicy !== undefined ? acceptpolicy : true,
      status: true
    });

    const savedUser = await user.save();

    // Generate token
    const token = generateToken(savedUser.user_id);

    // Remove password from response
    const userResponse = {
      _id: savedUser._id,
      user_id: savedUser.user_id,
      name: savedUser.name,
      email: savedUser.email,
      mobile: savedUser.mobile,
      acceptpolicy: savedUser.acceptpolicy,
      status: savedUser.status,
      created_at: savedUser.created_at,
      updated_at: savedUser.updated_at
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const user = await User.findOne({ user_id: userId })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, email, mobile, acceptpolicy } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ user_id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email, 
        user_id: { $ne: userId } 
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Check if mobile is being changed and if it already exists
    if (mobile && mobile !== existingUser.mobile) {
      const mobileExists = await User.findOne({ 
        mobile, 
        user_id: { $ne: userId } 
      });
      if (mobileExists) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already exists'
        });
      }
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        name: name || existingUser.name,
        email: email || existingUser.email,
        mobile: mobile || existingUser.mobile,
        acceptpolicy: acceptpolicy !== undefined ? acceptpolicy : existingUser.acceptpolicy,
        updated_at: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user with password
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password - removed bcrypt.compare as requested

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findOneAndUpdate(
      { user_id: userId },
      { 
        password: hashedNewPassword,
        updated_at: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
 
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.status) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }



    // Verify password - simple comparison
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user.user_id);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role_id: user.role_id,
      user_industryType: user.user_industryType,
      acceptpolicy: user.acceptpolicy,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during admin login',
      error: error.message
    });
  }
};

// Check Token Expiry
const checkTokenExpiry = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        data: {
          isValid: false,
          isExpired: false,
          message: 'No token provided'
        }
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token,  "jdfhjdhgjknk76%^&&*Hjhkj$GHG");
      
      // Check if user still exists and is active
      const user = await User.findOne({ user_id: decoded.userId }).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
          data: {
            isValid: false,
            isExpired: false,
            message: 'User not found'
          }
        });
      }

      if (!user.status) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
          data: {
            isValid: false,
            isExpired: false,
            message: 'Account is deactivated'
          }
        });
      }

      // Token is valid and user is active
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          isValid: true,
          isExpired: false,
          message: 'Token is valid and not expired',
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            status: user.status
          }
        }
      });

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
          data: {
            isValid: false,
            isExpired: true,
            message: 'Token has expired',
            expiredAt: jwtError.expiredAt
          }
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format',
          data: {
            isValid: false,
            isExpired: false,
            message: 'Invalid token format'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          data: {
            isValid: false,
            isExpired: false,
            message: 'Invalid token'
          }
        });
      }
    }

  } catch (error) {
    console.error('Check token expiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking token expiry',
      error: error.message,
      data: {
        isValid: false,
        isExpired: false,
        message: 'Error checking token expiry'
      }
    });
  }
};

// Sign Out
const signOut = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // In a more advanced implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Clear any session data
    
    // For now, we'll just return a success message
    // The client should remove the token from storage
    
    res.json({
      success: true,
      message: 'Successfully signed out',
      data: {
        user_id: userId,
        message: 'Please remove the token from your client storage'
      }
    });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during sign out',
      error: error.message
    });
  }
};

export {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  adminLogin,
  checkTokenExpiry,
  signOut
}; 