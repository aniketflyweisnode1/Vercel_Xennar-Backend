import PaymentUPI from '../models/payment-upi.model.js';
import User from '../models/user.model.js';

// Create payment UPI
const createPaymentUPI = async (req, res) => {
  try {
    const { user_id, UPITxt, status } = req.body;
    const createdBy = req.user.user_id;

    // Validate required fields
    if (!user_id || !UPITxt) {
      return res.status(400).json({
        success: false,
        message: 'User ID and UPI text are required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ user_id: parseInt(user_id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if UPI already exists for this user
    const existingUPI = await PaymentUPI.findOne({
      user_id: parseInt(user_id),
      UPITxt: UPITxt.trim(),
      status: true
    });

    if (existingUPI) {
      return res.status(400).json({
        success: false,
        message: 'UPI already exists for this user'
      });
    }

    // Create payment UPI
    const paymentUPI = new PaymentUPI({
      user_id: parseInt(user_id),
      UPITxt: UPITxt.trim(),
      status: status !== undefined ? status : true,
      created_by: createdBy
    });

    const savedUPI = await paymentUPI.save();

    res.status(201).json({
      success: true,
      message: 'Payment UPI created successfully',
      data: savedUPI
    });
  } catch (error) {
    console.error('Error creating payment UPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment UPI',
      error: error.message
    });
  }
};

// Update payment UPI
const updatePaymentUPI = async (req, res) => {
  try {
    const { upi_id, user_id, UPITxt, status } = req.body;
    const updatedBy = req.user.user_id;

    // Validate required fields
    if (!upi_id) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required'
      });
    }

    // Check if UPI exists
    const existingUPI = await PaymentUPI.findOne({ upi_id: parseInt(upi_id) });
    
    if (!existingUPI) {
      return res.status(404).json({
        success: false,
        message: 'Payment UPI not found'
      });
    }

    // If user_id is being changed, validate the new user
    if (user_id && user_id !== existingUPI.user_id) {
      const user = await User.findOne({ user_id: parseInt(user_id) });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    // If UPITxt is being changed, check for duplicates
    if (UPITxt && UPITxt.trim() !== existingUPI.UPITxt) {
      const duplicateUPI = await PaymentUPI.findOne({
        user_id: user_id ? parseInt(user_id) : existingUPI.user_id,
        UPITxt: UPITxt.trim(),
        status: true,
        upi_id: { $ne: parseInt(upi_id) }
      });

      if (duplicateUPI) {
        return res.status(400).json({
          success: false,
          message: 'UPI already exists for this user'
        });
      }
    }

    // Update payment UPI
    const updatedUPI = await PaymentUPI.findOneAndUpdate(
      { upi_id: parseInt(upi_id) },
      {
        user_id: user_id ? parseInt(user_id) : existingUPI.user_id,
        UPITxt: UPITxt ? UPITxt.trim() : existingUPI.UPITxt,
        status: status !== undefined ? status : existingUPI.status,
        updated_by: updatedBy,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Payment UPI updated successfully',
      data: updatedUPI
    });
  } catch (error) {
    console.error('Error updating payment UPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment UPI',
      error: error.message
    });
  }
};

// Get payment UPI by ID
const getPaymentUPIById = async (req, res) => {
  try {
    const { upi_id } = req.params;
    
    const paymentUPI = await PaymentUPI.findOne({ upi_id: parseInt(upi_id) });
    
    if (!paymentUPI) {
      return res.status(404).json({
        success: false,
        message: 'Payment UPI not found'
      });
    }

    res.json({
      success: true,
      data: paymentUPI
    });
  } catch (error) {
    console.error('Error getting payment UPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payment UPI',
      error: error.message
    });
  }
};

// Get all payment UPIs
const getAllPaymentUPIs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, user_id, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by user_id if provided
    if (user_id) {
      query.user_id = parseInt(user_id);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { UPITxt: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const paymentUPIs = await PaymentUPI.paginate(query, options);

    res.json({
      success: true,
      data: paymentUPIs.docs,
      pagination: {
        totalDocs: paymentUPIs.totalDocs,
        limit: paymentUPIs.limit,
        totalPages: paymentUPIs.totalPages,
        page: paymentUPIs.page,
        pagingCounter: paymentUPIs.pagingCounter,
        hasPrevPage: paymentUPIs.hasPrevPage,
        hasNextPage: paymentUPIs.hasNextPage,
        prevPage: paymentUPIs.prevPage,
        nextPage: paymentUPIs.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting payment UPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payment UPIs',
      error: error.message
    });
  }
};

// Get payment UPIs by authenticated user
const getPaymentUPIsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 10, status, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {
      user_id: userId
    };
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { UPITxt: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const paymentUPIs = await PaymentUPI.paginate(query, options);

    res.json({
      success: true,
      message: 'Payment UPIs retrieved successfully for authenticated user',
      data: paymentUPIs.docs,
      pagination: {
        totalDocs: paymentUPIs.totalDocs,
        limit: paymentUPIs.limit,
        totalPages: paymentUPIs.totalPages,
        page: paymentUPIs.page,
        pagingCounter: paymentUPIs.pagingCounter,
        hasPrevPage: paymentUPIs.hasPrevPage,
        hasNextPage: paymentUPIs.hasNextPage,
        prevPage: paymentUPIs.prevPage,
        nextPage: paymentUPIs.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting payment UPIs by auth:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payment UPIs by auth',
      error: error.message
    });
  }
};

export {
  createPaymentUPI,
  updatePaymentUPI,
  getPaymentUPIById,
  getAllPaymentUPIs,
  getPaymentUPIsByAuth
}; 