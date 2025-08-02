import Payment from '../models/payment.model.js';
import PaymentType from '../models/payment-type.model.js';
import MembershipMapUser from '../models/membership-map-user.model.js';
import MembershipPackage from '../models/membership-package.model.js';

// Create payment
 const createPayment = async (req, res) => {
  try {
    const { 
      payment_type_id, 
      payment_by_user_id, 
      payment_get_by_user_id, 
      payment_status, 
      transaction_no, 
      amount 
    } = req.body;
    const user_id = req.user.user_id;

    // Required field validation
    const requiredFields = ['payment_type_id', 'payment_by_user_id', 'payment_get_by_user_id', 'amount'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Check if payment type exists
    const paymentType = await PaymentType.findOne({ paymenttype_id: payment_type_id });
    if (!paymentType) {
      return res.status(400).json({
        success: false,
        message: 'Payment type not found'
      });
    }

    const payment = new Payment({
      payment_type_id,
      payment_by_user_id,
      payment_get_by_user_id,
      payment_status: payment_status || 'pending',
      transaction_no,
      amount,
      created_by: user_id
    });

    const savedPayment = await payment.save();

    // Update membership map user if payment is completed
    if (payment_status === 'completed') {
      await updateMembershipMapUser(savedPayment.payment_id, payment_status, transaction_no);
    }

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: savedPayment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update payment
 const updatePayment = async (req, res) => {
  try {
    const { 
      payment_id, 
      payment_type_id, 
      payment_by_user_id, 
      payment_get_by_user_id, 
      payment_status, 
      transaction_no, 
      amount,
      status 
    } = req.body;
    const user_id = req.user.user_id;

    if (!payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await Payment.findOne({ payment_id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Check if payment type exists if provided
    if (payment_type_id) {
      const paymentType = await PaymentType.findOne({ paymenttype_id: payment_type_id });
      if (!paymentType) {
        return res.status(400).json({
          success: false,
          message: 'Payment type not found'
        });
      }
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    // Add provided fields to update data
    if (payment_type_id !== undefined) updateData.payment_type_id = payment_type_id;
    if (payment_by_user_id !== undefined) updateData.payment_by_user_id = payment_by_user_id;
    if (payment_get_by_user_id !== undefined) updateData.payment_get_by_user_id = payment_get_by_user_id;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (transaction_no !== undefined) updateData.transaction_no = transaction_no;
    if (amount !== undefined) updateData.amount = amount;
    if (status !== undefined) updateData.status = status;

    const updatedPayment = await Payment.findOneAndUpdate(
      { payment_id },
      updateData,
      { new: true }
    );

    // Update membership map user based on payment status
    if (payment_status && payment_status !== payment.payment_status) {
      await updateMembershipMapUser(payment_id, payment_status, transaction_no);
    }

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment by ID
 const getPaymentById = async (req, res) => {
  try {
    const { payment_id } = req.params;

    if (!payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await Payment.findOne({ payment_id })
      .populate({ path: 'payment_type_id', select: 'payment_type', localField: 'payment_type_id', foreignField: 'paymenttype_id' })
      .populate({ path: 'payment_by_user_id', select: 'name email', localField: 'payment_by_user_id', foreignField: 'user_id' })
      .populate({ path: 'payment_get_by_user_id', select: 'name email', localField: 'payment_get_by_user_id', foreignField: 'user_id' })
      .populate({ path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' })
      .populate({ path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error getting payment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all payments
 const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      payment_status,
      payment_type_id,
      payment_by_user_id,
      payment_get_by_user_id,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by payment status
    if (payment_status) {
      query.payment_status = payment_status;
    }

    // Filter by payment type
    if (payment_type_id) {
      query.payment_type_id = payment_type_id;
    }

    // Filter by payment by user
    if (payment_by_user_id) {
      query.payment_by_user_id = payment_by_user_id;
    }

    // Filter by payment get by user
    if (payment_get_by_user_id) {
      query.payment_get_by_user_id = payment_get_by_user_id;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { transaction_no: { $regex: search, $options: 'i' } },
        { amount: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'payment_type_id', select: 'payment_type', localField: 'payment_type_id', foreignField: 'paymenttype_id' },
        { path: 'payment_by_user_id', select: 'name email', localField: 'payment_by_user_id', foreignField: 'user_id' },
        { path: 'payment_get_by_user_id', select: 'name email', localField: 'payment_get_by_user_id', foreignField: 'user_id' },
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    const result = await Payment.paginate(query, options);

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
    console.error('Error getting all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to update membership map user
const updateMembershipMapUser = async (payment_id, payment_status, transaction_no) => {
  try {
    const updateData = {
      payment_status: payment_status,
      payment_id: payment_id
    };

    // If payment is completed, also update transaction_no and calculate expiry date
    if (payment_status === 'completed') {
      updateData.transaction_no = transaction_no;
      updateData.status = true; // Set status to true when payment is completed
      updateData.membership_status = 'active';
      // Get membership map user records for this payment
      const membershipRecords = await MembershipMapUser.find({ payment_id: payment_id });
      
      for (const membershipRecord of membershipRecords) {
        // Get the package details to calculate expiry date
        const packageDetails = await MembershipPackage.findOne({ 
          package_id: membershipRecord.package_id 
        });
        
        if (packageDetails && packageDetails.duration) {
          // Calculate expiry date: payment completion date + package duration (in days)
          const paymentCompletionDate = new Date();
          const expiryDate = new Date(paymentCompletionDate);
          expiryDate.setDate(expiryDate.getDate() + packageDetails.duration);
          
          // Update the specific membership record with expiry date
          await MembershipMapUser.findOneAndUpdate(
            { membership_map_id: membershipRecord.membership_map_id },
            { 
              ...updateData,
              membership_expiry_date: expiryDate
            }
          );
          
          // console.log(`Updated membership map user ${membershipRecord.membership_map_id} with expiry date: ${expiryDate}`);
        } else {
          // Update without expiry date if package duration is not available
          await MembershipMapUser.findOneAndUpdate(
            { membership_map_id: membershipRecord.membership_map_id },
            updateData
          );
        }
      }
    } else {
      // For non-completed payments, just update payment status and payment_id
      await MembershipMapUser.updateMany(
        { payment_id: payment_id },
        updateData
      );
    }

    // console.log(`Updated membership map user for payment ${payment_id} with status ${payment_status}`);
  } catch (error) {
    console.error('Error updating membership map user:', error);
    throw error;
  }
}; 

export {  
    createPayment,
    updatePayment,
    getPaymentById,
    getAllPayments
}; 