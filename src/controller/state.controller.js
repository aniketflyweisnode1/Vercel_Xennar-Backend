import State from '../models/state.model.js';

// Create state
const createState = async (req, res) => {
  try {
    const { state, country_id, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State is required'
      });
    }

    // Check if state already exists
    const existingState = await State.findOne({ state });
    if (existingState) {
      return res.status(400).json({
        success: false,
        message: 'State already exists'
      });
    }

    const stateData = new State({
      state,
      country_id: country_id || 1,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedState = await stateData.save();

    res.status(201).json({
      success: true,
      message: 'State created successfully',
      data: savedState
    });
  } catch (error) {
    console.error('Create state error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating state',
      error: error.message
    });
  }
};

// Get state by ID
const getStateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const state = await State.findOne({ state_id: id });
    
    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    console.error('Error getting state:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting state',
      error: error.message
    });
  }
};

// Get all states
const getAllStates = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, country_id } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Filter by country if provided
    if (country_id) {
      query.country_id = parseInt(country_id);
    }
    
    // Search functionality
    if (search) {
      query.state = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const states = await State.paginate(query, options);

    res.json({
      success: true,
      data: states.docs,
      pagination: {
        totalDocs: states.totalDocs,
        limit: states.limit,
        totalPages: states.totalPages,
        page: states.page,
        pagingCounter: states.pagingCounter,
        hasPrevPage: states.hasPrevPage,
        hasNextPage: states.hasNextPage,
        prevPage: states.prevPage,
        nextPage: states.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting states:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting states',
      error: error.message
    });
  }
};

// Update state
const updateState = async (req, res) => {
  try {
    const { id, state, country_id, status } = req.body;
    const userId = req.user.user_id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required in body'
      });
    }

    // Check if state exists
    const existingState = await State.findOne({ state_id: id });
    if (!existingState) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

    // Check if new state name already exists (if being changed)
    if (state && state !== existingState.state) {
      const duplicateState = await State.findOne({ 
        state,
        state_id: { $ne: id }
      });
      if (duplicateState) {
        return res.status(400).json({
          success: false,
          message: 'State name already exists'
        });
      }
    }

    const updateData = {
      state: state || existingState.state,
      country_id: country_id !== undefined ? country_id : existingState.country_id,
      status: status !== undefined ? status : existingState.status,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedState = await State.findOneAndUpdate(
      { state_id: id },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'State updated successfully',
      data: updatedState
    });
  } catch (error) {
    console.error('Update state error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating state',
      error: error.message
    });
  }
};

export {
  createState,
  getStateById,
  getAllStates,
  updateState
}; 