import PropertyType from '../models/property-type.model.js';

// Create property type
const createPropertyType = async (req, res) => {
  try {
    const { property_type, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!property_type) {
      return res.status(400).json({
        success: false,
        message: 'Property type is required'
      });
    }

    // Check if property type already exists
    const existingPropertyType = await PropertyType.findOne({ property_type });
    if (existingPropertyType) {
      return res.status(400).json({
        success: false,
        message: 'Property type already exists'
      });
    }

    const propertyTypeData = new PropertyType({
      property_type,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedPropertyType = await propertyTypeData.save();

    res.status(201).json({
      success: true,
      message: 'Property type created successfully',
      data: savedPropertyType
    });
  } catch (error) {
    console.error('Create property type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property type',
      error: error.message
    });
  }
};

// Get property type by ID
const getPropertyTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const propertyType = await PropertyType.findOne({ property_type_id: id });
    
    if (!propertyType) {
      return res.status(404).json({
        success: false,
        message: 'Property type not found'
      });
    }

    res.json({
      success: true,
      data: propertyType
    });
  } catch (error) {
    console.error('Error getting property type:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property type',
      error: error.message
    });
  }
};

// Get all property types
const getAllPropertyTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.property_type = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const propertyTypes = await PropertyType.paginate(query, options);

    res.json({
      success: true,
      data: propertyTypes.docs,
      pagination: {
        totalDocs: propertyTypes.totalDocs,
        limit: propertyTypes.limit,
        totalPages: propertyTypes.totalPages,
        page: propertyTypes.page,
        pagingCounter: propertyTypes.pagingCounter,
        hasPrevPage: propertyTypes.hasPrevPage,
        hasNextPage: propertyTypes.hasNextPage,
        prevPage: propertyTypes.prevPage,
        nextPage: propertyTypes.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting property types:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property types',
      error: error.message
    });
  }
};

// Update property type
const updatePropertyType = async (req, res) => {
  try {
    const { id, property_type, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    // Check if property type exists
    const existingPropertyType = await PropertyType.findOne({ property_type_id: id });
    if (!existingPropertyType) {
      return res.status(404).json({
        success: false,
        message: 'Property type not found'
      });
    }

    // Check if new property type name already exists (if being changed)
    if (property_type && property_type !== existingPropertyType.property_type) {
      const duplicatePropertyType = await PropertyType.findOne({ 
        property_type,
        property_type_id: { $ne: id }
      });
      if (duplicatePropertyType) {
        return res.status(400).json({
          success: false,
          message: 'Property type name already exists'
        });
      }
    }

    const updateData = {
      property_type: property_type || existingPropertyType.property_type,
      status: status !== undefined ? status : existingPropertyType.status,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedPropertyType = await PropertyType.findOneAndUpdate(
      { property_type_id: id },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Property type updated successfully',
      data: updatedPropertyType
    });
  } catch (error) {
    console.error('Update property type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property type',
      error: error.message
    });
  }
};

export {
  createPropertyType,
  getPropertyTypeById,
  getAllPropertyTypes,
  updatePropertyType
}; 