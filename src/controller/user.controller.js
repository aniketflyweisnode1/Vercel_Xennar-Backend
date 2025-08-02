import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';


// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOne({ user_id: id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user',
      error: error.message
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const users = await User.paginate(query, options);

    res.json({
      success: true,
      data: users.docs,
      pagination: {
        totalDocs: users.totalDocs,
        limit: users.limit,
        totalPages: users.totalPages,
        page: users.page,
        pagingCounter: users.pagingCounter,
        hasPrevPage: users.hasPrevPage,
        hasNextPage: users.hasNextPage,
        prevPage: users.prevPage,
        nextPage: users.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting users',
      error: error.message
    });
  }
};

// Update user industry type
const updateIndustryType = async (req, res) => {
  try {
    const { user_industryType } = req.body;
    const userId = req.user.user_id;

    // Validate industry type
    const validIndustryTypes = ['Real Estate', 'Automobile', 'null'];
    if (!validIndustryTypes.includes(user_industryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid industry type. Must be one of: Real Estate, Automobile, null'
      });
    }

    // Update user's industry type
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        user_industryType,
        updated_by: userId,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Industry type updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating industry type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating industry type',
      error: error.message
    });
  }
};

// Update user biometric authentication status
const updateBiometricAuthentication = async (req, res) => {
  try {
    const { Biometric_Authentications } = req.body;
    const userId = req.user.user_id;

    // Validate biometric authentication status
    if (typeof Biometric_Authentications !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Biometric_Authentications must be a boolean value (true/false)'
      });
    }

    // Update user's biometric authentication status
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        Biometric_Authentications,
        updated_by: userId,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `Biometric authentication ${Biometric_Authentications ? 'enabled' : 'disabled'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating biometric authentication status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating biometric authentication status',
      error: error.message
    });
  }
};

// Update user WhatsApp notifications status
const updateWhatsAppNotifications = async (req, res) => {
  try {
    const { notification_whatsapp } = req.body;
    const userId = req.user.user_id;

    // Validate WhatsApp notifications status
    if (typeof notification_whatsapp !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'notification_whatsapp must be a boolean value (true/false)'
      });
    }

    // Update user's WhatsApp notifications status
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        notification_whatsapp,
        updated_by: userId,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `WhatsApp notifications ${notification_whatsapp ? 'enabled' : 'disabled'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating WhatsApp notifications status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating WhatsApp notifications status',
      error: error.message
    });
  }
};

// Update user task reminder status
const updateTaskReminder = async (req, res) => {
  try {
    const { Task_Remidner } = req.body;
    const userId = req.user.user_id;

    // Validate task reminder status
    if (typeof Task_Remidner !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Task_Remidner must be a boolean value (true/false)'
      });
    }

    // Update user's task reminder status
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        Task_Remidner,
        updated_by: userId,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `Task reminders ${Task_Remidner ? 'enabled' : 'disabled'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating task reminder status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task reminder status',
      error: error.message
    });
  }
};

// Get users by authenticated user's created_by
const getUsersByCreatedBy = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      user_industryType,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {
      created_by: user_id // Filter by authenticated user's created_by
    };

    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by industry type if provided
    if (user_industryType) {
      query.user_industryType = user_industryType;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const users = await User.paginate(query, options);

    res.json({
      success: true,
      message: 'Users retrieved successfully for authenticated user',
      data: users.docs,
      pagination: {
        totalDocs: users.totalDocs,
        limit: users.limit,
        totalPages: users.totalPages,
        page: users.page,
        pagingCounter: users.pagingCounter,
        hasPrevPage: users.hasPrevPage,
        hasNextPage: users.hasNextPage,
        prevPage: users.prevPage,
        nextPage: users.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting users by created_by:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting users by created_by',
      error: error.message
    });
  }
};

export {
  getUserById,
  getAllUsers,
  updateIndustryType,
  updateBiometricAuthentication,
  updateWhatsAppNotifications,
  updateTaskReminder,
  getUsersByCreatedBy
}; 