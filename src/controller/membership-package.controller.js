import MembershipPackage from '../models/membership-package.model.js';

// Create membership package
const createMembershipPackage = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { package_name, amount, duration, sub_user_limit, status } = req.body;

    if (!package_name) {
      return res.status(400).json({
        success: false,
        message: 'Package name is required'
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    if (sub_user_limit !== undefined && sub_user_limit < 0) {
      return res.status(400).json({
        success: false,
        message: 'Sub user limit must be 0 or greater'
      });
    }

    const packageData = {
      package_name,
      amount,
      duration,
      sub_user_limit: sub_user_limit !== undefined ? sub_user_limit : 0,
      status: status !== undefined ? status : true,
      created_by: userId
    };

    const membershipPackage = new MembershipPackage(packageData);
    const savedPackage = await membershipPackage.save();

    res.status(201).json({
      success: true,
      message: 'Membership package created successfully',
      data: savedPackage
    });
  } catch (error) {
    console.error('Create membership package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating membership package',
      error: error.message
    });
  }
};

// Update membership package
const updateMembershipPackage = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id, package_name, amount, duration, sub_user_limit, status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required in request body'
      });
    }

    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (package_name !== undefined) {
      updateData.package_name = package_name;
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }
      updateData.amount = amount;
    }

    if (duration !== undefined) {
      updateData.duration = duration;
    }

    if (sub_user_limit !== undefined) {
      if (sub_user_limit < 0) {
        return res.status(400).json({
          success: false,
          message: 'Sub user limit must be 0 or greater'
        });
      }
      updateData.sub_user_limit = sub_user_limit;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedPackage = await MembershipPackage.findOneAndUpdate(
      { package_id: parseInt(id) },
      updateData,
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: 'Membership package not found'
      });
    }

    res.json({
      success: true,
      message: 'Membership package updated successfully',
      data: updatedPackage
    });
  } catch (error) {
    console.error('Update membership package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating membership package',
      error: error.message
    });
  }
};

// Get membership package by ID
const getMembershipPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const membershipPackage = await MembershipPackage.findOne({ package_id: parseInt(id) });

    if (!membershipPackage) {
      return res.status(404).json({
        success: false,
        message: 'Membership package not found'
      });
    }

    res.json({
      success: true,
      data: membershipPackage
    });
  } catch (error) {
    console.error('Error getting membership package by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting membership package by ID',
      error: error.message
    });
  }
};

// Get all membership packages
const getAllMembershipPackages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sub_user_limit } = req.query;
    
    const query = {};
    
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    if (search) {
      query.package_name = { $regex: search, $options: 'i' };
    }

    if (sub_user_limit !== undefined) {
      query.sub_user_limit = parseInt(sub_user_limit);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const packages = await MembershipPackage.paginate(query, options);

    res.json({
      success: true,
      message: `Found ${packages.docs.length} membership packages`,
      data: packages.docs,
      count: packages.totalDocs,
      pagination: {
        totalDocs: packages.totalDocs,
        limit: packages.limit,
        totalPages: packages.totalPages,
        page: packages.page,
        pagingCounter: packages.pagingCounter,
        hasPrevPage: packages.hasPrevPage,
        hasNextPage: packages.hasNextPage,
        prevPage: packages.prevPage,
        nextPage: packages.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting all membership packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all membership packages',
      error: error.message
    });
  }
};

export {
  createMembershipPackage,
  updateMembershipPackage,
  getMembershipPackageById,
  getAllMembershipPackages
}; 