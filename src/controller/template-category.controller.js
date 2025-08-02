import TemplateCategory from '../models/template-category.model.js';

// Create template category
export const createTemplateCategory = async (req, res) => {
  try {
    const { Category_name, status } = req.body;
    const user_id = req.user.user_id;

    // Required field validation
    if (!Category_name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category name already exists
    const existingCategory = await TemplateCategory.findOne({ 
      Category_name: Category_name,
      status: true
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    // Create new template category
    const templateCategory = new TemplateCategory({
      Category_name,
      status: status !== undefined ? status : true,
      created_by: user_id
    });

    const savedCategory = await templateCategory.save();

    res.status(201).json({
      success: true,
      message: 'Template category created successfully',
      data: savedCategory
    });
  } catch (error) {
    console.error('Error creating template category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update template category
export const updateTemplateCategory = async (req, res) => {
  try {
    const { TemCategory_id, Category_name, status } = req.body;
    const user_id = req.user.user_id;

    if (!TemCategory_id) {
      return res.status(400).json({
        success: false,
        message: 'TemCategory ID is required'
      });
    }

    const category = await TemplateCategory.findOne({ TemCategory_id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Template category not found'
      });
    }

    // Check if category name already exists (excluding current category)
    if (Category_name) {
      const existingCategory = await TemplateCategory.findOne({ 
        Category_name: Category_name,
        TemCategory_id: { $ne: TemCategory_id },
        status: true
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    if (Category_name !== undefined) updateData.Category_name = Category_name;
    if (status !== undefined) updateData.status = status;

    const updatedCategory = await TemplateCategory.findOneAndUpdate(
      { TemCategory_id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Template category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating template category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get template category by ID
export const getTemplateCategoryById = async (req, res) => {
  try {
    const { TemCategory_id } = req.params;

    if (!TemCategory_id) {
      return res.status(400).json({
        success: false,
        message: 'TemCategory ID is required'
      });
    }

    const category = await TemplateCategory.findOne({ TemCategory_id })
      .populate({
        path: 'created_by',
        select: 'user_id name email',
        localField: 'created_by',
        foreignField: 'user_id'
      })
      .populate({
        path: 'updated_by',
        select: 'user_id name email',
        localField: 'updated_by',
        foreignField: 'user_id'
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Template category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error getting template category by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all template categories
export const getAllTemplateCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Search functionality
    if (search) {
      query.Category_name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        {
          path: 'created_by',
          select: 'user_id name email',
          localField: 'created_by',
          foreignField: 'user_id'
        },
        {
          path: 'updated_by',
          select: 'user_id name email',
          localField: 'updated_by',
          foreignField: 'user_id'
        }
      ]
    };

    const result = await TemplateCategory.paginate(query, options);

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
    console.error('Error getting all template categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 