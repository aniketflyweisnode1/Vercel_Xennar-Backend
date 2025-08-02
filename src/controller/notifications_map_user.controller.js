import NotificationsMapUser from '../models/notifications_map_user.model.js';


// Get notification map user by ID
const getNotificationMapUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const notificationMapUser = await NotificationsMapUser.findOne({ user_id: id })
      
      
      ;
    if (!notificationMapUser) {
      return res.status(404).json({
        success: false,
        message: 'Notification map user not found'
      });
    }
    res.json({
      success: true,
      data: notificationMapUser
    });
  } catch (error) {
    console.error('Error getting notification map user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification map user',
      error: error.message
    });
  }
};

// Get all notification map users
const getAllNotificationMapUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    if (status !== undefined) {
      query.status = status === 'true';
    }
    if (search) {
      query.user_id = { $regex: search, $options: 'i' };
    }
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };
    const notificationMapUsers = await NotificationsMapUser.paginate(query, options);
    res.json({
      success: true,
      data: notificationMapUsers.docs,
      pagination: {
        totalDocs: notificationMapUsers.totalDocs,
        limit: notificationMapUsers.limit,
        totalPages: notificationMapUsers.totalPages,
        page: notificationMapUsers.page,
        pagingCounter: notificationMapUsers.pagingCounter,
        hasPrevPage: notificationMapUsers.hasPrevPage,
        hasNextPage: notificationMapUsers.hasNextPage,
        prevPage: notificationMapUsers.prevPage,
        nextPage: notificationMapUsers.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting notification map users:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification map users',
      error: error.message
    });
  }
};

// Get all notification mappings for authenticated user
const getAllNotificationMapByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 10, status, notification_view } = req.query;
    
    const query = { user_id: userId };
    
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    if (notification_view !== undefined) {
      query.notification_view = notification_view === 'true';
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };
    
    const notificationMapUsers = await NotificationsMapUser.paginate(query, options);
    
    res.json({
      success: true,
      message: 'Notification mappings retrieved successfully',
      data: notificationMapUsers.docs,
      pagination: {
        totalDocs: notificationMapUsers.totalDocs,
        limit: notificationMapUsers.limit,
        totalPages: notificationMapUsers.totalPages,
        page: notificationMapUsers.page,
        pagingCounter: notificationMapUsers.pagingCounter,
        hasPrevPage: notificationMapUsers.hasPrevPage,
        hasNextPage: notificationMapUsers.hasNextPage,
        prevPage: notificationMapUsers.prevPage,
        nextPage: notificationMapUsers.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting notification mappings for authenticated user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification mappings for authenticated user',
      error: error.message
    });
  }
};



// Mark notification as viewed
const viewNotification = async (req, res) => {
  try {
    const { notification_map_id } = req.body;
    const userId = req.user.user_id;

    if (!notification_map_id) {
      return res.status(400).json({
        success: false,
        message: 'Notification map ID is required'
      });
    }

    // Check if notification mapping exists and belongs to the authenticated user
    const existingNotificationMap = await NotificationsMapUser.findOne({ 
      notification_map_id: notification_map_id,
      user_id: userId 
    });

    if (!existingNotificationMap) {
      return res.status(404).json({
        success: false,
        message: 'Notification mapping not found or does not belong to you'
      });
    }

    // Update notification_view to true
    const updatedNotificationMap = await NotificationsMapUser.findOneAndUpdate(
      { 
        notification_map_id: notification_map_id,
        user_id: userId 
      },
      { 
        notification_view: true,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Notification marked as viewed successfully',
      data: {
        notification_map_id: updatedNotificationMap.notification_map_id,
        notification_id: updatedNotificationMap.notification_id,
        user_id: updatedNotificationMap.user_id,
        notification_view: updatedNotificationMap.notification_view,
        status: updatedNotificationMap.status,
        updated_at: updatedNotificationMap.updated_at
      }
    });
  } catch (error) {
    console.error('Error marking notification as viewed:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as viewed',
      error: error.message
    });
  }
};


export {
  getNotificationMapUserById,
  getAllNotificationMapUsers,
  getAllNotificationMapByAuth,
  viewNotification
}; 


