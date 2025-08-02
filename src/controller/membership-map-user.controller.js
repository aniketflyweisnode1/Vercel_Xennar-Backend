import MembershipMapUser from '../models/membership-map-user.model.js';


// Create membership map user
const createMembershipMapUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { package_id, user_id, status } = req.body;

    if (!package_id) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required'
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const mapData = {
      package_id: parseInt(package_id),
      user_id: parseInt(user_id),
      status: status !== undefined ? status : true,
      created_by: userId
    };

    const membershipMapUser = new MembershipMapUser(mapData);
    const savedMap = await membershipMapUser.save();

    res.status(201).json({
      success: true,
      message: 'Membership map user created successfully',
      data: savedMap
    });
  } catch (error) {
    console.error('Create membership map user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating membership map user',
      error: error.message
    });
  }
};

// Update membership map user
const updateMembershipMapUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const { Id, package_id, user_id, status } = req.body;
    
    // Use ID from body if provided, otherwise use from params
    const id = Id;

    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (package_id !== undefined) {
      updateData.package_id = parseInt(package_id);
    }

    if (user_id !== undefined) {
      updateData.user_id = parseInt(user_id);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedMap = await MembershipMapUser.findOneAndUpdate(
      { membership_map_id: parseInt(id) },
      updateData,
      { new: true }
    );

    if (!updatedMap) {
      return res.status(404).json({
        success: false,
        message: 'Membership map user not found'
      });
    }

    res.json({
      success: true,
      message: 'Membership map user updated successfully',
      data: updatedMap
    });
  } catch (error) {
    console.error('Update membership map user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating membership map user',
      error: error.message
    });
  }
};

// Get membership map user by ID
const getMembershipMapUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const membershipMapUser = await MembershipMapUser.findOne({ membership_map_id: parseInt(id) });

    if (!membershipMapUser) {
      return res.status(404).json({
        success: false,
        message: 'Membership map user not found'
      });
    }

    res.json({
      success: true,
      data: membershipMapUser
    });
  } catch (error) {
    console.error('Error getting membership map user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting membership map user by ID',
      error: error.message
    });
  }
};

// Get all membership map users
const getAllMembershipMapUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, package_id, user_id, search } = req.query;
    
    const query = {};
    
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    if (package_id) {
      query.package_id = parseInt(package_id);
    }
    
    if (user_id) {
      query.user_id = parseInt(user_id);
    }
    
    if (search) {
      query.$or = [
        { package_id: { $regex: search, $options: 'i' } },
        { user_id: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const maps = await MembershipMapUser.paginate(query, options);

    res.json({
      success: true,
      message: `Found ${maps.docs.length} membership map users`,
      data: maps.docs,
      count: maps.totalDocs,
      pagination: {
        totalDocs: maps.totalDocs,
        limit: maps.limit,
        totalPages: maps.totalPages,
        page: maps.page,
        pagingCounter: maps.pagingCounter,
        hasPrevPage: maps.hasPrevPage,
        hasNextPage: maps.hasNextPage,
        prevPage: maps.prevPage,
        nextPage: maps.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting all membership map users:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all membership map users',
      error: error.message
    });
  }
};

// Get active memberships for authenticated user
const getActiveMemberships = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Get all active memberships for the authenticated user
    const activeMemberships = await MembershipMapUser.find({
      user_id: user_id,
      membership_status: 'active'
    })
    .populate({ 
      path: 'package_id', 
      select: 'package_name duration price description features status',
      localField: 'package_id', 
      foreignField: 'package_id' 
    })
    .populate({ 
      path: 'user_id', 
      select: 'name email phone status',
      localField: 'user_id', 
      foreignField: 'user_id' 
    })
    .populate({ 
      path: 'created_by', 
      select: 'name email',
      localField: 'created_by', 
      foreignField: 'user_id' 
    })
    .populate({ 
      path: 'updated_by', 
      select: 'name email',
      localField: 'updated_by', 
      foreignField: 'user_id' 
    })
    .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      message: `Found ${activeMemberships.length} active memberships`,
      data: activeMemberships
    });
  } catch (error) {
    console.error('Error getting active memberships:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting active memberships',
      error: error.message
    });
  }
};

export {
  createMembershipMapUser,
  updateMembershipMapUser,
  getMembershipMapUserById,
  getAllMembershipMapUsers,
  getActiveMemberships
}; 