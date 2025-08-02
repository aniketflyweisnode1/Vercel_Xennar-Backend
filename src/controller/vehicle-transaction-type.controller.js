import VehicleTransactionType from '../models/vehicle-transaction-type.model.js';

// Create vehicle transaction type
export const createVehicleTransactionType = async (req, res) => {
  try {
    const { type_name } = req.body;
    const user_id = req.user.user_id;

    if (!type_name) {
      return res.status(400).json({
        success: false,
        message: 'Type name is required'
      });
    }

    // Check if vehicle transaction type already exists
    const existingVehicleTransactionType = await VehicleTransactionType.findOne({ type_name });
    if (existingVehicleTransactionType) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle transaction type with this name already exists'
      });
    }

    const vehicleTransactionType = new VehicleTransactionType({
      type_name,
      created_by: user_id
    });

    const savedVehicleTransactionType = await vehicleTransactionType.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle transaction type created successfully',
      data: savedVehicleTransactionType
    });
  } catch (error) {
    console.error('Error creating vehicle transaction type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update vehicle transaction type
export const updateVehicleTransactionType = async (req, res) => {
  try {
    const { vehicleTransactiontype_id, type_name, status } = req.body;
    const user_id = req.user.user_id;

    if (!vehicleTransactiontype_id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle transaction type ID is required'
      });
    }

    const vehicleTransactionType = await VehicleTransactionType.findOne({ vehicleTransactiontype_id });
    if (!vehicleTransactionType) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle transaction type not found'
      });
    }

    // Check if new name already exists (excluding current record)
    if (type_name && type_name !== vehicleTransactionType.type_name) {
      const existingVehicleTransactionType = await VehicleTransactionType.findOne({ 
        type_name, 
        vehicleTransactiontype_id: { $ne: vehicleTransactiontype_id } 
      });
      if (existingVehicleTransactionType) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle transaction type with this name already exists'
        });
      }
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    if (type_name) updateData.type_name = type_name;
    if (status !== undefined) updateData.status = status;

    const updatedVehicleTransactionType = await VehicleTransactionType.findOneAndUpdate(
      { vehicleTransactiontype_id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Vehicle transaction type updated successfully',
      data: updatedVehicleTransactionType
    });
  } catch (error) {
    console.error('Error updating vehicle transaction type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vehicle transaction type by ID
export const getVehicleTransactionTypeById = async (req, res) => {
  try {
    const { vehicleTransactiontype_id } = req.params;

    if (!vehicleTransactiontype_id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle transaction type ID is required'
      });
    }

    const vehicleTransactionType = await VehicleTransactionType.findOne({ vehicleTransactiontype_id });
    if (!vehicleTransactionType) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle transaction type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicleTransactionType
    });
  } catch (error) {
    console.error('Error getting vehicle transaction type by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all vehicle transaction types
export const getAllVehicleTransactionTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    // Filter by status
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Search by type name
    if (search) {
      query.type_name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const result = await VehicleTransactionType.paginate(query, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      pagination: {
        totalDocs: result.totalDocs,
        limit: result.limit,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error getting all vehicle transaction types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 