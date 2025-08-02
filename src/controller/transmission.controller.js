import Transmission from '../models/transmission.model.js';

// Create transmission
export const createTransmission = async (req, res) => {
  try {
    const { transmission_name } = req.body;
    const user_id = req.user.user_id;

    if (!transmission_name) {
      return res.status(400).json({
        success: false,
        message: 'Transmission name is required'
      });
    }

    // Check if transmission already exists
    const existingTransmission = await Transmission.findOne({ transmission_name });
    if (existingTransmission) {
      return res.status(400).json({
        success: false,
        message: 'Transmission with this name already exists'
      });
    }

    const transmission = new Transmission({
      transmission_name,
      created_by: user_id
    });

    const savedTransmission = await transmission.save();

    res.status(201).json({
      success: true,
      message: 'Transmission created successfully',
      data: savedTransmission
    });
  } catch (error) {
    console.error('Error creating transmission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update transmission
export const updateTransmission = async (req, res) => {
  try {
    const { transmission_id, transmission_name, status } = req.body;
    const user_id = req.user.user_id;

    if (!transmission_id) {
      return res.status(400).json({
        success: false,
        message: 'Transmission ID is required'
      });
    }

    const transmission = await Transmission.findOne({ transmission_id });
    if (!transmission) {
      return res.status(404).json({
        success: false,
        message: 'Transmission not found'
      });
    }

    // Check if new name already exists (excluding current record)
    if (transmission_name && transmission_name !== transmission.transmission_name) {
      const existingTransmission = await Transmission.findOne({ 
        transmission_name, 
        transmission_id: { $ne: transmission_id } 
      });
      if (existingTransmission) {
        return res.status(400).json({
          success: false,
          message: 'Transmission with this name already exists'
        });
      }
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    if (transmission_name) updateData.transmission_name = transmission_name;
    if (status !== undefined) updateData.status = status;

    const updatedTransmission = await Transmission.findOneAndUpdate(
      { transmission_id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Transmission updated successfully',
      data: updatedTransmission
    });
  } catch (error) {
    console.error('Error updating transmission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get transmission by ID
export const getTransmissionById = async (req, res) => {
  try {
    const { transmission_id } = req.params;

    if (!transmission_id) {
      return res.status(400).json({
        success: false,
        message: 'Transmission ID is required'
      });
    }

    const transmission = await Transmission.findOne({ transmission_id });
    if (!transmission) {
      return res.status(404).json({
        success: false,
        message: 'Transmission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transmission
    });
  } catch (error) {
    console.error('Error getting transmission by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all transmissions
export const getAllTransmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    // Filter by status
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Search by transmission name
    if (search) {
      query.transmission_name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const result = await Transmission.paginate(query, options);

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
    console.error('Error getting all transmissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 