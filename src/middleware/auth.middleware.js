import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, "jdfhjdhgjknk76%^&&*Hjhkj$GHG");
    
    // Debug: Log the decoded token
    // console.log('Decoded token userId:', decoded.userId, 'Type:', typeof decoded.userId);
    
    // Check if the userId is a valid number or ObjectId string
    let userId;
    if (typeof decoded.userId === 'number') {
      userId = decoded.userId;
    } else if (typeof decoded.userId === 'string') {
      // If it's a string, check if it's a number
      const parsedUserId = parseInt(decoded.userId);
      if (!isNaN(parsedUserId)) {
        userId = parsedUserId;
      } else {
        // It's an ObjectId string, we need to handle this case
        // console.log('Old token format detected with ObjectId:', decoded.userId);
        return res.status(401).json({
          success: false,
          message: 'Token format is outdated. Please login again to get a new token.'
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }
    
    const user = await User.findOne({ user_id: userId }).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.status) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

export default auth; 