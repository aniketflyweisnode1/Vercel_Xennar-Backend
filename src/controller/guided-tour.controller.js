import GuidedTour from '../models/guided-tour.model.js';

// Create guided tour
const createGuidedTour = async (req, res) => {
  try {
    const { heading, description, images, video, status } = req.body;
    const userId = req.user.user_id;

    // Validate required fields
    if (!heading || !description) {
      return res.status(400).json({
        success: false,
        message: 'Heading and description are required'
      });
    }

    // Create guided tour
    const guidedTour = new GuidedTour({
      heading,
      description,
      images: images || [],
      video: video || [],
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedGuidedTour = await guidedTour.save();

    res.status(201).json({
      success: true,
      message: 'Guided tour created successfully',
      data: savedGuidedTour
    });
  } catch (error) {
    console.error('Error creating guided tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating guided tour',
      error: error.message
    });
  }
};

// Update guided tour
const updateGuidedTour = async (req, res) => {
  try {
    const { guided_id, heading, description, images, video, status } = req.body;
    const userId = req.user.user_id;

    // Validate guided_id
    if (!guided_id) {
      return res.status(400).json({
        success: false,
        message: 'Guided ID is required in request body'
      });
    }

    // Check if guided tour exists
    const existingGuidedTour = await GuidedTour.findOne({ guided_id: parseInt(guided_id) });
    
    if (!existingGuidedTour) {
      return res.status(404).json({
        success: false,
        message: 'Guided tour not found'
      });
    }

    // Update guided tour
    const updatedGuidedTour = await GuidedTour.findOneAndUpdate(
      { guided_id: parseInt(guided_id) },
      {
        heading: heading || existingGuidedTour.heading,
        description: description || existingGuidedTour.description,
        images: images !== undefined ? images : existingGuidedTour.images,
        video: video !== undefined ? video : existingGuidedTour.video,
        status: status !== undefined ? status : existingGuidedTour.status,
        updated_by: userId,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Guided tour updated successfully',
      data: updatedGuidedTour
    });
  } catch (error) {
    console.error('Error updating guided tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating guided tour',
      error: error.message
    });
  }
};

// Get guided tour by ID
const getGuidedTourById = async (req, res) => {
  try {
    const { guided_id } = req.params;
    
    const guidedTour = await GuidedTour.findOne({ guided_id: parseInt(guided_id) });
    
    if (!guidedTour) {
      return res.status(404).json({
        success: false,
        message: 'Guided tour not found'
      });
    }

    res.json({
      success: true,
      data: guidedTour
    });
  } catch (error) {
    console.error('Error getting guided tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting guided tour',
      error: error.message
    });
  }
};

// Get all guided tours
const getAllGuidedTours = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { heading: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const guidedTours = await GuidedTour.paginate(query, options);

    res.json({
      success: true,
      data: guidedTours.docs,
      pagination: {
        totalDocs: guidedTours.totalDocs,
        limit: guidedTours.limit,
        totalPages: guidedTours.totalPages,
        page: guidedTours.page,
        pagingCounter: guidedTours.pagingCounter,
        hasPrevPage: guidedTours.hasPrevPage,
        hasNextPage: guidedTours.hasNextPage,
        prevPage: guidedTours.prevPage,
        nextPage: guidedTours.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting guided tours:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting guided tours',
      error: error.message
    });
  }
};

export {
  createGuidedTour,
  updateGuidedTour,
  getGuidedTourById,
  getAllGuidedTours
}; 