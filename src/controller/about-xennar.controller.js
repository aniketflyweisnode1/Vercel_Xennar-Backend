import AboutXennar from '../models/about-xennar.model.js';

// Create About Xennar
const createAboutXennar = async (req, res) => {
  try {
    const { Heading, subHeading, description, tutorial_video } = req.body;
    const userId = req.user.user_id;

    // Validate required fields
    if (!Heading || !subHeading || !description) {
      return res.status(400).json({
        success: false,
        message: 'Heading, subHeading, and description are required'
      });
    }

    const aboutXennar = new AboutXennar({
      Heading: Heading.trim(),
      subHeading: subHeading.trim(),
      description: description.trim(),
      tutorial_video: tutorial_video,
      created_by: userId,
      updated_by: userId
    });

    await aboutXennar.save();

    res.status(201).json({
      success: true,
      message: 'About Xennar created successfully',
      data: aboutXennar
    });
  } catch (error) {
    console.error('Error creating about Xennar:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating about Xennar',
      error: error.message
    });
  }
};

// Update About Xennar
const updateAboutXennar = async (req, res) => {
  try {
    const { id } = req.params;
    const { Heading, subHeading, description, status } = req.body;
    const userId = req.user.user_id;

    const aboutXennar = await AboutXennar.findOne({ about_id: id });
    
    if (!aboutXennar) {
      return res.status(404).json({
        success: false,
        message: 'About Xennar not found'
      });
    }

    if (Heading) {
      aboutXennar.Heading = Heading.trim();
    }

    if (subHeading) {
      aboutXennar.subHeading = subHeading.trim();
    }

    if (description) {
      aboutXennar.description = description.trim();
    }

    if (status !== undefined) {
      aboutXennar.status = status;
    }

    aboutXennar.updated_by = userId;
    aboutXennar.updated_at = new Date();

    await aboutXennar.save();

    res.json({
      success: true,
      message: 'About Xennar updated successfully',
      data: aboutXennar
    });
  } catch (error) {
    console.error('Error updating about Xennar:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating about Xennar',
      error: error.message
    });
  }
};

// Get About Xennar by ID
const getAboutXennarById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const aboutXennar = await AboutXennar.findOne({ about_id: id });
    
    if (!aboutXennar) {
      return res.status(404).json({
        success: false,
        message: 'About Xennar not found'
      });
    }

    res.json({
      success: true,
      data: aboutXennar
    });
  } catch (error) {
    console.error('Error getting about Xennar:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting about Xennar',
      error: error.message
    });
  }
};

// Get all About Xennars
const getAllAboutXennars = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { Heading: { $regex: search, $options: 'i' } },
        { subHeading: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const aboutXennars = await AboutXennar.paginate(query, options);

    res.json({
      success: true,
      data: aboutXennars.docs,
      pagination: {
        totalDocs: aboutXennars.totalDocs,
        limit: aboutXennars.limit,
        totalPages: aboutXennars.totalPages,
        page: aboutXennars.page,
        pagingCounter: aboutXennars.pagingCounter,
        hasPrevPage: aboutXennars.hasPrevPage,
        hasNextPage: aboutXennars.hasNextPage,
        prevPage: aboutXennars.prevPage,
        nextPage: aboutXennars.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting about Xennars:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting about Xennars',
      error: error.message
    });
  }
};

export {
  createAboutXennar,
  updateAboutXennar,
  getAboutXennarById,
  getAllAboutXennars
}; 