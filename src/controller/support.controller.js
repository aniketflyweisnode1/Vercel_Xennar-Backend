import Support from '../models/support.model.js';
import User from '../models/user.model.js';

// Create support ticket
const createSupport = async (req, res) => {
  try {
    const { support_type, ask_question, ask_user_id, reply_answer, ans_by_id, status } = req.body;
    const createdBy = req.user.user_id;

    // Validate required fields
    if (!support_type || !ask_question || !ask_user_id) {
      return res.status(400).json({
        success: false,
        message: 'Support type, question, and ask user ID are required'
      });
    }

    // Validate support type
    const validSupportTypes = ['Tech', 'Task', 'Automobile', 'Real Estate'];
    if (!validSupportTypes.includes(support_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid support type. Must be one of: Tech, Task, Automobile, Real Estate'
      });
    }

    // Check if ask user exists
    const askUser = await User.findOne({ user_id: parseInt(ask_user_id) });
    if (!askUser) {
      return res.status(404).json({
        success: false,
        message: 'Ask user not found'
      });
    }

    // Check if answer user exists (if provided)
    if (ans_by_id) {
      const answerUser = await User.findOne({ user_id: parseInt(ans_by_id) });
      if (!answerUser) {
        return res.status(404).json({
          success: false,
          message: 'Answer user not found'
        });
      }
    }

    // Create support ticket
    const support = new Support({
      support_type,
      ask_question: ask_question.trim(),
      ask_user_id: parseInt(ask_user_id),
      reply_answer: reply_answer ? reply_answer.trim() : null,
      ans_by_id: ans_by_id ? parseInt(ans_by_id) : null,
      status: status !== undefined ? status : true,
      created_by: createdBy
    });

    const savedSupport = await support.save();

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: savedSupport
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating support ticket',
      error: error.message
    });
  }
};

// Update support ticket
const updateSupport = async (req, res) => {
  try {
    const { support_id, support_type, ask_question, ask_user_id, reply_answer, ans_by_id, status } = req.body;
    const updatedBy = req.user.user_id;

    // Validate required fields
    if (!support_id) {
      return res.status(400).json({
        success: false,
        message: 'Support ID is required'
      });
    }

    // Check if support ticket exists
    const existingSupport = await Support.findOne({ support_id: parseInt(support_id) });
    
    if (!existingSupport) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    // Validate support type if being updated
    if (support_type) {
      const validSupportTypes = ['Tech', 'Task', 'Automobile', 'Real Estate'];
      if (!validSupportTypes.includes(support_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid support type. Must be one of: Tech, Task, Automobile, Real Estate'
        });
      }
    }

    // Check if ask user exists (if being updated)
    if (ask_user_id && ask_user_id !== existingSupport.ask_user_id) {
      const askUser = await User.findOne({ user_id: parseInt(ask_user_id) });
      if (!askUser) {
        return res.status(404).json({
          success: false,
          message: 'Ask user not found'
        });
      }
    }

    // Check if answer user exists (if being updated)
    if (ans_by_id && ans_by_id !== existingSupport.ans_by_id) {
      const answerUser = await User.findOne({ user_id: parseInt(ans_by_id) });
      if (!answerUser) {
        return res.status(404).json({
          success: false,
          message: 'Answer user not found'
        });
      }
    }

    // Update support ticket
    const updatedSupport = await Support.findOneAndUpdate(
      { support_id: parseInt(support_id) },
      {
        support_type: support_type || existingSupport.support_type,
        ask_question: ask_question ? ask_question.trim() : existingSupport.ask_question,
        ask_user_id: ask_user_id ? parseInt(ask_user_id) : existingSupport.ask_user_id,
        reply_answer: reply_answer !== undefined ? (reply_answer ? reply_answer.trim() : null) : existingSupport.reply_answer,
        ans_by_id: ans_by_id !== undefined ? (ans_by_id ? parseInt(ans_by_id) : null) : existingSupport.ans_by_id,
        status: status !== undefined ? status : existingSupport.status,
        updated_by: updatedBy,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      data: updatedSupport
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating support ticket',
      error: error.message
    });
  }
};

// Get support ticket by ID
const getSupportById = async (req, res) => {
  try {
    const { support_id } = req.params;
    
    const support = await Support.findOne({ support_id: parseInt(support_id) });
    
    if (!support) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    res.json({
      success: true,
      data: support
    });
  } catch (error) {
    console.error('Error getting support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting support ticket',
      error: error.message
    });
  }
};

// Get all support tickets
const getAllSupports = async (req, res) => {
  try {
    const { page = 1, limit = 10, support_type, status, ask_user_id, ans_by_id, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {};
    
    // Filter by support type if provided
    if (support_type) {
      query.support_type = support_type;
    }

    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by ask user ID if provided
    if (ask_user_id) {
      query.ask_user_id = parseInt(ask_user_id);
    }

    // Filter by answer user ID if provided
    if (ans_by_id) {
      query.ans_by_id = parseInt(ans_by_id);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { ask_question: { $regex: search, $options: 'i' } },
        { reply_answer: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const supports = await Support.paginate(query, options);

    res.json({
      success: true,
      data: supports.docs,
      pagination: {
        totalDocs: supports.totalDocs,
        limit: supports.limit,
        totalPages: supports.totalPages,
        page: supports.page,
        pagingCounter: supports.pagingCounter,
        hasPrevPage: supports.hasPrevPage,
        hasNextPage: supports.hasNextPage,
        prevPage: supports.prevPage,
        nextPage: supports.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting support tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting support tickets',
      error: error.message
    });
  }
};

// Get support tickets by ask user ID
const getSupportsByAskUserId = async (req, res) => {
  try {
    const { ask_user_id } = req.params;
    const { page = 1, limit = 10, support_type, status, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {
      ask_user_id: parseInt(ask_user_id)
    };
    
    // Filter by support type if provided
    if (support_type) {
      query.support_type = support_type;
    }

    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { ask_question: { $regex: search, $options: 'i' } },
        { reply_answer: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const supports = await Support.paginate(query, options);

    res.json({
      success: true,
      message: `Support tickets retrieved for user ${ask_user_id}`,
      data: supports.docs,
      pagination: {
        totalDocs: supports.totalDocs,
        limit: supports.limit,
        totalPages: supports.totalPages,
        page: supports.page,
        pagingCounter: supports.pagingCounter,
        hasPrevPage: supports.hasPrevPage,
        hasNextPage: supports.hasNextPage,
        prevPage: supports.prevPage,
        nextPage: supports.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting support tickets by ask user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting support tickets by ask user ID',
      error: error.message
    });
  }
};

// Get support tickets by answer user ID
const getSupportsByAnsById = async (req, res) => {
  try {
    const { ans_by_id } = req.params;
    const { page = 1, limit = 10, support_type, status, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {
      ans_by_id: parseInt(ans_by_id)
    };
    
    // Filter by support type if provided
    if (support_type) {
      query.support_type = support_type;
    }

    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { ask_question: { $regex: search, $options: 'i' } },
        { reply_answer: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const supports = await Support.paginate(query, options);

    res.json({
      success: true,
      message: `Support tickets answered by user ${ans_by_id}`,
      data: supports.docs,
      pagination: {
        totalDocs: supports.totalDocs,
        limit: supports.limit,
        totalPages: supports.totalPages,
        page: supports.page,
        pagingCounter: supports.pagingCounter,
        hasPrevPage: supports.hasPrevPage,
        hasNextPage: supports.hasNextPage,
        prevPage: supports.prevPage,
        nextPage: supports.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting support tickets by answer user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting support tickets by answer user ID',
      error: error.message
    });
  }
};

export {
  createSupport,
  updateSupport,
  getSupportById,
  getAllSupports,
  getSupportsByAskUserId,
  getSupportsByAnsById
}; 