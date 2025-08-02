import LegalPrivacy from '../models/legal-privacy.model.js';

// Create Legal Privacy
const createLegalPrivacy = async (req, res) => {
  try {
    const { Heading, subHeading, description } = req.body;
    const userId = req.user.user_id;

    // Validate required fields
    if (!Heading || !subHeading || !description) {
      return res.status(400).json({
        success: false,
        message: 'Heading, subHeading, and description are required'
      });
    }

    const legalPrivacy = new LegalPrivacy({
      Heading: Heading.trim(),
      subHeading: subHeading.trim(),
      description: description.trim(),
      created_by: userId,
      updated_by: userId
    });

    await legalPrivacy.save();

    res.status(201).json({
      success: true,
      message: 'Legal privacy created successfully',
      data: legalPrivacy
    });
  } catch (error) {
    console.error('Error creating legal privacy:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating legal privacy',
      error: error.message
    });
  }
};

// Update Legal Privacy
const updateLegalPrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { Heading, subHeading, description, status } = req.body;
    const userId = req.user.user_id;

    const legalPrivacy = await LegalPrivacy.findOne({ Privacy_id: id });
    
    if (!legalPrivacy) {
      return res.status(404).json({
        success: false,
        message: 'Legal privacy not found'
      });
    }

    if (Heading) {
      legalPrivacy.Heading = Heading.trim();
    }

    if (subHeading) {
      legalPrivacy.subHeading = subHeading.trim();
    }

    if (description) {
      legalPrivacy.description = description.trim();
    }

    if (status !== undefined) {
      legalPrivacy.status = status;
    }

    legalPrivacy.updated_by = userId;
    legalPrivacy.updated_at = new Date();

    await legalPrivacy.save();

    res.json({
      success: true,
      message: 'Legal privacy updated successfully',
      data: legalPrivacy
    });
  } catch (error) {
    console.error('Error updating legal privacy:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating legal privacy',
      error: error.message
    });
  }
};

// Get Legal Privacy by ID
const getLegalPrivacyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const legalPrivacy = await LegalPrivacy.findOne({ Privacy_id: id });
    
    if (!legalPrivacy) {
      return res.status(404).json({
        success: false,
        message: 'Legal privacy not found'
      });
    }

    res.json({
      success: true,
      data: legalPrivacy
    });
  } catch (error) {
    console.error('Error getting legal privacy:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting legal privacy',
      error: error.message
    });
  }
};

// Get all Legal Privacies
const getAllLegalPrivacies = async (req, res) => {
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

    const legalPrivacies = await LegalPrivacy.paginate(query, options);

    res.json({
      success: true,
      data: legalPrivacies.docs,
      pagination: {
        totalDocs: legalPrivacies.totalDocs,
        limit: legalPrivacies.limit,
        totalPages: legalPrivacies.totalPages,
        page: legalPrivacies.page,
        pagingCounter: legalPrivacies.pagingCounter,
        hasPrevPage: legalPrivacies.hasPrevPage,
        hasNextPage: legalPrivacies.hasNextPage,
        prevPage: legalPrivacies.prevPage,
        nextPage: legalPrivacies.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting legal privacies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting legal privacies',
      error: error.message
    });
  }
};

export {
  createLegalPrivacy,
  updateLegalPrivacy,
  getLegalPrivacyById,
  getAllLegalPrivacies
}; 