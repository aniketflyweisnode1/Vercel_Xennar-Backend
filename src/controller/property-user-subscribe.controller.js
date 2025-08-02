import PropertyUserSubscribe from '../models/property-user-subscribe.model.js';

// Create property user subscribe
const createPropertyUserSubscribe = async (req, res) => {
  try {
    const { property_user_subscribe, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!property_user_subscribe) {
      return res.status(400).json({
        success: false,
        message: 'Property user subscribe is required'
      });
    }

    // Check if property user subscribe already exists
    const existingPropertyUserSubscribe = await PropertyUserSubscribe.findOne({ property_user_subscribe });
    if (existingPropertyUserSubscribe) {
      return res.status(400).json({
        success: false,
        message: 'Property user subscribe already exists'
      });
    }

    const propertyUserSubscribeData = new PropertyUserSubscribe({
      property_user_subscribe,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedPropertyUserSubscribe = await propertyUserSubscribeData.save();

    res.status(201).json({
      success: true,
      message: 'Property user subscribe created successfully',
      data: savedPropertyUserSubscribe
    });
  } catch (error) {
    console.error('Create property user subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property user subscribe',
      error: error.message
    });
  }
};

// Get property user subscribe by ID
const getPropertyUserSubscribeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const propertyUserSubscribe = await PropertyUserSubscribe.findOne({ property_user_subscribe_id: id })
      
      ;
    
    if (!propertyUserSubscribe) {
      return res.status(404).json({
        success: false,
        message: 'Property user subscribe not found'
      });
    }

    res.json({
      success: true,
      data: propertyUserSubscribe
    });
  } catch (error) {
    console.error('Error getting property user subscribe:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property user subscribe',
      error: error.message
    });
  }
};

// Get all property user subscribes
const getAllPropertyUserSubscribes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.property_user_subscribe = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      
      sort: { created_at: -1 }
    };

    const propertyUserSubscribes = await PropertyUserSubscribe.paginate(query, options);

    res.json({
      success: true,
      data: propertyUserSubscribes.docs,
      pagination: {
        totalDocs: propertyUserSubscribes.totalDocs,
        limit: propertyUserSubscribes.limit,
        totalPages: propertyUserSubscribes.totalPages,
        page: propertyUserSubscribes.page,
        pagingCounter: propertyUserSubscribes.pagingCounter,
        hasPrevPage: propertyUserSubscribes.hasPrevPage,
        hasNextPage: propertyUserSubscribes.hasNextPage,
        prevPage: propertyUserSubscribes.prevPage,
        nextPage: propertyUserSubscribes.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting property user subscribes:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property user subscribes',
      error: error.message
    });
  }
};

// Update property user subscribe
const updatePropertyUserSubscribe = async (req, res) => {
  try {
    const { id, property_user_subscribe, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    // Check if property user subscribe exists
    const existingPropertyUserSubscribe = await PropertyUserSubscribe.findOne({ property_user_subscribe_id: id });
    if (!existingPropertyUserSubscribe) {
      return res.status(404).json({
        success: false,
        message: 'Property user subscribe not found'
      });
    }

    // Check if new property user subscribe name already exists (if being changed)
    if (property_user_subscribe && property_user_subscribe !== existingPropertyUserSubscribe.property_user_subscribe) {
      const duplicatePropertyUserSubscribe = await PropertyUserSubscribe.findOne({ 
        property_user_subscribe,
        property_user_subscribe_id: { $ne: id }
      });
      if (duplicatePropertyUserSubscribe) {
        return res.status(400).json({
          success: false,
          message: 'Property user subscribe name already exists'
        });
      }
    }

    const updateData = {
      property_user_subscribe: property_user_subscribe || existingPropertyUserSubscribe.property_user_subscribe,
      status: status !== undefined ? status : existingPropertyUserSubscribe.status,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedPropertyUserSubscribe = await PropertyUserSubscribe.findOneAndUpdate(
      { property_user_subscribe_id: id },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Property user subscribe updated successfully',
      data: updatedPropertyUserSubscribe
    });
  } catch (error) {
    console.error('Update property user subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property user subscribe',
      error: error.message
    });
  }
};

export {
  createPropertyUserSubscribe,
  getPropertyUserSubscribeById,
  getAllPropertyUserSubscribes,
  updatePropertyUserSubscribe
}; 