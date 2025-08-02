import Task from '../models/task.model.js';
import User from '../models/user.model.js';
import MembershipMapUser from '../models/membership-map-user.model.js';
import Notification from '../models/notifications.model.js';
import NotificationsMapUser from '../models/notifications_map_user.model.js';

// Helper function to send task assignment notifications
const sendTaskAssignmentNotification = async (assignedUserId, taskName, notificationTitle, createdBy) => {
  try {
    // Check if the assigned user exists and has notifications enabled
    const assignedUser = await User.findOne({ 
      user_id: assignedUserId, 
      status: true,
      notification_active: true,
      Task_Remidner: true // Check user's task reminder setting
    });

    if (assignedUser) {
      // Create notification
      const notification = new Notification({
        title: notificationTitle,
        massage: `You have been assigned a new task: ${taskName}`,
        notification_type: 'Task Assign',
        notification_view: false,
        status: true,
        created_by: createdBy
      });

      const savedNotification = await notification.save();

      // Create notification mapping for the assigned user
      const notificationMapping = new NotificationsMapUser({
        notification_id: savedNotification._id,
        user_id: assignedUserId,
        notification_view: false,
        status: true
      });

      await notificationMapping.save();
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sending task assignment notification:', error);
    return false;
  }
};

// Create task
export const createTask = async (req, res) => {
  try {
    const { 
      Title_Description,
      Task_name,
      Task_address,
      Task_type,
      Assign_to_id,
      Task_status,
      property_location_id,
      property_type_id,
      transaction_type_id,
      property_sub_type_id,
      internal_area,
      condition,
      washroom,
      number_of_Parking,
      land_area,
      price_of_the_property,
      ReferenceNo
    } = req.body;
    const user_id = req.user.user_id;

    // Required field validation
    const requiredFields = ['Title_Description', 'Task_name', 'Task_address', 'Task_type', 'Assign_to_id'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate Task_type enum
    const validTaskTypes = ['Real Estate', 'Automobile'];
    if (!validTaskTypes.includes(Task_type)) {
      return res.status(400).json({
        success: false,
        message: 'Task_type must be either "Real Estate" or "Automobile"'
      });
    }

    // Validate Task_status enum if provided
    if (Task_status) {
      const validTaskStatuses = ['Pending', 'In Progress', 'Completed'];
      if (!validTaskStatuses.includes(Task_status)) {
        return res.status(400).json({
          success: false,
          message: 'Task_status must be one of: Pending, In Progress, Completed'
        });
      }
    }

    // Validate price if provided
    if (price_of_the_property !== undefined && price_of_the_property < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than or equal to 0'
      });
    }

    // Validate parking number if provided
    if (number_of_Parking !== undefined && number_of_Parking < 0) {
      return res.status(400).json({
        success: false,
        message: 'Number of parking must be greater than or equal to 0'
      });
    }

    const task = new Task({
      Title_Description,
      Task_name,
      Task_address,
      Task_type,
      Assign_to_id,
      Task_status: Task_status || 'Pending',
      property_location_id,
      property_type_id,
      transaction_type_id,
      property_sub_type_id,
      internal_area,
      condition,
      washroom,
      number_of_Parking: number_of_Parking || 0,
      land_area,
      price_of_the_property: price_of_the_property || 0,
      ReferenceNo,
      created_by: user_id
    });

    const savedTask = await task.save();
   
      // Check if the assigned user has Task_Remidner enabled
      const assignedUser = await User.findOne({ 
        user_id: Assign_to_id, 
        status: true,
        notification_active: true,
        Task_Remidner: true // Check user's task reminder setting
      });

      if (assignedUser) {
        await sendTaskAssignmentNotification(Assign_to_id, Task_name, 'New Task Assigned', user_id);
      }
    

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { 
      task_id,
      Title_Description,
      Task_name,
      Task_address,
      Task_type,
      Assign_to_id,
      Task_status,
      property_location_id,
      property_type_id,
      transaction_type_id,
      property_sub_type_id,
      internal_area,
      condition,
      washroom,
      number_of_Parking,
      land_area,
      price_of_the_property,
      ReferenceNo,
      Task_Reminder,
      status
    } = req.body;
    const user_id = req.user.user_id;

    if (!task_id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    const task = await Task.findOne({ task_id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Validate Task_type enum if provided
    if (Task_type) {
      const validTaskTypes = ['Real Estate', 'Automobile'];
      if (!validTaskTypes.includes(Task_type)) {
        return res.status(400).json({
          success: false,
          message: 'Task_type must be either "Real Estate" or "Automobile"'
        });
      }
    }

    // Validate Task_status enum if provided
    if (Task_status) {
      const validTaskStatuses = ['Pending', 'In Progress', 'Completed'];
      if (!validTaskStatuses.includes(Task_status)) {
        return res.status(400).json({
          success: false,
          message: 'Task_status must be one of: Pending, In Progress, Completed'
        });
      }
    }

    // Validate price if provided
    if (price_of_the_property !== undefined && price_of_the_property < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than or equal to 0'
      });
    }

    // Validate parking number if provided
    if (number_of_Parking !== undefined && number_of_Parking < 0) {
      return res.status(400).json({
        success: false,
        message: 'Number of parking must be greater than or equal to 0'
      });
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    // Add provided fields to update data
    if (Title_Description !== undefined) updateData.Title_Description = Title_Description;
    if (Task_name !== undefined) updateData.Task_name = Task_name;
    if (Task_address !== undefined) updateData.Task_address = Task_address;
    if (Task_type !== undefined) updateData.Task_type = Task_type;
    if (Assign_to_id !== undefined) updateData.Assign_to_id = Assign_to_id;
    if (Task_status !== undefined) updateData.Task_status = Task_status;
    if (property_location_id !== undefined) updateData.property_location_id = property_location_id;
    if (property_type_id !== undefined) updateData.property_type_id = property_type_id;
    if (transaction_type_id !== undefined) updateData.transaction_type_id = transaction_type_id;
    if (property_sub_type_id !== undefined) updateData.property_sub_type_id = property_sub_type_id;
    if (internal_area !== undefined) updateData.internal_area = internal_area;
    if (condition !== undefined) updateData.condition = condition;
    if (washroom !== undefined) updateData.washroom = washroom;
    if (number_of_Parking !== undefined) updateData.number_of_Parking = number_of_Parking;
    if (land_area !== undefined) updateData.land_area = land_area;
    if (price_of_the_property !== undefined) updateData.price_of_the_property = price_of_the_property;
    if (ReferenceNo !== undefined) updateData.ReferenceNo = ReferenceNo;
    if (Task_Reminder !== undefined) updateData.Task_Reminder = Task_Reminder;
    if (status !== undefined) updateData.status = status;

    const updatedTask = await Task.findOneAndUpdate(
      { task_id },
      updateData,
      { new: true }
    );

    // Send notification if task is reassigned and Task_Reminder is true
    if (Assign_to_id !== undefined && Assign_to_id !== task.Assign_to_id && Task_Reminder === true) {
      // Check if the newly assigned user has Task_Remidner enabled
      const assignedUser = await User.findOne({ 
        user_id: Assign_to_id, 
        status: true,
        notification_active: true,
        Task_Remidner: true // Check user's task reminder setting
      });

      if (assignedUser) {
        await sendTaskAssignmentNotification(Assign_to_id, updatedTask.Task_name, 'Task Reassigned', user_id);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { task_id } = req.params;

    if (!task_id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    const task = await Task.findOne({ task_id })
      .populate({ path: 'Assign_to_id', select: 'name email', localField: 'Assign_to_id', foreignField: 'user_id' })
      .populate({ path: 'property_location_id', select: 'city', localField: 'property_location_id', foreignField: 'city_id' })
      .populate({ path: 'property_type_id', select: 'type_name', localField: 'property_type_id', foreignField: 'propertytype_id' })
      .populate({ path: 'transaction_type_id', select: 'type_name', localField: 'transaction_type_id', foreignField: 'propertyTransactiontype_id' })
      .populate({ path: 'property_sub_type_id', select: 'sub_type_name', localField: 'property_sub_type_id', foreignField: 'propertysubtype_id' })
      .populate({ path: 'condition', select: 'condition_name', localField: 'condition', foreignField: 'propertycondition_id' })
      .populate({ path: 'washroom', select: 'washroom_name', localField: 'washroom', foreignField: 'propertywashroom_id' })
      .populate({ path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' })
      .populate({ path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error getting task by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      Task_type,
      Task_status,
      Assign_to_id,
      property_location_id,
      property_type_id,
      transaction_type_id,
      property_sub_type_id,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by task type
    if (Task_type) {
      query.Task_type = Task_type;
    }

    // Filter by task status
    if (Task_status) {
      query.Task_status = Task_status;
    }

    // Filter by assigned user
    if (Assign_to_id) {
      query.Assign_to_id = Assign_to_id;
    }

    // Filter by property location
    if (property_location_id) {
      query.property_location_id = property_location_id;
    }

    // Filter by property type
    if (property_type_id) {
      query.property_type_id = property_type_id;
    }

    // Filter by transaction type
    if (transaction_type_id) {
      query.transaction_type_id = transaction_type_id;
    }

    // Filter by property sub type
    if (property_sub_type_id) {
      query.property_sub_type_id = property_sub_type_id;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { Title_Description: { $regex: search, $options: 'i' } },
        { Task_name: { $regex: search, $options: 'i' } },
        { Task_address: { $regex: search, $options: 'i' } },
        { ReferenceNo: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'Assign_to_id', select: 'name email', localField: 'Assign_to_id', foreignField: 'user_id' },
        { path: 'property_location_id', select: 'city', localField: 'property_location_id', foreignField: 'city_id' },
        { path: 'property_type_id', select: 'type_name', localField: 'property_type_id', foreignField: 'propertytype_id' },
        { path: 'transaction_type_id', select: 'type_name', localField: 'transaction_type_id', foreignField: 'propertyTransactiontype_id' },
        { path: 'property_sub_type_id', select: 'sub_type_name', localField: 'property_sub_type_id', foreignField: 'propertysubtype_id' },
        { path: 'condition', select: 'condition_name', localField: 'condition', foreignField: 'propertycondition_id' },
        { path: 'washroom', select: 'washroom_name', localField: 'washroom', foreignField: 'propertywashroom_id' },
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    const result = await Task.paginate(query, options);

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
    console.error('Error getting all tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Task Dashboard API
export const getTaskDashboard = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Get total member count from user model
    const totalMemberCount = await User.countDocuments({ status: true });

    // Get total member subscription count from membership-map-user model where status is true
    const totalMemberSubscriptionCount = await MembershipMapUser.countDocuments({ 
      membership_status: 'active',
      status: true
    });

    // Get task assigned count from task model where Assign_to_id is not null
    const taskAssignedCount = await Task.countDocuments({ 
      Assign_to_id: { $ne: null },
      status: true 
    });

    // Get task completed count from task model where Task_status is 'Completed'
    const taskCompletedCount = await Task.countDocuments({ 
      Task_status: 'Completed',
      status: true 
    });

    // Get task pending count from task model where Task_status is 'Pending'
    const taskPendingCount = await Task.countDocuments({ 
      Task_status: 'Pending',
      status: true 
    });

    res.status(200).json({
      success: true,
      message: 'Task dashboard data retrieved successfully',
      data: {
        totalMemberCount,
        totalMemberSubscriptionCount,
        taskAssignedCount,
        taskCompletedCount,
        taskPendingCount
      }
    });
  } catch (error) {
    console.error('Error getting task dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get tasks by status - Pending
export const getPendingTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      Assign_to_id,
      property_location_id,
      property_type_id,
      transaction_type_id,
      property_sub_type_id,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {
      Task_status: 'Pending',
      status: true
    };

    // Filter by assigned user
    if (Assign_to_id) {
      query.Assign_to_id = Assign_to_id;
    }

    // Filter by property location
    if (property_location_id) {
      query.property_location_id = property_location_id;
    }

    // Filter by property type
    if (property_type_id) {
      query.property_type_id = property_type_id;
    }

    // Filter by transaction type
    if (transaction_type_id) {
      query.transaction_type_id = transaction_type_id;
    }

    // Filter by property sub type
    if (property_sub_type_id) {
      query.property_sub_type_id = property_sub_type_id;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { Title_Description: { $regex: search, $options: 'i' } },
        { Task_name: { $regex: search, $options: 'i' } },
        { Task_address: { $regex: search, $options: 'i' } },
        { ReferenceNo: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'Assign_to_id', select: 'name email', localField: 'Assign_to_id', foreignField: 'user_id' },
        { path: 'property_location_id', select: 'city', localField: 'property_location_id', foreignField: 'city_id' },
        { path: 'property_type_id', select: 'type_name', localField: 'property_type_id', foreignField: 'propertytype_id' },
        { path: 'transaction_type_id', select: 'type_name', localField: 'transaction_type_id', foreignField: 'propertyTransactiontype_id' },
        { path: 'property_sub_type_id', select: 'sub_type_name', localField: 'property_sub_type_id', foreignField: 'propertysubtype_id' },
        { path: 'condition', select: 'condition_name', localField: 'condition', foreignField: 'propertycondition_id' },
        { path: 'washroom', select: 'washroom_name', localField: 'washroom', foreignField: 'propertywashroom_id' },
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    const result = await Task.paginate(query, options);

    res.status(200).json({
      success: true,
      message: `Found ${result.docs.length} pending tasks`,
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
    console.error('Error getting pending tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get tasks by status - In Progress
export const getInProgressTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      Assign_to_id,
      property_location_id,
      property_type_id,
      transaction_type_id,
      property_sub_type_id,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {
      Task_status: 'In Progress',
      status: true
    };

    // Filter by assigned user
    if (Assign_to_id) {
      query.Assign_to_id = Assign_to_id;
    }

    // Filter by property location
    if (property_location_id) {
      query.property_location_id = property_location_id;
    }

    // Filter by property type
    if (property_type_id) {
      query.property_type_id = property_type_id;
    }

    // Filter by transaction type
    if (transaction_type_id) {
      query.transaction_type_id = transaction_type_id;
    }

    // Filter by property sub type
    if (property_sub_type_id) {
      query.property_sub_type_id = property_sub_type_id;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { Title_Description: { $regex: search, $options: 'i' } },
        { Task_name: { $regex: search, $options: 'i' } },
        { Task_address: { $regex: search, $options: 'i' } },
        { ReferenceNo: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'Assign_to_id', select: 'name email', localField: 'Assign_to_id', foreignField: 'user_id' },
        { path: 'property_location_id', select: 'city', localField: 'property_location_id', foreignField: 'city_id' },
        { path: 'property_type_id', select: 'type_name', localField: 'property_type_id', foreignField: 'propertytype_id' },
        { path: 'transaction_type_id', select: 'type_name', localField: 'transaction_type_id', foreignField: 'propertyTransactiontype_id' },
        { path: 'property_sub_type_id', select: 'sub_type_name', localField: 'property_sub_type_id', foreignField: 'propertysubtype_id' },
        { path: 'condition', select: 'condition_name', localField: 'condition', foreignField: 'propertycondition_id' },
        { path: 'washroom', select: 'washroom_name', localField: 'washroom', foreignField: 'propertywashroom_id' },
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    const result = await Task.paginate(query, options);

    res.status(200).json({
      success: true,
      message: `Found ${result.docs.length} in-progress tasks`,
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
    console.error('Error getting in-progress tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get tasks by status - Completed
export const getCompletedTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      Assign_to_id,
      property_location_id,
      property_type_id,
      transaction_type_id,
      property_sub_type_id,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {
      Task_status: 'Completed',
      status: true
    };

    // Filter by assigned user
    if (Assign_to_id) {
      query.Assign_to_id = Assign_to_id;
    }

    // Filter by property location
    if (property_location_id) {
      query.property_location_id = property_location_id;
    }

    // Filter by property type
    if (property_type_id) {
      query.property_type_id = property_type_id;
    }

    // Filter by transaction type
    if (transaction_type_id) {
      query.transaction_type_id = transaction_type_id;
    }

    // Filter by property sub type
    if (property_sub_type_id) {
      query.property_sub_type_id = property_sub_type_id;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { Title_Description: { $regex: search, $options: 'i' } },
        { Task_name: { $regex: search, $options: 'i' } },
        { Task_address: { $regex: search, $options: 'i' } },
        { ReferenceNo: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'Assign_to_id', select: 'name email', localField: 'Assign_to_id', foreignField: 'user_id' },
        { path: 'property_location_id', select: 'city', localField: 'property_location_id', foreignField: 'city_id' },
        { path: 'property_type_id', select: 'type_name', localField: 'property_type_id', foreignField: 'propertytype_id' },
        { path: 'transaction_type_id', select: 'type_name', localField: 'transaction_type_id', foreignField: 'propertyTransactiontype_id' },
        { path: 'property_sub_type_id', select: 'sub_type_name', localField: 'property_sub_type_id', foreignField: 'propertysubtype_id' },
        { path: 'condition', select: 'condition_name', localField: 'condition', foreignField: 'propertycondition_id' },
        { path: 'washroom', select: 'washroom_name', localField: 'washroom', foreignField: 'propertywashroom_id' },
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    const result = await Task.paginate(query, options);

    res.status(200).json({
      success: true,
      message: `Found ${result.docs.length} completed tasks`,
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
    console.error('Error getting completed tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get tasks by status - Universal function
export const getTasksByStatus = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      Assign_to_id,
      property_location_id,
      property_type_id,
      transaction_type_id,
      property_sub_type_id,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    // Base query for all statuses
    const baseQuery = {
      status: true
    };

    // Filter by assigned user
    if (Assign_to_id) {
      baseQuery.Assign_to_id = Assign_to_id;
    }

    // Filter by property location
    if (property_location_id) {
      baseQuery.property_location_id = property_location_id;
    }

    // Filter by property type
    if (property_type_id) {
      baseQuery.property_type_id = property_type_id;
    }

    // Filter by transaction type
    if (transaction_type_id) {
      baseQuery.transaction_type_id = transaction_type_id;
    }

    // Filter by property sub type
    if (property_sub_type_id) {
      baseQuery.property_sub_type_id = property_sub_type_id;
    }

    // Search functionality
    if (search) {
      baseQuery.$or = [
        { Title_Description: { $regex: search, $options: 'i' } },
        { Task_name: { $regex: search, $options: 'i' } },
        { Task_address: { $regex: search, $options: 'i' } },
        { ReferenceNo: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'Assign_to_id', select: 'name email', localField: 'Assign_to_id', foreignField: 'user_id' },
        { path: 'property_location_id', select: 'city', localField: 'property_location_id', foreignField: 'city_id' },
        { path: 'property_type_id', select: 'type_name', localField: 'property_type_id', foreignField: 'propertytype_id' },
        { path: 'transaction_type_id', select: 'type_name', localField: 'transaction_type_id', foreignField: 'propertyTransactiontype_id' },
        { path: 'property_sub_type_id', select: 'sub_type_name', localField: 'property_sub_type_id', foreignField: 'propertysubtype_id' },
        { path: 'condition', select: 'condition_name', localField: 'condition', foreignField: 'propertycondition_id' },
        { path: 'washroom', select: 'washroom_name', localField: 'washroom', foreignField: 'propertywashroom_id' },
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    // Get tasks for each status
    const [pendingTasks, inProgressTasks, completedTasks] = await Promise.all([
      Task.paginate({ ...baseQuery, Task_status: 'Pending' }, options),
      Task.paginate({ ...baseQuery, Task_status: 'In Progress' }, options),
      Task.paginate({ ...baseQuery, Task_status: 'Completed' }, options)
    ]);

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully by status',
      data: {
        pending: {
          tasks: pendingTasks.docs,
          count: pendingTasks.totalDocs,
          pagination: {
            totalDocs: pendingTasks.totalDocs,
            limit: pendingTasks.limit,
            page: pendingTasks.page,
            totalPages: pendingTasks.totalPages,
            hasNextPage: pendingTasks.hasNextPage,
            hasPrevPage: pendingTasks.hasPrevPage
          }
        },
        inProgress: {
          tasks: inProgressTasks.docs,
          count: inProgressTasks.totalDocs,
          pagination: {
            totalDocs: inProgressTasks.totalDocs,
            limit: inProgressTasks.limit,
            page: inProgressTasks.page,
            totalPages: inProgressTasks.totalPages,
            hasNextPage: inProgressTasks.hasNextPage,
            hasPrevPage: inProgressTasks.hasPrevPage
          }
        },
        completed: {
          tasks: completedTasks.docs,
          count: completedTasks.totalDocs,
          pagination: {
            totalDocs: completedTasks.totalDocs,
            limit: completedTasks.limit,
            page: completedTasks.page,
            totalPages: completedTasks.totalPages,
            hasNextPage: completedTasks.hasNextPage,
            hasPrevPage: completedTasks.hasPrevPage
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting tasks by status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send task reminder notification
export const sendTaskReminder = async (req, res) => {
  try {
    const { task_id } = req.params;
    const user_id = req.user.user_id;

    if (!task_id) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
    }

    // Find the task
    const task = await Task.findOne({ task_id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if task has an assignee
    if (!task.Assign_to_id) {
      return res.status(400).json({
        success: false,
        message: 'Task is not assigned to anyone'
      });
    }

    // Send reminder notification
    const notificationSent = await sendTaskAssignmentNotification(
      task.Assign_to_id, 
      task.Task_name, 
      'Task Reminder', 
      user_id
    );

    if (notificationSent) {
      res.status(200).json({
        success: true,
        message: 'Task reminder sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send task reminder. User may not have notifications enabled.'
      });
    }
  } catch (error) {
    console.error('Error sending task reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};