import Help_Center from '../models/help-center.model.js';
import User from '../models/user.model.js';

// Create Help Center
const createHelpCenter = async (req, res) => {
  try {
    const { user_id, Help_Employee_id, help_type } = req.body;
    const userId = req.user.user_id;

    // Validate required fields
    if (!user_id || !Help_Employee_id || !help_type) {
      return res.status(400).json({
        success: false,
        message: 'User ID, Help Employee ID, and help type are required'
      });
    }

    // Validate user exists
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate help employee exists
    const helpEmployee = await User.findOne({ user_id: Help_Employee_id });
    if (!helpEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Help employee not found'
      });
    }

    const helpCenter = new Help_Center({
      user_id,
      Help_Employee_id,
      help_type: help_type.trim(),
      created_by: userId,
      updated_by: userId
    });

    await helpCenter.save();

    res.status(201).json({
      success: true,
      message: 'Help center created successfully',
      data: helpCenter
    });
  } catch (error) {
    console.error('Error creating help center:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating help center',
      error: error.message
    });
  }
};

// Update Help Center
const updateHelpCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, Help_Employee_id, help_type, status } = req.body;
    const userId = req.user.user_id;

    const helpCenter = await Help_Center.findOne({ Center_id: id });
    
    if (!helpCenter) {
      return res.status(404).json({
        success: false,
        message: 'Help center not found'
      });
    }

    // Validate user if being updated
    if (user_id) {
      const user = await User.findOne({ user_id });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
      helpCenter.user_id = user_id;
    }

    // Validate help employee if being updated
    if (Help_Employee_id) {
      const helpEmployee = await User.findOne({ user_id: Help_Employee_id });
      if (!helpEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Help employee not found'
        });
      }
      helpCenter.Help_Employee_id = Help_Employee_id;
    }

    if (help_type) {
      helpCenter.help_type = help_type.trim();
    }

    if (status !== undefined) {
      helpCenter.status = status;
    }

    helpCenter.updated_by = userId;
    helpCenter.updated_at = new Date();

    await helpCenter.save();

    res.json({
      success: true,
      message: 'Help center updated successfully',
      data: helpCenter
    });
  } catch (error) {
    console.error('Error updating help center:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating help center',
      error: error.message
    });
  }
};

// Get Help Center by ID
const getHelpCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const helpCenter = await Help_Center.findOne({ Center_id: id });
    
    if (!helpCenter) {
      return res.status(404).json({
        success: false,
        message: 'Help center not found'
      });
    }

    res.json({
      success: true,
      data: helpCenter
    });
  } catch (error) {
    console.error('Error getting help center:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting help center',
      error: error.message
    });
  }
};

// Get all Help Centers
const getAllHelpCenters = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, user_id, help_type } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by user ID if provided
    if (user_id) {
      query.user_id = parseInt(user_id);
    }

    // Filter by help type if provided
    if (help_type) {
      query.help_type = { $regex: help_type, $options: 'i' };
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { help_type: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const helpCenters = await Help_Center.paginate(query, options);

    res.json({
      success: true,
      data: helpCenters.docs,
      pagination: {
        totalDocs: helpCenters.totalDocs,
        limit: helpCenters.limit,
        totalPages: helpCenters.totalPages,
        page: helpCenters.page,
        pagingCounter: helpCenters.pagingCounter,
        hasPrevPage: helpCenters.hasPrevPage,
        hasNextPage: helpCenters.hasNextPage,
        prevPage: helpCenters.prevPage,
        nextPage: helpCenters.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting help centers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting help centers',
      error: error.message
    });
  }
};

export {
  createHelpCenter,
  updateHelpCenter,
  getHelpCenterById,
  getAllHelpCenters
}; 