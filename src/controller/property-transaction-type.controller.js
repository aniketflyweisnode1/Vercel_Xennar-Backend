import PropertyTransactionType from '../models/property-transaction-type.model.js';

// Create property transaction type
const createPropertyTransactionType = async (req, res) => {
  try {
    const { property_transaction_type, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!property_transaction_type) {
      return res.status(400).json({
        success: false,
        message: 'Property transaction type is required'
      });
    }

    // Check if property transaction type already exists
    const existingPropertyTransactionType = await PropertyTransactionType.findOne({ property_transaction_type });
    if (existingPropertyTransactionType) {
      return res.status(400).json({
        success: false,
        message: 'Property transaction type already exists'
      });
    }

    const propertyTransactionTypeData = new PropertyTransactionType({
      property_transaction_type,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedPropertyTransactionType = await propertyTransactionTypeData.save();

    res.status(201).json({
      success: true,
      message: 'Property transaction type created successfully',
      data: savedPropertyTransactionType
    });
  } catch (error) {
    console.error('Create property transaction type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property transaction type',
      error: error.message
    });
  }
};

// Get property transaction type by ID
const getPropertyTransactionTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const propertyTransactionType = await PropertyTransactionType.findOne({ property_transaction_type_id: id });
    
    if (!propertyTransactionType) {
      return res.status(404).json({
        success: false,
        message: 'Property transaction type not found'
      });
    }

    res.json({
      success: true,
      data: propertyTransactionType
    });
  } catch (error) {
    console.error('Error getting property transaction type:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property transaction type',
      error: error.message
    });
  }
};

// Get all property transaction types
const getAllPropertyTransactionTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.property_transaction_type = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const propertyTransactionTypes = await PropertyTransactionType.paginate(query, options);

    res.json({
      success: true,
      data: propertyTransactionTypes.docs,
      pagination: {
        totalDocs: propertyTransactionTypes.totalDocs,
        limit: propertyTransactionTypes.limit,
        totalPages: propertyTransactionTypes.totalPages,
        page: propertyTransactionTypes.page,
        pagingCounter: propertyTransactionTypes.pagingCounter,
        hasPrevPage: propertyTransactionTypes.hasPrevPage,
        hasNextPage: propertyTransactionTypes.hasNextPage,
        prevPage: propertyTransactionTypes.prevPage,
        nextPage: propertyTransactionTypes.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting property transaction types:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property transaction types',
      error: error.message
    });
  }
};

// Update property transaction type
const updatePropertyTransactionType = async (req, res) => {
  try {
    const { id, property_transaction_type, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    // Check if property transaction type exists
    const existingPropertyTransactionType = await PropertyTransactionType.findOne({ property_transaction_type_id: id });
    if (!existingPropertyTransactionType) {
      return res.status(404).json({
        success: false,
        message: 'Property transaction type not found'
      });
    }

    // Check if new property transaction type name already exists (if being changed)
    if (property_transaction_type && property_transaction_type !== existingPropertyTransactionType.property_transaction_type) {
      const duplicatePropertyTransactionType = await PropertyTransactionType.findOne({ 
        property_transaction_type,
        property_transaction_type_id: { $ne: id }
      });
      if (duplicatePropertyTransactionType) {
        return res.status(400).json({
          success: false,
          message: 'Property transaction type name already exists'
        });
      }
    }

    const updateData = {
      property_transaction_type: property_transaction_type || existingPropertyTransactionType.property_transaction_type,
      status: status !== undefined ? status : existingPropertyTransactionType.status,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedPropertyTransactionType = await PropertyTransactionType.findOneAndUpdate(
      { property_transaction_type_id: id },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Property transaction type updated successfully',
      data: updatedPropertyTransactionType
    });
  } catch (error) {
    console.error('Update property transaction type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property transaction type',
      error: error.message
    });
  }
};

export {
  createPropertyTransactionType,
  getPropertyTransactionTypeById,
  getAllPropertyTransactionTypes,
  updatePropertyTransactionType
}; 