import VehicleType from '../models/vehicle-type.model.js';

// Create vehicle type
export const createVehicleType = async (req, res) => {
  try {
    const { type_name } = req.body;
    const user_id = req.user.user_id;

    if (!type_name) {
      return res.status(400).json({
        success: false,
        message: 'Type name is required'
      });
    }

    // Check if vehicle type already exists
    const existingVehicleType = await VehicleType.findOne({ type_name });
    if (existingVehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type with this name already exists'
      });
    }

    const vehicleType = new VehicleType({
      type_name,
      created_by: user_id
    });

    const savedVehicleType = await vehicleType.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle type created successfully',
      data: savedVehicleType
    });
  } catch (error) {
    console.error('Error creating vehicle type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update vehicle type
export const updateVehicleType = async (req, res) => {
  try {
   
    const { vehicletype_id, type_name, status } = req.body;
    const user_id = req.user.user_id;

    if (!vehicletype_id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type ID is required'
      });
    }

    const vehicleType = await VehicleType.findOne({ vehicletype_id });
    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle type not found'
      });
    }

    // Check if new name already exists (excluding current record)
    if (type_name && type_name !== vehicleType.type_name) {
      const existingVehicleType = await VehicleType.findOne({ 
        type_name, 
        vehicletype_id: { $ne: vehicletype_id } 
      });
      if (existingVehicleType) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle type with this name already exists'
        });
      }
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    if (type_name) updateData.type_name = type_name;
    if (status !== undefined) updateData.status = status;

    const updatedVehicleType = await VehicleType.findOneAndUpdate(
      { vehicletype_id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Vehicle type updated successfully',
      data: updatedVehicleType
    });
  } catch (error) {
    console.error('Error updating vehicle type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vehicle type by ID
export const getVehicleTypeById = async (req, res) => {
  try {
    const { vehicletype_id } = req.params;

    if (!vehicletype_id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type ID is required'
      });
    }

    const vehicleType = await VehicleType.findOne({ vehicletype_id });
    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicleType
    });
  } catch (error) {
    console.error('Error getting vehicle type by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all vehicle types
export const getAllVehicleTypes = async (req, res) => {
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

    const result = await VehicleType.paginate(query, options);

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
    console.error('Error getting all vehicle types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 