import MembershipPackageMapSubUser from '../models/membership-package-map-sub-user.model.js';
import MembershipPackage from '../models/membership-package.model.js';

// Create membership package map sub-user
const createMembershipPackageMapSubUser = async (req, res) => {
  try {
    const { user_id, membership_package_id, status } = req.body;
    const createdBy = req.user.user_id;

    // Validate required fields
    if (!user_id || !membership_package_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and membership package ID are required'
      });
    }

    // Check if membership package exists
    const membershipPackage = await MembershipPackage.findOne({ 
      membership_package_id: parseInt(membership_package_id) 
    });

    if (!membershipPackage) {
      return res.status(404).json({
        success: false,
        message: 'Membership package not found'
      });
    }

    // Check if user is already mapped to this package
    const existingMapping = await MembershipPackageMapSubUser.findOne({
      user_id: parseInt(user_id),
      membership_package_id: parseInt(membership_package_id),
      status: true
    });

    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message: 'User is already mapped to this membership package'
      });
    }

    // Get current count of active sub-users for this package
    const currentSubUserCount = await MembershipPackageMapSubUser.countDocuments({
      membership_package_id: parseInt(membership_package_id),
      status: true
    });

    // Check if adding this user would exceed the sub_user_limit
    if (currentSubUserCount >= membershipPackage.sub_user_limit) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more sub-users. Package limit (${membershipPackage.sub_user_limit}) has been reached.`
      });
    }

    // Create membership package map sub-user
    const membershipPackageMapSubUser = new MembershipPackageMapSubUser({
      user_id: parseInt(user_id),
      membership_package_id: parseInt(membership_package_id),
      status: status !== undefined ? status : true,
      created_by: createdBy
    });

    const savedMapping = await membershipPackageMapSubUser.save();

    // Update sub_user_limit count in membership package
    const newSubUserCount = currentSubUserCount + 1;
    await MembershipPackage.findOneAndUpdate(
      { membership_package_id: parseInt(membership_package_id) },
      { sub_user_limit: newSubUserCount },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Membership package map sub-user created successfully',
      data: savedMapping
    });
  } catch (error) {
    console.error('Error creating membership package map sub-user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating membership package map sub-user',
      error: error.message
    });
  }
};

// Update membership package map sub-user
const updateMembershipPackageMapSubUser = async (req, res) => {
  try {
    const { package_sub_user_id, user_id, membership_package_id, status } = req.body;
    const updatedBy = req.user.user_id;

    // Validate required fields
    if (!package_sub_user_id) {
      return res.status(400).json({
        success: false,
        message: 'Package sub-user ID is required'
      });
    }

    // Check if mapping exists
    const existingMapping = await MembershipPackageMapSubUser.findOne({ 
      package_sub_user_id: parseInt(package_sub_user_id) 
    });

    if (!existingMapping) {
      return res.status(404).json({
        success: false,
        message: 'Membership package map sub-user not found'
      });
    }

    // Get old membership package info for sub_user_limit update
    const oldMembershipPackageId = existingMapping.membership_package_id;
    const oldStatus = existingMapping.status;

    // If membership_package_id is being changed, validate the new package
    if (membership_package_id && membership_package_id !== oldMembershipPackageId) {
      const newMembershipPackage = await MembershipPackage.findOne({ 
        membership_package_id: parseInt(membership_package_id) 
      });

      if (!newMembershipPackage) {
        return res.status(404).json({
          success: false,
          message: 'New membership package not found'
        });
      }

      // Check if user is already mapped to the new package
      const existingMappingToNewPackage = await MembershipPackageMapSubUser.findOne({
        user_id: existingMapping.user_id,
        membership_package_id: parseInt(membership_package_id),
        status: true,
        package_sub_user_id: { $ne: parseInt(package_sub_user_id) }
      });

      if (existingMappingToNewPackage) {
        return res.status(400).json({
          success: false,
          message: 'User is already mapped to this membership package'
        });
      }

      // Check sub_user_limit for new package
      const newPackageSubUserCount = await MembershipPackageMapSubUser.countDocuments({
        membership_package_id: parseInt(membership_package_id),
        status: true
      });

      if (newPackageSubUserCount >= newMembershipPackage.sub_user_limit) {
        return res.status(400).json({
          success: false,
          message: `Cannot move to new package. Package limit (${newMembershipPackage.sub_user_limit}) has been reached.`
        });
      }
    }

    // Update the mapping
    const updatedMapping = await MembershipPackageMapSubUser.findOneAndUpdate(
      { package_sub_user_id: parseInt(package_sub_user_id) },
      {
        user_id: user_id ? parseInt(user_id) : existingMapping.user_id,
        membership_package_id: membership_package_id ? parseInt(membership_package_id) : existingMapping.membership_package_id,
        status: status !== undefined ? status : existingMapping.status,
        updated_by: updatedBy,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    // Update sub_user_limit counts for old and new packages
    if (oldStatus !== updatedMapping.status || membership_package_id !== oldMembershipPackageId) {
      // Update old package count
      const oldPackageActiveCount = await MembershipPackageMapSubUser.countDocuments({
        membership_package_id: oldMembershipPackageId,
        status: true
      });

      await MembershipPackage.findOneAndUpdate(
        { membership_package_id: oldMembershipPackageId },
        { sub_user_limit: oldPackageActiveCount },
        { new: true }
      );

      // Update new package count if different
      if (membership_package_id && membership_package_id !== oldMembershipPackageId) {
        const newPackageActiveCount = await MembershipPackageMapSubUser.countDocuments({
          membership_package_id: parseInt(membership_package_id),
          status: true
        });

        await MembershipPackage.findOneAndUpdate(
          { membership_package_id: parseInt(membership_package_id) },
          { sub_user_limit: newPackageActiveCount },
          { new: true }
        );
      }
    }

    res.json({
      success: true,
      message: 'Membership package map sub-user updated successfully',
      data: updatedMapping
    });
  } catch (error) {
    console.error('Error updating membership package map sub-user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating membership package map sub-user',
      error: error.message
    });
  }
};

// Get membership package map sub-user by ID
const getMembershipPackageMapSubUserById = async (req, res) => {
  try {
    const { package_sub_user_id } = req.params;
    
    const mapping = await MembershipPackageMapSubUser.findOne({ 
      package_sub_user_id: parseInt(package_sub_user_id) 
    });
    
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Membership package map sub-user not found'
      });
    }

    res.json({
      success: true,
      data: mapping
    });
  } catch (error) {
    console.error('Error getting membership package map sub-user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting membership package map sub-user',
      error: error.message
    });
  }
};

// Get all membership package map sub-users
const getAllMembershipPackageMapSubUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, user_id, membership_package_id, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by user_id if provided
    if (user_id) {
      query.user_id = parseInt(user_id);
    }

    // Filter by membership_package_id if provided
    if (membership_package_id) {
      query.membership_package_id = parseInt(membership_package_id);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const mappings = await MembershipPackageMapSubUser.paginate(query, options);

    res.json({
      success: true,
      data: mappings.docs,
      pagination: {
        totalDocs: mappings.totalDocs,
        limit: mappings.limit,
        totalPages: mappings.totalPages,
        page: mappings.page,
        pagingCounter: mappings.pagingCounter,
        hasPrevPage: mappings.hasPrevPage,
        hasNextPage: mappings.hasNextPage,
        prevPage: mappings.prevPage,
        nextPage: mappings.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting membership package map sub-users:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting membership package map sub-users',
      error: error.message
    });
  }
};

// Get membership package map sub-users by membership package ID
const getMembershipPackageMapSubUsersByPackageId = async (req, res) => {
  try {
    const { membership_package_id } = req.params;
    const { page = 1, limit = 10, status, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {
      membership_package_id: parseInt(membership_package_id)
    };
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const mappings = await MembershipPackageMapSubUser.paginate(query, options);

    res.json({
      success: true,
      data: mappings.docs,
      pagination: {
        totalDocs: mappings.totalDocs,
        limit: mappings.limit,
        totalPages: mappings.totalPages,
        page: mappings.page,
        pagingCounter: mappings.pagingCounter,
        hasPrevPage: mappings.hasPrevPage,
        hasNextPage: mappings.hasNextPage,
        prevPage: mappings.prevPage,
        nextPage: mappings.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting membership package map sub-users by package ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting membership package map sub-users by package ID',
      error: error.message
    });
  }
};

export {
  createMembershipPackageMapSubUser,
  updateMembershipPackageMapSubUser,
  getMembershipPackageMapSubUserById,
  getAllMembershipPackageMapSubUsers,
  getMembershipPackageMapSubUsersByPackageId
}; 