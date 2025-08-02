import Notification from '../models/notifications.model.js';
import User from '../models/user.model.js';
import NotificationsMapUser from '../models/notifications_map_user.model.js';

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { massage, notification_view, status, title } = req.body;
    const created_by = req.user.user_id;

    if (!massage) {
      return res.status(400).json({
        success: false,
        message: 'Massage is required'
      });
    }

    const notification = new Notification({
      massage,
      title,
      notification_view: notification_view !== undefined ? notification_view : true,
      status: status !== undefined ? status : true,
      created_by
    });

    const savedNotification = await notification.save();
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: savedNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Send notification to all users by industry type
const sendNotificationByIndustryType = async (req, res) => {
  try {
    const { notification_id, industryType } = req.body;
    const created_by = req.user.user_id;

    if (!notification_id) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is required'
      });
    }

    if (!industryType) {
      return res.status(400).json({
        success: false,
        message: 'Industry type is required'
      });
    }

    // Get notification by ID to extract fields
    const existingNotification = await Notification.findOne({ notification_id: notification_id });
    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Extract fields from existing notification
    const { massage, title, notification_view, status } = existingNotification;

    // Validate industry type
    const validIndustryTypes = ['Real Estate', 'Automobile', 'null'];
    if (!validIndustryTypes.includes(industryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid industry type. Must be one of: Real Estate, Automobile, null'
      });
    }

    // Find all users with the specified industry type AND notification_active = true
    const users = await User.find({ 
      user_industryType: industryType,
      status: true,
      notification_active: true // Only users with notifications enabled
    }).select('user_id name email notification_active');

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No users found with industry type: ${industryType} and notifications enabled`
      });
    }

    // Create the notification
    const notification = new Notification({
      title,
      massage,
      notification_view: notification_view !== undefined ? notification_view : true,
      status: status !== undefined ? status : true,
      created_by
    });

    const savedNotification = await notification.save();

    // Create notification mappings only for users with notification_active = true
    const notificationMappings = [];
    const skippedUsers = [];
    
    for (const user of users) {
      // Double-check notification_active status before creating mapping
      if (user.notification_active === true) {
        const notificationMapping = new NotificationsMapUser({
          notification_id: savedNotification.notification_id,
          user_id: user.user_id,
          notification_view: notification_view !== undefined ? notification_view : true,
          status: status !== undefined ? status : true,
          created_by
        });
        const savedMapping = await notificationMapping.save();
        notificationMappings.push(savedMapping);
      } else {
        skippedUsers.push({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          reason: 'Notifications disabled'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Notification sent successfully to ${notificationMappings.length} users with industry type: ${industryType} (${skippedUsers.length} users skipped due to disabled notifications)`,
      data: {
        notification: {
          _id: savedNotification._id,
          notification_id: savedNotification.notification_id,
          title: savedNotification.title,
          massage: savedNotification.massage,
          notification_view: savedNotification.notification_view,
          status: savedNotification.status,
          created_at: savedNotification.created_at
        },
        users_count: notificationMappings.length,
        skipped_users_count: skippedUsers.length,
        industry_type: industryType,
        users_with_notifications: users.filter(user => user.notification_active === true).map(user => ({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          notification_active: user.notification_active
        })),
        skipped_users: skippedUsers
      }
    });
  } catch (error) {
    console.error('Error sending notification by industry type:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification by industry type',
      error: error.message
    });
  }
};

// Update notification by ID
const updateNotification = async (req, res) => {
  try {
    const { id,title, massage, notification_view, status, notification_type } = req.body;
    const updated_by = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is required'
      });
    }

    const existingNotification = await Notification.findOne({ notification_id: id });
    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const updateData = {
      title: title || existingNotification.title,
      notification_type: notification_type || existingNotification.notification_type,
      massage: massage || existingNotification.massage,
      notification_view: notification_view !== undefined ? notification_view : existingNotification.notification_view,
      status: status !== undefined ? status : existingNotification.status,
      updated_by,
      updated_at: new Date()
    };

    const updatedNotification = await Notification.findOneAndUpdate(
      { notification_id: id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Notification updated successfully',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ notification_id: id })
      
      ;
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error getting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification',
      error: error.message
    });
  }
};

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    if (status !== undefined) {
      query.status = status === 'true';
    }
    if (search) {
      query.massage = { $regex: search, $options: 'i' };
    }
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };
    const notifications = await Notification.paginate(query, options);
    res.json({
      success: true,
      data: notifications.docs,
      pagination: {
        totalDocs: notifications.totalDocs,
        limit: notifications.limit,
        totalPages: notifications.totalPages,
        page: notifications.page,
        pagingCounter: notifications.pagingCounter,
        hasPrevPage: notifications.hasPrevPage,
        hasNextPage: notifications.hasNextPage,
        prevPage: notifications.prevPage,
        nextPage: notifications.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notifications',
      error: error.message
    });
  }
};

// Send notification to specific users with notification_active check
const sendNotificationToUsers = async (req, res) => {
  try {
    const { notification_id, user_ids } = req.body;
    const created_by = req.user.user_id;

    if (!notification_id) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is required'
      });
    }

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required and must not be empty'
      });
    }

    // Get notification by ID to extract fields
    const existingNotification = await Notification.findOne({ notification_id: notification_id });
    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Extract fields from existing notification
    const { massage, title, notification_view, status } = existingNotification;

    // Find all users with notification_active = true
    const users = await User.find({ 
      user_id: { $in: user_ids },
      status: true,
      notification_active: true // Only users with notifications enabled
    }).select('user_id name email notification_active');

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with notifications enabled'
      });
    }

    // Create the notification
    const notification = new Notification({
      title,
      massage,
      notification_view: notification_view !== undefined ? notification_view : true,
      status: status !== undefined ? status : true,
      created_by
    });

    const savedNotification = await notification.save();

    // Create notification mappings only for users with notification_active = true
    const notificationMappings = [];
    const skippedUsers = [];
    
    for (const user of users) {
      // Double-check notification_active status before creating mapping
      if (user.notification_active === true) {
        const notificationMapping = new NotificationsMapUser({
          notification_id: savedNotification.notification_id,
          user_id: user.user_id,
          notification_view: notification_view !== undefined ? notification_view : true,
          status: status !== undefined ? status : true,
          created_by
        });
        const savedMapping = await notificationMapping.save();
        notificationMappings.push(savedMapping);
      } else {
        skippedUsers.push({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          reason: 'Notifications disabled'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Notification sent successfully to ${notificationMappings.length} users (${skippedUsers.length} users skipped due to disabled notifications)`,
      data: {
        notification: {
          _id: savedNotification._id,
          notification_id: savedNotification.notification_id,
          title: savedNotification.title,
          massage: savedNotification.massage,
          notification_view: savedNotification.notification_view,
          status: savedNotification.status,
          created_at: savedNotification.created_at
        },
        users_count: notificationMappings.length,
        skipped_users_count: skippedUsers.length,
        users_with_notifications: users.filter(user => user.notification_active === true).map(user => ({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          notification_active: user.notification_active
        })),
        skipped_users: skippedUsers
      }
    });
  } catch (error) {
    console.error('Error sending notification to users:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification to users',
      error: error.message
    });
  }
};

export {
  createNotification,
  sendNotificationByIndustryType,
  sendNotificationToUsers,
  updateNotification,
  getNotificationById,
  getAllNotifications
}; 