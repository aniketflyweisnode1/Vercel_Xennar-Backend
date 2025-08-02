import Faq from '../models/faq.model.js';
import FaqType from '../models/faq-type.model.js';

// Create FAQ
const createFaq = async (req, res) => {
  try {
    const { faqType_id, industryType, question, answer } = req.body;
    const userId = req.user.user_id;

    // Validate required fields
    if (!faqType_id || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'FAQ type ID, question, and answer are required'
      });
    }

    // Validate FAQ type exists
    const faqType = await FaqType.findOne({ faqType_id, status: true });
    if (!faqType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid FAQ type ID or FAQ type is inactive'
      });
    }

    // Validate industry type
    const validIndustryTypes = ['Real Estate', 'Automobile', 'null'];
    if (industryType && !validIndustryTypes.includes(industryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid industry type. Must be one of: Real Estate, Automobile, null'
      });
    }

    const faq = new Faq({
      faqType_id,
      industryType: industryType || 'null',
      question: question.trim(),
      answer: answer.trim(),
      created_by: userId,
      updated_by: userId
    });

    await faq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    });
  }
};

// Update FAQ
const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { faqType_id, industryType, question, answer, status } = req.body;
    const userId = req.user.user_id;

    const faq = await Faq.findOne({ faq_id: id });
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Validate FAQ type if being updated
    if (faqType_id) {
      const faqType = await FaqType.findOne({ faqType_id, status: true });
      if (!faqType) {
        return res.status(400).json({
          success: false,
          message: 'Invalid FAQ type ID or FAQ type is inactive'
        });
      }
      faq.faqType_id = faqType_id;
    }

    // Validate industry type if being updated
    if (industryType !== undefined) {
      const validIndustryTypes = ['Real Estate', 'Automobile', 'null'];
      if (!validIndustryTypes.includes(industryType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid industry type. Must be one of: Real Estate, Automobile, null'
        });
      }
      faq.industryType = industryType;
    }

    if (question) {
      faq.question = question.trim();
    }

    if (answer) {
      faq.answer = answer.trim();
    }

    if (status !== undefined) {
      faq.status = status;
    }

    faq.updated_by = userId;
    faq.updated_at = new Date();

    await faq.save();

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    });
  }
};

// Get FAQ by ID
const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await Faq.findOne({ faq_id: id });
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error('Error getting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting FAQ',
      error: error.message
    });
  }
};

// Get all FAQs
const getAllFaqs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, faqType_id, industryType } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by FAQ type if provided
    if (faqType_id) {
      query.faqType_id = parseInt(faqType_id);
    }

    // Filter by industry type if provided
    if (industryType) {
      query.industryType = industryType;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const faqs = await Faq.paginate(query, options);

    res.json({
      success: true,
      data: faqs.docs,
      pagination: {
        totalDocs: faqs.totalDocs,
        limit: faqs.limit,
        totalPages: faqs.totalPages,
        page: faqs.page,
        pagingCounter: faqs.pagingCounter,
        hasPrevPage: faqs.hasPrevPage,
        hasNextPage: faqs.hasNextPage,
        prevPage: faqs.prevPage,
        nextPage: faqs.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting FAQs',
      error: error.message
    });
  }
};

// Get FAQs by FAQ Type ID
const getFaqsByFaqTypeId = async (req, res) => {
  try {
    const { faqTypeId } = req.params;
    const { page = 1, limit = 10, status, industryType } = req.query;
    
    // Validate FAQ type ID
    if (!faqTypeId || isNaN(parseInt(faqTypeId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid FAQ type ID is required'
      });
    }

    // Validate FAQ type exists
    const faqType = await FaqType.findOne({ faqType_id: parseInt(faqTypeId) });
    if (!faqType) {
      return res.status(404).json({
        success: false,
        message: 'FAQ type not found'
      });
    }

    const query = {
      faqType_id: parseInt(faqTypeId)
    };
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by industry type if provided
    if (industryType) {
      query.industryType = industryType;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const faqs = await Faq.paginate(query, options);

    res.json({
      success: true,
      data: faqs.docs,
      pagination: {
        totalDocs: faqs.totalDocs,
        limit: faqs.limit,
        totalPages: faqs.totalPages,
        page: faqs.page,
        pagingCounter: faqs.pagingCounter,
        hasPrevPage: faqs.hasPrevPage,
        hasNextPage: faqs.hasNextPage,
        prevPage: faqs.prevPage,
        nextPage: faqs.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting FAQs by FAQ type ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting FAQs by FAQ type ID',
      error: error.message
    });
  }
};

export {
  createFaq,
  updateFaq,
  getFaqById,
  getAllFaqs,
  getFaqsByFaqTypeId
}; 