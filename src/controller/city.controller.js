import City from '../models/city.model.js';

// Create city
const createCity = async (req, res) => {
  try {
    const { city, state_id, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!city || !state_id) {
      return res.status(400).json({
        success: false,
        message: 'City and state_id are required'
      });
    }

    // Check if city already exists
    const existingCity = await City.findOne({ city, state_id });
    if (existingCity) {
      return res.status(400).json({
        success: false,
        message: 'City already exists in this state'
      });
    }

    const cityData = new City({
      city,
      state_id,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedCity = await cityData.save();

    // Populate the saved city with references
    const populatedCity = await City.findOne({ city_id: savedCity.city_id })
      
      
      ;

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: populatedCity
    });
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating city',
      error: error.message
    });
  }
};

// Get city by ID
const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const city = await City.findOne({ city_id: id })
      
      
      ;
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    res.json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Error getting city:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting city',
      error: error.message
    });
  }
};

// Get all cities
const getAllCities = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, state_id } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Filter by state if provided
    if (state_id) {
      query.state_id = state_id;
    }
    
    // Search functionality
    if (search) {
      query.city = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const cities = await City.paginate(query, options);

    res.json({
      success: true,
      data: cities.docs,
      pagination: {
        totalDocs: cities.totalDocs,
        limit: cities.limit,
        totalPages: cities.totalPages,
        page: cities.page,
        pagingCounter: cities.pagingCounter,
        hasPrevPage: cities.hasPrevPage,
        hasNextPage: cities.hasNextPage,
        prevPage: cities.prevPage,
        nextPage: cities.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting cities:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cities',
      error: error.message
    });
  }
};

// Update city
const updateCity = async (req, res) => {
  try {
    const { id, city, state_id, status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required in body' });
    }

    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (city !== undefined) {
      updateData.city = city;
    }

    if (state_id !== undefined) {
      updateData.state_id = state_id;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedCity = await City.findOneAndUpdate(
      { city_id: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCity) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    res.json({
      success: true,
      message: 'City updated successfully',
      data: updatedCity
    });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating city',
      error: error.message
    });
  }
};

export {
  createCity,
  getCityById,
  getAllCities,
  updateCity
}; 