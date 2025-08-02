import FaqType from '../models/faq-type.model.js';

// Create FAQ Type
const createFaqType = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.user_id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check if FAQ type with same name already exists
    const existingFaqType = await FaqType.findOne({ name: name.trim() });
    if (existingFaqType) {
      return res.status(400).json({
        success: false,
        message: 'FAQ type with this name already exists'
      });
    }

    const faqType = new FaqType({
      name: name.trim(),
      created_by: userId,
      updated_by: userId
    });

    await faqType.save();

    res.status(201).json({
      success: true,
      message: 'FAQ type created successfully',
      data: faqType
    });
  } catch (error) {
    console.error('Error creating FAQ type:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ type',
      error: error.message
    });
  }
};

// Update FAQ Type
const updateFaqType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const userId = req.user.user_id;

    const faqType = await FaqType.findOne({ faqType_id: id });
    
    if (!faqType) {
      return res.status(404).json({
        success: false,
        message: 'FAQ type not found'
      });
    }

    // Check if name is being updated and if it already exists
    if (name && name.trim() !== faqType.name) {
      const existingFaqType = await FaqType.findOne({ 
        name: name.trim(),
        faqType_id: { $ne: id }
      });
      if (existingFaqType) {
        return res.status(400).json({
          success: false,
          message: 'FAQ type with this name already exists'
        });
      }
      faqType.name = name.trim();
    }

    if (status !== undefined) {
      faqType.status = status;
    }

    faqType.updated_by = userId;
    faqType.updated_at = new Date();

    await faqType.save();

    res.json({
      success: true,
      message: 'FAQ type updated successfully',
      data: faqType
    });
  } catch (error) {
    console.error('Error updating FAQ type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ type',
      error: error.message
    });
  }
};

// Get FAQ Type by ID
const getFaqTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faqType = await FaqType.findOne({ faqType_id: id });
    
    if (!faqType) {
      return res.status(404).json({
        success: false,
        message: 'FAQ type not found'
      });
    }

    res.json({
      success: true,
      data: faqType
    });
  } catch (error) {
    console.error('Error getting FAQ type:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting FAQ type',
      error: error.message
    });
  }
};

// Get all FAQ Types
const getAllFaqTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const faqTypes = await FaqType.paginate(query, options);

    res.json({
      success: true,
      data: faqTypes.docs,
      pagination: {
        totalDocs: faqTypes.totalDocs,
        limit: faqTypes.limit,
        totalPages: faqTypes.totalPages,
        page: faqTypes.page,
        pagingCounter: faqTypes.pagingCounter,
        hasPrevPage: faqTypes.hasPrevPage,
        hasNextPage: faqTypes.hasNextPage,
        prevPage: faqTypes.prevPage,
        nextPage: faqTypes.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting FAQ types:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting FAQ types',
      error: error.message
    });
  }
};

export {
  createFaqType,
  updateFaqType,
  getFaqTypeById,
  getAllFaqTypes
}; 