import PropertyWashroom from '../models/property-washroom.model.js';

// Create property washroom
const createPropertyWashroom = async (req, res) => {
  try {
    const { property_washroom, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!property_washroom) {
      return res.status(400).json({
        success: false,
        message: 'Property washroom is required'
      });
    }

    // Check if property washroom already exists
    const existingPropertyWashroom = await PropertyWashroom.findOne({ property_washroom });
    if (existingPropertyWashroom) {
      return res.status(400).json({
        success: false,
        message: 'Property washroom already exists'
      });
    }

    const propertyWashroomData = new PropertyWashroom({
      property_washroom,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedPropertyWashroom = await propertyWashroomData.save();

    res.status(201).json({
      success: true,
      message: 'Property washroom created successfully',
      data: savedPropertyWashroom
    });
  } catch (error) {
    console.error('Create property washroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property washroom',
      error: error.message
    });
  }
};

// Get property washroom by ID
const getPropertyWashroomById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const propertyWashroom = await PropertyWashroom.findOne({ property_washroom_id: id });
    
    if (!propertyWashroom) {
      return res.status(404).json({
        success: false,
        message: 'Property washroom not found'
      });
    }

    res.json({
      success: true,
      data: propertyWashroom
    });
  } catch (error) {
    console.error('Error getting property washroom:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property washroom',
      error: error.message
    });
  }
};

// Get all property washrooms
const getAllPropertyWashrooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.property_washroom = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const propertyWashrooms = await PropertyWashroom.paginate(query, options);

    res.json({
      success: true,
      data: propertyWashrooms.docs,
      pagination: {
        totalDocs: propertyWashrooms.totalDocs,
        limit: propertyWashrooms.limit,
        totalPages: propertyWashrooms.totalPages,
        page: propertyWashrooms.page,
        pagingCounter: propertyWashrooms.pagingCounter,
        hasPrevPage: propertyWashrooms.hasPrevPage,
        hasNextPage: propertyWashrooms.hasNextPage,
        prevPage: propertyWashrooms.prevPage,
        nextPage: propertyWashrooms.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting property washrooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property washrooms',
      error: error.message
    });
  }
};

// Update property washroom
const updatePropertyWashroom = async (req, res) => {
  try {
    const { id, property_washroom, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    // Check if property washroom exists
    const existingPropertyWashroom = await PropertyWashroom.findOne({ property_washroom_id: id });
    if (!existingPropertyWashroom) {
      return res.status(404).json({
        success: false,
        message: 'Property washroom not found'
      });
    }

    // Check if new property washroom name already exists (if being changed)
    if (property_washroom && property_washroom !== existingPropertyWashroom.property_washroom) {
      const duplicatePropertyWashroom = await PropertyWashroom.findOne({ 
        property_washroom,
        property_washroom_id: { $ne: id }
      });
      if (duplicatePropertyWashroom) {
        return res.status(400).json({
          success: false,
          message: 'Property washroom name already exists'
        });
      }
    }

    const updateData = {
      property_washroom: property_washroom || existingPropertyWashroom.property_washroom,
      status: status !== undefined ? status : existingPropertyWashroom.status,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedPropertyWashroom = await PropertyWashroom.findOneAndUpdate(
      { property_washroom_id: id },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Property washroom updated successfully',
      data: updatedPropertyWashroom
    });
  } catch (error) {
    console.error('Update property washroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property washroom',
      error: error.message
    });
  }
};

export {
  createPropertyWashroom,
  getPropertyWashroomById,
  getAllPropertyWashrooms,
  updatePropertyWashroom
}; 