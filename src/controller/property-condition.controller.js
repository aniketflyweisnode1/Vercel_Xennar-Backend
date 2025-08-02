import PropertyCondition from '../models/property-condition.model.js';

// Create property condition
const createPropertyCondition = async (req, res) => {
  try {
    const { property_condition, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!property_condition) {
      return res.status(400).json({
        success: false,
        message: 'Property condition is required'
      });
    }

    // Check if property condition already exists
    const existingPropertyCondition = await PropertyCondition.findOne({ property_condition });
    if (existingPropertyCondition) {
      return res.status(400).json({
        success: false,
        message: 'Property condition already exists'
      });
    }

    const propertyConditionData = new PropertyCondition({
      property_condition,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedPropertyCondition = await propertyConditionData.save();

    res.status(201).json({
      success: true,
      message: 'Property condition created successfully',
      data: savedPropertyCondition
    });
  } catch (error) {
    console.error('Create property condition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property condition',
      error: error.message
    });
  }
};

// Get property condition by ID
const getPropertyConditionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const propertyCondition = await PropertyCondition.findOne({ property_condition_id: id })
      
      ;
    
    if (!propertyCondition) {
      return res.status(404).json({
        success: false,
        message: 'Property condition not found'
      });
    }

    res.json({
      success: true,
      data: propertyCondition
    });
  } catch (error) {
    console.error('Error getting property condition:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property condition',
      error: error.message
    });
  }
};

// Get all property conditions
const getAllPropertyConditions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.property_condition = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const propertyConditions = await PropertyCondition.paginate(query, options);

    res.json({
      success: true,
      data: propertyConditions.docs,
      pagination: {
        totalDocs: propertyConditions.totalDocs,
        limit: propertyConditions.limit,
        totalPages: propertyConditions.totalPages,
        page: propertyConditions.page,
        pagingCounter: propertyConditions.pagingCounter,
        hasPrevPage: propertyConditions.hasPrevPage,
        hasNextPage: propertyConditions.hasNextPage,
        prevPage: propertyConditions.prevPage,
        nextPage: propertyConditions.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting property conditions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property conditions',
      error: error.message
    });
  }
};

// Update property condition
const updatePropertyCondition = async (req, res) => {
  try {
    const { id, property_condition, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    // Check if property condition exists
    const existingPropertyCondition = await PropertyCondition.findOne({ property_condition_id: id });
    if (!existingPropertyCondition) {
      return res.status(404).json({
        success: false,
        message: 'Property condition not found'
      });
    }

    // Check if new property condition name already exists (if being changed)
    if (property_condition && property_condition !== existingPropertyCondition.property_condition) {
      const duplicatePropertyCondition = await PropertyCondition.findOne({ 
        property_condition,
        property_condition_id: { $ne: id }
      });
      if (duplicatePropertyCondition) {
        return res.status(400).json({
          success: false,
          message: 'Property condition name already exists'
        });
      }
    }

    const updateData = {
      property_condition: property_condition || existingPropertyCondition.property_condition,
      status: status !== undefined ? status : existingPropertyCondition.status,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedPropertyCondition = await PropertyCondition.findOneAndUpdate(
      { property_condition_id: id },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Property condition updated successfully',
      data: updatedPropertyCondition
    });
  } catch (error) {
    console.error('Update property condition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property condition',
      error: error.message
    });
  }
};

export {
  createPropertyCondition,
  getPropertyConditionById,
  getAllPropertyConditions,
  updatePropertyCondition
}; 