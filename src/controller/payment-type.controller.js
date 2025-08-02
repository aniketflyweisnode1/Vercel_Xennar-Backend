import PaymentType from '../models/payment-type.model.js';

// Create payment type
export const createPaymentType = async (req, res) => {
  try {
    const { payment_type } = req.body;
    const user_id = req.user.user_id;

    // Required field validation
    if (!payment_type) {
      return res.status(400).json({
        success: false,
        message: 'Payment type is required'
      });
    }

    // Check if payment type already exists
    const existingPaymentType = await PaymentType.findOne({ 
      payment_type: { $regex: new RegExp(`^${payment_type}$`, 'i') }
    });
    
    if (existingPaymentType) {
      return res.status(400).json({
        success: false,
        message: 'Payment type already exists'
      });
    }

    const paymentType = new PaymentType({
      payment_type,
      created_by: user_id
    });

    const savedPaymentType = await paymentType.save();

    res.status(201).json({
      success: true,
      message: 'Payment type created successfully',
      data: savedPaymentType
    });
  } catch (error) {
    console.error('Error creating payment type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update payment type
export const updatePaymentType = async (req, res) => {
  try {
    const { paymenttype_id, payment_type, status } = req.body;
    const user_id = req.user.user_id;

    if (!paymenttype_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment type ID is required'
      });
    }

    const paymentType = await PaymentType.findOne({ paymenttype_id });
    if (!paymentType) {
      return res.status(404).json({
        success: false,
        message: 'Payment type not found'
      });
    }

    // Check if new payment type name already exists (excluding current record)
    if (payment_type && payment_type !== paymentType.payment_type) {
      const existingPaymentType = await PaymentType.findOne({ 
        payment_type: { $regex: new RegExp(`^${payment_type}$`, 'i') },
        paymenttype_id: { $ne: paymenttype_id } 
      });
      if (existingPaymentType) {
        return res.status(400).json({
          success: false,
          message: 'Payment type already exists'
        });
      }
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    // Add provided fields to update data
    if (payment_type !== undefined) updateData.payment_type = payment_type;
    if (status !== undefined) updateData.status = status;

    const updatedPaymentType = await PaymentType.findOneAndUpdate(
      { paymenttype_id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payment type updated successfully',
      data: updatedPaymentType
    });
  } catch (error) {
    console.error('Error updating payment type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment type by ID
export const getPaymentTypeById = async (req, res) => {
  try {
    const { paymenttype_id } = req.params;

    if (!paymenttype_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment type ID is required'
      });
    }

    const paymentType = await PaymentType.findOne({ paymenttype_id })
      .populate({ path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' })
      .populate({ path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' });

    if (!paymentType) {
      return res.status(404).json({
        success: false,
        message: 'Payment type not found'
      });
    }

    res.status(200).json({
      success: true,
      data: paymentType
    });
  } catch (error) {
    console.error('Error getting payment type by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all payment types
export const getAllPaymentTypes = async (req, res) => {
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
      query.payment_type = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    const result = await PaymentType.paginate(query, options);

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
    console.error('Error getting all payment types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 