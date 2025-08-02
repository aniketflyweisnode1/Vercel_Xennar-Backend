import Report from '../models/report.model.js';
import Task from '../models/task.model.js';
import User from '../models/user.model.js';

// Helper function to generate report data
const generateReportData = async (userId) => {
  try {
    // Get all tasks for the user
    const tasks = await Task.find({ 
      user_id: userId,
      status: { $in: ['pending', 'completed', 'in_progress'] }
    });

    // Calculate total tasks
    const totalTasks = tasks.length;

    // Get completed tasks
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const completedCount = completedTasks.length;

    // Calculate overall status percentage
    const statusPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Get last completed task date
    const lastCompletedTask = completedTasks.length > 0 
      ? completedTasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]
      : null;

    // Generate task breakdown by type
    const taskBreakdown = [];
    const taskTypes = [...new Set(tasks.map(task => task.task_type).filter(Boolean))];

    taskTypes.forEach(taskType => {
      const typeTasks = tasks.filter(task => task.task_type === taskType);
      const typeCompleted = typeTasks.filter(task => task.status === 'completed').length;
      const typePercentage = typeTasks.length > 0 ? Math.round((typeCompleted / typeTasks.length) * 100) : 0;

      taskBreakdown.push({
        task_type: taskType,
        total_tasks: typeTasks.length,
        completed_tasks: typeCompleted,
        percentage: typePercentage
      });
    });

    return {
      Total_Task: totalTasks,
      status: statusPercentage,
      last_completed_Task: lastCompletedTask ? lastCompletedTask.updated_at : null,
      TaskBreakdown: taskBreakdown
    };
  } catch (error) {
    console.error('Error generating report data:', error);
    throw error;
  }
};

// Create report
const createReport = async (req, res) => {
  try {
    const { user_id, Total_Task, status, last_completed_Task, TaskBreakdown } = req.body;
    const createdBy = req.user.user_id;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
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

    // Check if report already exists for this user
    const existingReport = await Report.findOne({
      user_id: parseInt(user_id),
      status: { $gte: 0 }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Report already exists for this user'
      });
    }

    // Generate report data if not provided
    let reportData = {};
    if (Total_Task === undefined || status === undefined) {
      reportData = await generateReportData(parseInt(user_id));
    } else {
      reportData = {
        Total_Task: Total_Task || 0,
        status: status || 0,
        last_completed_Task: last_completed_Task || null,
        TaskBreakdown: TaskBreakdown || []
      };
    }

    // Create report
    const report = new Report({
      user_id: parseInt(user_id),
      Total_Task: reportData.Total_Task,
      status: reportData.status,
      last_completed_Task: reportData.last_completed_Task,
      TaskBreakdown: reportData.TaskBreakdown,
      created_by: createdBy
    });

    const savedReport = await report.save();

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: savedReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

// Update report
const updateReport = async (req, res) => {
  try {
    const { report_id, user_id, Total_Task, status, last_completed_Task, TaskBreakdown } = req.body;
    const updatedBy = req.user.user_id;

    // Validate required fields
    if (!report_id) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }

    // Check if report exists
    const existingReport = await Report.findOne({ report_id: parseInt(report_id) });
    
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // If user_id is being changed, validate the new user
    if (user_id && user_id !== existingReport.user_id) {
      const user = await User.findOne({ user_id: parseInt(user_id) });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    // Generate updated report data if needed
    let reportData = {};
    if (Total_Task === undefined || status === undefined) {
      reportData = await generateReportData(user_id || existingReport.user_id);
    } else {
      reportData = {
        Total_Task: Total_Task !== undefined ? Total_Task : existingReport.Total_Task,
        status: status !== undefined ? status : existingReport.status,
        last_completed_Task: last_completed_Task !== undefined ? last_completed_Task : existingReport.last_completed_Task,
        TaskBreakdown: TaskBreakdown !== undefined ? TaskBreakdown : existingReport.TaskBreakdown
      };
    }

    // Update report
    const updatedReport = await Report.findOneAndUpdate(
      { report_id: parseInt(report_id) },
      {
        user_id: user_id ? parseInt(user_id) : existingReport.user_id,
        Total_Task: reportData.Total_Task,
        status: reportData.status,
        last_completed_Task: reportData.last_completed_Task,
        TaskBreakdown: reportData.TaskBreakdown,
        updated_by: updatedBy,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

// Get report by ID (auto-generate if needed)
const getReportById = async (req, res) => {
  try {
    const { report_id } = req.params;
    
    let report = await Report.findOne({ report_id: parseInt(report_id) });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Auto-generate updated report data
    const updatedReportData = await generateReportData(report.user_id);
    
    // Update the report with fresh data
    report = await Report.findOneAndUpdate(
      { report_id: parseInt(report_id) },
      {
        Total_Task: updatedReportData.Total_Task,
        status: updatedReportData.status,
        last_completed_Task: updatedReportData.last_completed_Task,
        TaskBreakdown: updatedReportData.TaskBreakdown,
        updated_at: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Report retrieved and updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error getting report by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting report by ID',
      error: error.message
    });
  }
};

// Get all reports (auto-generate for each)
const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, status, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {};
    
    // Filter by user_id if provided
    if (user_id) {
      query.user_id = parseInt(user_id);
    }

    // Filter by status if provided
    if (status !== undefined) {
      query.status = parseInt(status);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const reports = await Report.paginate(query, options);

    // Auto-generate updated data for each report
    const updatedReports = await Promise.all(
      reports.docs.map(async (report) => {
        try {
          const updatedReportData = await generateReportData(report.user_id);
          
          const updatedReport = await Report.findOneAndUpdate(
            { report_id: report.report_id },
            {
              Total_Task: updatedReportData.Total_Task,
              status: updatedReportData.status,
              last_completed_Task: updatedReportData.last_completed_Task,
              TaskBreakdown: updatedReportData.TaskBreakdown,
              updated_at: new Date()
            },
            { new: true }
          );
          
          return updatedReport;
        } catch (error) {
          console.error(`Error updating report ${report.report_id}:`, error);
          return report; // Return original if update fails
        }
      })
    );

    res.json({
      success: true,
      message: 'Reports retrieved and updated successfully',
      data: updatedReports,
      pagination: {
        totalDocs: reports.totalDocs,
        limit: reports.limit,
        totalPages: reports.totalPages,
        page: reports.page,
        pagingCounter: reports.pagingCounter,
        hasPrevPage: reports.hasPrevPage,
        hasNextPage: reports.hasNextPage,
        prevPage: reports.prevPage,
        nextPage: reports.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting all reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all reports',
      error: error.message
    });
  }
};

// Get reports by authenticated user (auto-generate)
const getReportsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const query = {
      user_id: userId
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 }
    };

    const reports = await Report.paginate(query, options);

    // Auto-generate updated data for user's reports
    const updatedReports = await Promise.all(
      reports.docs.map(async (report) => {
        try {
          const updatedReportData = await generateReportData(userId);
          
          const updatedReport = await Report.findOneAndUpdate(
            { report_id: report.report_id },
            {
              Total_Task: updatedReportData.Total_Task,
              status: updatedReportData.status,
              last_completed_Task: updatedReportData.last_completed_Task,
              TaskBreakdown: updatedReportData.TaskBreakdown,
              updated_at: new Date()
            },
            { new: true }
          );
          
          return updatedReport;
        } catch (error) {
          console.error(`Error updating report ${report.report_id}:`, error);
          return report; // Return original if update fails
        }
      })
    );

    res.json({
      success: true,
      message: 'User reports retrieved and updated successfully',
      data: updatedReports,
      pagination: {
        totalDocs: reports.totalDocs,
        limit: reports.limit,
        totalPages: reports.totalPages,
        page: reports.page,
        pagingCounter: reports.pagingCounter,
        hasPrevPage: reports.hasPrevPage,
        hasNextPage: reports.hasNextPage,
        prevPage: reports.prevPage,
        nextPage: reports.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting reports by auth:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting reports by auth',
      error: error.message
    });
  }
};

export {
  createReport,
  updateReport,
  getReportById,
  getAllReports,
  getReportsByAuth
}; 