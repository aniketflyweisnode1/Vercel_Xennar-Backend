import Property from '../models/property.model.js';
import PropertyType from '../models/property-type.model.js';
import User from '../models/user.model.js';
import Task from '../models/task.model.js';
import mongoose from 'mongoose';

// Create property
const createProperty = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const propertyData = {
      ...req.body,
      created_by: userId
    };

    const property = new Property(propertyData);
    const savedProperty = await property.save();

    // Get the saved property without populate
    const populatedProperty = await Property.findOne({ property_id: savedProperty.property_id });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: populatedProperty
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: error.message
    });
  }
};

// Get property by ID
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findOne({ property_id: id });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error getting property by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting property by ID',
      error: error.message
    });
  }
};

// Get all properties
const getAllProperties = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      property_type_id,
      transaction_type_id,
      location_city_id,
      listing_approval,
      min_price,
      max_price
    } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Filter by listing approval if provided
    if (listing_approval !== undefined) {
      query.listing_approval = listing_approval === 'true';
    }
    
    // Filter by property type if provided
    if (property_type_id) {
      query.property_type_id = property_type_id;
    }
    
    // Filter by transaction type if provided
    if (transaction_type_id) {
      query.transaction_type_id = transaction_type_id;
    }
    
    // Filter by location city if provided
    if (location_city_id) {
      query.location_city_id = location_city_id;
    }
    
    // Filter by price range if provided
    if (min_price || max_price) {
      query.price_the_property = {};
      if (min_price) query.price_the_property.$gte = parseFloat(min_price);
      if (max_price) query.price_the_property.$lte = parseFloat(max_price);
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { property_title: { $regex: search, $options: 'i' } },
        { property_name: { $regex: search, $options: 'i' } },
        { reference_number: { $regex: search, $options: 'i' } },
        { owner_builder_name: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const properties = await Property.paginate(query, options);

    res.json({
      success: true,
      data: properties.docs,
      pagination: {
        totalDocs: properties.totalDocs,
        limit: properties.limit,
        totalPages: properties.totalPages,
        page: properties.page,
        pagingCounter: properties.pagingCounter,
        hasPrevPage: properties.hasPrevPage,
        hasNextPage: properties.hasNextPage,
        prevPage: properties.prevPage,
        nextPage: properties.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting properties',
      error: error.message
    });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required in body' });
    }

    const updateData = {
      ...updateFields,
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedProperty = await Property.findOneAndUpdate(
      { property_id: id },
      updateData,
      { new: true, runValidators: true }
    )
    
    
    
    
    
    
    
    
    
    
    ;

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message
    });
  }
};

// Get properties by property type names
const getPropertiesByPropertyType = async (req, res) => {
  try {
    // First, get all property types
    const PropertyType = mongoose.model('PropertyType');
    const allPropertyTypes = await PropertyType.find({ status: true }).select('property_type_id property_type');

    // Initialize result object
    const result = {
      Residential: [],
      Commercial: [],
      Land: []
    };

    // Get properties for each property type
    for (const propertyType of allPropertyTypes) {
      const properties = await Property.find({ 
        property_type_id: propertyType.property_type_id,
        status: true 
      });
      // Categorize properties based on property type name
      const propertyTypeName = propertyType.property_type.toLowerCase();   
      if (propertyTypeName.includes('residential')){
        result.Residential.push(...properties);
      } else if (propertyTypeName.includes('commercial')) {
        result.Commercial.push(...properties);
      } else if (propertyTypeName.includes('land')) {
        result.Land.push(...properties);
      }
    }

    // Calculate counts
    const counts = {
      Residential: result.Residential.length,
      Commercial: result.Commercial.length,
      Land: result.Land.length,
      total: result.Residential.length + result.Commercial.length + result.Land.length
    };

    res.json({
      success: true,
      message: `Found ${counts.total} properties across all categories`,
      data: result,
      counts: counts
    });
  } catch (error) {
    console.error('Error getting properties by property type:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting properties by property type',
      error: error.message
    });
  }
};

// Get properties created by authenticated user
const getPropertiesByAuthUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 10, status, listing_approval } = req.query;

    const query = { created_by: userId };
    
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const properties = await Property.paginate(query, options);

    // Get all property types to categorize properties
    const allPropertyTypes = await PropertyType.find({ status: true });

    // Get all properties for the authenticated user to calculate counts
    const allUserProperties = await Property.find({ created_by: userId });

    // Initialize result object for property counts
    const propertyCounts = {
      Residential: 0,
      Commercial: 0,
      Land: 0
    };

    // Calculate counts for each property type
    for (const property of allUserProperties) {
      const propertyType = allPropertyTypes.find(pt => pt.property_type_id === property.property_type_id);
      if (propertyType) {
        const propertyTypeName = propertyType.property_type.toLowerCase();
        if (propertyTypeName.includes('residential')) {
          propertyCounts.Residential++;
        } else if (propertyTypeName.includes('commercial')) {
          propertyCounts.Commercial++;
        } else if (propertyTypeName.includes('land')) {
          propertyCounts.Land++;
        }
      }
    }

    // Calculate total count
    propertyCounts.total = propertyCounts.Residential + propertyCounts.Commercial + propertyCounts.Land;

    res.json({
      success: true,
      message: `Found ${properties.docs.length} properties created by you`,
      data: properties.docs,
      count: properties.totalDocs,
      propertyCounts: propertyCounts,
      pagination: {
        totalDocs: properties.totalDocs,
        limit: properties.limit,
        totalPages: properties.totalPages,
        page: properties.page,
        pagingCounter: properties.pagingCounter,
        hasPrevPage: properties.hasPrevPage,
        hasNextPage: properties.hasNextPage,
        prevPage: properties.prevPage,
        nextPage: properties.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting properties by auth user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting properties by auth user',
      error: error.message
    });
  }
};

// Update mark_rented field by property ID
const updateMarkRented = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id, mark_rented } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    if (mark_rented === undefined) {
      return res.status(400).json({
        success: false,
        message: 'mark_rented field is required'
      });
    }

    const updateData = {
      mark_rented: Boolean(mark_rented),
      updated_by: userId,
      updated_at: new Date()
    };

    const updatedProperty = await Property.findOneAndUpdate(
      { property_id: parseInt(id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: `Property mark_rented updated successfully to ${mark_rented}`,
      data: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property mark_rented:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property mark_rented',
      error: error.message
    });
  }
};

// Get one new team member added today and latest completed task
const getTeamMemberAndTaskData = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    
    // Get current date (start and end of today)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Get one new team member added today by the authenticated user
    const newTeamMember = await User.findOne({
      created_by: user_id,
      created_at: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: true
    })
    .select('user_id name email mobile user_industryType created_at')
    .sort({ created_at: -1 })
    .limit(1);

    // Get the latest completed task for assigned users today
    const latestCompletedTask = await Task.findOne({
      Task_status: 'Completed',
      updated_at: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: true
    })
    .populate({
      path: 'Assign_to_id',
      select: 'user_id name email mobile',
      model: 'User'
    })
    .select('task_id Task_name Task_status Assign_to_id updated_at')
    .sort({ updated_at: -1 })
    .limit(1);

    // Get count of team members added today
    const teamMembersAddedToday = await User.countDocuments({
      created_by: user_id,
      created_at: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: true
    });

    // Get count of completed tasks today
    const completedTasksToday = await Task.countDocuments({
      Task_status: 'Completed',
      updated_at: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: true
    });

    // Get all completed tasks today with assigned user details
    const allCompletedTasksToday = await Task.find({
      Task_status: 'Completed',
      updated_at: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: true
    })
    .populate({
      path: 'Assign_to_id',
      select: 'user_id name email mobile',
      model: 'User'
    })
    .select('task_id Task_name Task_status Assign_to_id updated_at')
    .sort({ updated_at: -1 });

    res.json({
      success: true,
      message: 'Team member and task data retrieved successfully',
      data: {
        today: {
          date: today.toISOString().split('T')[0],
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString()
        },
        newTeamMember: {
          found: !!newTeamMember,
          data: newTeamMember,
          count: teamMembersAddedToday
        },
        latestCompletedTask: {
          found: !!latestCompletedTask,
          data: latestCompletedTask,
          count: completedTasksToday,
          allCompletedTasks: allCompletedTasksToday
        }
      }
    });
  } catch (error) {
    console.error('Error getting team member and task data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting team member and task data',
      error: error.message
    });
  }
};

export {
  createProperty,
  getPropertyById,
  getAllProperties,
  updateProperty,
  getPropertiesByPropertyType,
  getPropertiesByAuthUser,
  updateMarkRented,
  getTeamMemberAndTaskData
}; 