import ImageTemplate from '../models/image-template.model.js';

// Create image template
const createImageTemplate = async (req, res) => {
  try {
    const { template_name, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!template_name) {
      return res.status(400).json({
        success: false,
        message: 'Template name is required'
      });
    }

    // Check if template already exists
    const existingTemplate = await ImageTemplate.findOne({ template_name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Template already exists'
      });
    }

    const templateData = new ImageTemplate({
      template_name,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedImageTemplate = await templateData.save();

    // Populate the saved template with references
    const populatedImageTemplate = await ImageTemplate.findOne({ template_id: savedImageTemplate.template_id })
      
      ;

    res.status(201).json({
      success: true,
      message: 'Image template created successfully',
      data: populatedImageTemplate
    });
  } catch (error) {
    console.error('Create image template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating image template',
      error: error.message
    });
  }
};

// Get image template by ID
const getImageTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const imageTemplate = await ImageTemplate.findOne({ template_id: id })
      
      ;
    
    if (!imageTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Image template not found'
      });
    }

    res.json({
      success: true,
      data: imageTemplate
    });
  } catch (error) {
    console.error('Error getting image template:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting image template',
      error: error.message
    });
  }
};

// Get all image templates
const getAllImageTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.template_name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const imageTemplates = await ImageTemplate.paginate(query, options);

    res.json({
      success: true,
      data: imageTemplates.docs,
      pagination: {
        totalDocs: imageTemplates.totalDocs,
        limit: imageTemplates.limit,
        totalPages: imageTemplates.totalPages,
        page: imageTemplates.page,
        pagingCounter: imageTemplates.pagingCounter,
        hasPrevPage: imageTemplates.hasPrevPage,
        hasNextPage: imageTemplates.hasNextPage,
        prevPage: imageTemplates.prevPage,
        nextPage: imageTemplates.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting image templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting image templates',
      error: error.message
    });
  }
};

// Update image template
const updateImageTemplate = async (req, res) => {
  try {
    const { id, template_name, status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required in body' });
    }

    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (template_name !== undefined) {
      updateData.template_name = template_name;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedImageTemplate = await ImageTemplate.findOneAndUpdate(
      { template_id: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedImageTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Image template not found'
      });
    }

    res.json({
      success: true,
      message: 'Image template updated successfully',
      data: updatedImageTemplate
    });
  } catch (error) {
    console.error('Error updating image template:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating image template',
      error: error.message
    });
  }
};

export {
  createImageTemplate,
  getImageTemplateById,
  getAllImageTemplates,
  updateImageTemplate
}; 