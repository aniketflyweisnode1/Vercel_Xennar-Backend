import PropertySubType from '../models/property-sub-type.model.js';

// Create property sub-type
const createPropertySubType = async (req, res) => {
  try {
    const { property_type_id, property_sub_type, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!property_type_id || !property_sub_type) {
      return res.status(400).json({
        success: false,
        message: 'Property type ID and property sub-type are required'
      });
    }

    // Check if property sub-type already exists
    const existingPropertySubType = await PropertySubType.findOne({ property_sub_type });
    if (existingPropertySubType) {
      return res.status(400).json({
        success: false,
        message: 'Property sub-type already exists'
      });
    }

    const propertySubTypeData = new PropertySubType({
      property_type_id,
      property_sub_type,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedPropertySubType = await propertySubTypeData.save();

    res.status(201).json({
      success: true,
      message: 'Property sub-type created successfully',
      data: savedPropertySubType
    });
  } catch (error) {
    console.error('Create property sub-type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property sub-type',
      error: error.message
    });
  }
};

// Get property sub type by ID
const getPropertySubTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const propertySubType = await PropertySubType.findOne({ property_sub_type_id: id });
    
    if (!propertySubType) {
      return res.status(404).json({
        success: false,
        message: 'Property sub type not found'
      });
    }

    res.json({
      success: true,
      data: propertySubType
    });
  } catch (error) {
    console.error('Error getting property sub type:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property sub type',
      error: error.message
    });
  }
};

// Get all property sub types
const getAllPropertySubTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, property_type_id } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Filter by property type if provided
    if (property_type_id) {
      query.property_type_id = property_type_id;
    }
    
    // Search functionality
    if (search) {
      query.property_sub_type = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const propertySubTypes = await PropertySubType.paginate(query, options);

    res.json({
      success: true,
      data: propertySubTypes.docs,
      pagination: {
        totalDocs: propertySubTypes.totalDocs,
        limit: propertySubTypes.limit,
        totalPages: propertySubTypes.totalPages,
        page: propertySubTypes.page,
        pagingCounter: propertySubTypes.pagingCounter,
        hasPrevPage: propertySubTypes.hasPrevPage,
        hasNextPage: propertySubTypes.hasNextPage,
        prevPage: propertySubTypes.prevPage,
        nextPage: propertySubTypes.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting property sub types:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property sub types',
      error: error.message
    });
  }
};

// Update property sub-type
const updatePropertySubType = async (req, res) => {
  try {
    const { id, property_type_id, property_sub_type, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    // Check if property sub-type exists
    const existingPropertySubType = await PropertySubType.findOne({ property_sub_type_id: id });
    if (!existingPropertySubType) {
      return res.status(404).json({
        success: false,
        message: 'Property sub-type not found'
      });
    }

    // Check if new property sub-type name already exists (if being changed)
    if (property_sub_type && property_sub_type !== existingPropertySubType.property_sub_type) {
      const duplicatePropertySubType = await PropertySubType.findOne({ 
        property_sub_type,
        property_sub_type_id: { $ne: id }
      });
      if (duplicatePropertySubType) {
        return res.status(400).json({
          success: false,
          message: 'Property sub-type name already exists'
        });
      }
    }

    const updateData = {
      property_type_id: property_type_id || existingPropertySubType.property_type_id,
      property_sub_type: property_sub_type || existingPropertySubType.property_sub_type,
      status: status !== undefined ? status : existingPropertySubType.status,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedPropertySubType = await PropertySubType.findOneAndUpdate(
      { property_sub_type_id: id },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Property sub-type updated successfully',
      data: updatedPropertySubType
    });
  } catch (error) {
    console.error('Update property sub-type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property sub-type',
      error: error.message
    });
  }
};

export {
  createPropertySubType,
  getPropertySubTypeById,
  getAllPropertySubTypes,
  updatePropertySubType
}; 