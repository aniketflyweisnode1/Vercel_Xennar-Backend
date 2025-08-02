import FuelType from '../models/fuel-type.model.js';

// Create fuel type
export const createFuelType = async (req, res) => {
  try {
    const { fuelType_name } = req.body;
    const user_id = req.user.user_id;

    if (!fuelType_name) {
      return res.status(400).json({
        success: false,
        message: 'Fuel type name is required'
      });
    }

    // Check if fuel type already exists
    const existingFuelType = await FuelType.findOne({ fuelType_name });
    if (existingFuelType) {
      return res.status(400).json({
        success: false,
        message: 'Fuel type with this name already exists'
      });
    }

    const fuelType = new FuelType({
      fuelType_name,
      created_by: user_id
    });

    const savedFuelType = await fuelType.save();

    res.status(201).json({
      success: true,
      message: 'Fuel type created successfully',
      data: savedFuelType
    });
  } catch (error) {
    console.error('Error creating fuel type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update fuel type
export const updateFuelType = async (req, res) => {
  try {
   
    const {fuelType_id, fuelType_name, status } = req.body;
    const user_id = req.user.user_id;

    if (!fuelType_id) {
      return res.status(400).json({
        success: false,
        message: 'Fuel type ID is required'
      });
    }

    const fuelType = await FuelType.findOne({ fuelType_id });
    if (!fuelType) {
      return res.status(404).json({
        success: false,
        message: 'Fuel type not found'
      });
    }

    // Check if new name already exists (excluding current record)
    if (fuelType_name && fuelType_name !== fuelType.fuelType_name) {
      const existingFuelType = await FuelType.findOne({ 
        fuelType_name, 
        fuelType_id: { $ne: fuelType_id } 
      });
      if (existingFuelType) {
        return res.status(400).json({
          success: false,
          message: 'Fuel type with this name already exists'
        });
      }
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    if (fuelType_name) updateData.fuelType_name = fuelType_name;
    if (status !== undefined) updateData.status = status;

    const updatedFuelType = await FuelType.findOneAndUpdate(
      { fuelType_id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Fuel type updated successfully',
      data: updatedFuelType
    });
  } catch (error) {
    console.error('Error updating fuel type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get fuel type by ID
export const getFuelTypeById = async (req, res) => {
  try {
    const { fuelType_id } = req.params;

    if (!fuelType_id) {
      return res.status(400).json({
        success: false,
        message: 'Fuel type ID is required'
      });
    }

    const fuelType = await FuelType.findOne({ fuelType_id });
    if (!fuelType) {
      return res.status(404).json({
        success: false,
        message: 'Fuel type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fuelType
    });
  } catch (error) {
    console.error('Error getting fuel type by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all fuel types
export const getAllFuelTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    // Filter by status
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Search by fuel type name
    if (search) {
      query.fuelType_name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const result = await FuelType.paginate(query, options);

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
    console.error('Error getting all fuel types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 