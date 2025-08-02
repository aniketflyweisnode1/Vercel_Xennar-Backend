import AppSubscribePackage from '../models/app-subscribe-package.model.js';

// Create app subscribe package
const createAppSubscribePackage = async (req, res) => {
  try {
    const { app_subscribe_package, description, price, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!app_subscribe_package) {
      return res.status(400).json({
        success: false,
        message: 'App subscribe package is required'
      });
    }

    // Check if app subscribe package already exists
    const existingAppSubscribePackage = await AppSubscribePackage.findOne({ app_subscribe_package });
    if (existingAppSubscribePackage) {
      return res.status(400).json({
        success: false,
        message: 'App subscribe package already exists'
      });
    }

    const appSubscribePackageData = new AppSubscribePackage({
      app_subscribe_package,
      description: description || '',
      price: price || 0,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedAppSubscribePackage = await appSubscribePackageData.save();

    res.status(201).json({
      success: true,
      message: 'App subscribe package created successfully',
      data: savedAppSubscribePackage
    });
  } catch (error) {
    console.error('Create app subscribe package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating app subscribe package',
      error: error.message
    });
  }
};

// Get app subscribe package by ID
const getAppSubscribePackageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appSubscribePackage = await AppSubscribePackage.findOne({ app_subscribe_package_id: id })
      
      ;
    
    if (!appSubscribePackage) {
      return res.status(404).json({
        success: false,
        message: 'App subscribe package not found'
      });
    }

    res.json({
      success: true,
      data: appSubscribePackage
    });
  } catch (error) {
    console.error('Error getting app subscribe package:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting app subscribe package',
      error: error.message
    });
  }
};

// Get all app subscribe packages
const getAllAppSubscribePackages = async (req, res) => {
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
        { app_subscribe_package: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const appSubscribePackages = await AppSubscribePackage.paginate(query, options);

    res.json({
      success: true,
      data: appSubscribePackages.docs,
      pagination: {
        totalDocs: appSubscribePackages.totalDocs,
        limit: appSubscribePackages.limit,
        totalPages: appSubscribePackages.totalPages,
        page: appSubscribePackages.page,
        pagingCounter: appSubscribePackages.pagingCounter,
        hasPrevPage: appSubscribePackages.hasPrevPage,
        hasNextPage: appSubscribePackages.hasNextPage,
        prevPage: appSubscribePackages.prevPage,
        nextPage: appSubscribePackages.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting app subscribe packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting app subscribe packages',
      error: error.message
    });
  }
};

// Update app subscribe package
const updateAppSubscribePackage = async (req, res) => {
  try {
    const { id, app_subscribe_package, description, price, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    // Check if app subscribe package exists
    const existingAppSubscribePackage = await AppSubscribePackage.findOne({ app_subscribe_package_id: id });
    if (!existingAppSubscribePackage) {
      return res.status(404).json({
        success: false,
        message: 'App subscribe package not found'
      });
    }

    // Check if new app subscribe package name already exists (if being changed)
    if (app_subscribe_package && app_subscribe_package !== existingAppSubscribePackage.app_subscribe_package) {
      const duplicateAppSubscribePackage = await AppSubscribePackage.findOne({ 
        app_subscribe_package,
        app_subscribe_package_id: { $ne: id }
      });
      if (duplicateAppSubscribePackage) {
        return res.status(400).json({
          success: false,
          message: 'App subscribe package name already exists'
        });
      }
    }

    const updateData = {
      app_subscribe_package: app_subscribe_package || existingAppSubscribePackage.app_subscribe_package,
      description: description !== undefined ? description : existingAppSubscribePackage.description,
      price: price !== undefined ? price : existingAppSubscribePackage.price,
      status: status !== undefined ? status : existingAppSubscribePackage.status,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedAppSubscribePackage = await AppSubscribePackage.findOneAndUpdate(
      { app_subscribe_package_id: id },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'App subscribe package updated successfully',
      data: updatedAppSubscribePackage
    });
  } catch (error) {
    console.error('Update app subscribe package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating app subscribe package',
      error: error.message
    });
  }
};

export {
  createAppSubscribePackage,
  getAppSubscribePackageById,
  getAllAppSubscribePackages,
  updateAppSubscribePackage
}; 