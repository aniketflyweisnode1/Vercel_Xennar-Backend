import Automobiles from '../models/automobiles.model.js';

// Create automobile
export const createAutomobile = async (req, res) => {
  try {
    const {
      Title,
      location,
      vehicle_type,
      vehicle_Transaction_type,
      transmission,
      fuelType,
      brand_name,
      model_name,
      Year_built,
      Engine_capacity,
      colour,
      price_of_Vehicle,
      ReferanceNo,
      recording_portrait,
      recording_landscape,
      vehicle_photo,
      vehicle_FullPhoto,
      vehicle_photowithname,
      set_cover_photo,
      setTemplate,
      setMusic,
      VehicleNo,
      OwnerName,
      OwnerMobile,
      OwnerEmail,
      listing_approval,
    } = req.body;

    const user_id = req.user.user_id;

    // Required field validation
    const requiredFields = [
      'Title', 'location', 'vehicle_type', 'vehicle_Transaction_type',
      'transmission', 'fuelType', 'brand_name', 'model_name', 'Year_built',
      'Engine_capacity', 'colour', 'price_of_Vehicle', 'ReferanceNo',
      'VehicleNo', 'OwnerName', 'OwnerMobile', 'OwnerEmail'
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Check if automobile with same reference number already exists
    const existingAutomobile = await Automobiles.findOne({ ReferanceNo });
    if (existingAutomobile) {
      return res.status(400).json({
        success: false,
        message: 'Automobile with this reference number already exists'
      });
    }

    // Check if automobile with same vehicle number already exists
    const existingVehicleNo = await Automobiles.findOne({ VehicleNo });
    if (existingVehicleNo) {
      return res.status(400).json({
        success: false,
        message: 'Automobile with this vehicle number already exists'
      });
    }

    // Validate Year_built
    const currentYear = new Date().getFullYear();
    if (Year_built < 1900 || Year_built > currentYear + 1) {
      return res.status(400).json({
        success: false,
        message: 'Year built must be between 1900 and next year'
      });
    }

    // Validate price
    if (price_of_Vehicle <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(OwnerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate mobile number (basic validation)
    if (OwnerMobile.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be at least 10 digits'
      });
    }

    const automobile = new Automobiles({
      Title,
      location,
      vehicle_type,
      vehicle_Transaction_type,
      transmission,
      fuelType,
      brand_name,
      model_name,
      Year_built,
      Engine_capacity,
      colour,
      price_of_Vehicle,
      ReferanceNo,
      recording_portrait,
      recording_landscape,
      vehicle_photo: vehicle_photo || [],
      vehicle_FullPhoto,
      vehicle_photowithname: vehicle_photowithname || [],
      set_cover_photo,
      setTemplate,
      setMusic,
      VehicleNo,
      OwnerName,
      OwnerMobile,
      OwnerEmail,
      listing_approval,
      created_by: user_id
    });

    const savedAutomobile = await automobile.save();

    res.status(201).json({
      success: true,
      message: 'Automobile created successfully',
      data: savedAutomobile
    });
  } catch (error) {
    console.error('Error creating automobile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update automobile
export const updateAutomobile = async (req, res) => {
  try {
    const { Automobiles_id } = req.body;
    const user_id = req.user.user_id;

    if (!Automobiles_id) {
      return res.status(400).json({
        success: false,
        message: 'Automobile ID is required'
      });
    }

    const automobile = await Automobiles.findOne({ Automobiles_id });
    if (!automobile) {
      return res.status(404).json({
        success: false,
        message: 'Automobile not found'
      });
    }

    // Check if new reference number already exists (excluding current record)
    if (req.body.ReferanceNo && req.body.ReferanceNo !== automobile.ReferanceNo) {
      const existingAutomobile = await Automobiles.findOne({ 
        ReferanceNo: req.body.ReferanceNo,
        Automobiles_id: { $ne: Automobiles_id } 
      });
      if (existingAutomobile) {
        return res.status(400).json({
          success: false,
          message: 'Automobile with this reference number already exists'
        });
      }
    }

    // Check if new vehicle number already exists (excluding current record)
    if (req.body.VehicleNo && req.body.VehicleNo !== automobile.VehicleNo) {
      const existingVehicleNo = await Automobiles.findOne({ 
        VehicleNo: req.body.VehicleNo,
        Automobiles_id: { $ne: Automobiles_id } 
      });
      if (existingVehicleNo) {
        return res.status(400).json({
          success: false,
          message: 'Automobile with this vehicle number already exists'
        });
      }
    }

    // Validate Year_built if provided
    if (req.body.Year_built) {
      const currentYear = new Date().getFullYear();
      if (req.body.Year_built < 1900 || req.body.Year_built > currentYear + 1) {
        return res.status(400).json({
          success: false,
          message: 'Year built must be between 1900 and next year'
        });
      }
    }

    // Validate price if provided
    if (req.body.price_of_Vehicle && req.body.price_of_Vehicle <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Validate email format if provided
    if (req.body.OwnerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.OwnerEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    // Validate mobile number if provided
    if (req.body.OwnerMobile && req.body.OwnerMobile.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be at least 10 digits'
      });
    }

    const updateData = {
      updated_by: user_id,
      updated_at: new Date()
    };

    // Add all provided fields to update data
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    const updatedAutomobile = await Automobiles.findOneAndUpdate(
      { Automobiles_id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Automobile updated successfully',
      data: updatedAutomobile
    });
  } catch (error) {
    console.error('Error updating automobile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get automobile by ID
export const getAutomobileById = async (req, res) => {
  try {
    const { Automobiles_id } = req.params;

    if (!Automobiles_id) {
      return res.status(400).json({
        success: false,
        message: 'Automobile ID is required'
      });
    }

    const automobile = await Automobiles.findOne({ Automobiles_id })
      .populate({ path: 'location', select: 'city', localField: 'location', foreignField: 'city_id' })
      .populate({ path: 'vehicle_type', select: 'type_name', localField: 'vehicle_type', foreignField: 'vehicletype_id' })
      .populate({ path: 'vehicle_Transaction_type', select: 'type_name', localField: 'vehicle_Transaction_type', foreignField: 'vehicleTransactiontype_id' })
      .populate({ path: 'transmission', select: 'transmission_name', localField: 'transmission', foreignField: 'transmission_id' })
      .populate({ path: 'fuelType', select: 'fuelType_name', localField: 'fuelType', foreignField: 'fuelType_id' })
      .populate({ path: 'setTemplate', select: 'template_name', localField: 'setTemplate', foreignField: 'template_id' })
      .populate({ path: 'setMusic', select: 'music_name', localField: 'setMusic', foreignField: 'music_id' })
      .populate({ path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' })
      .populate({ path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' });

    if (!automobile) {
      return res.status(404).json({
        success: false,
        message: 'Automobile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: automobile
    });
  } catch (error) {
    console.error('Error getting automobile by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all automobiles
export const getAllAutomobiles = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      location,
      vehicle_type,
      vehicle_Transaction_type,
      transmission,
      fuelType,
      brand_name,
      Year_built,
      price_min,
      price_max,
      listing_approval,
      Soldstatus,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by location
    if (location) {
      query.location = location;
    }

    // Filter by vehicle type
    if (vehicle_type) {
      query.vehicle_type = vehicle_type;
    }

    // Filter by vehicle transaction type
    if (vehicle_Transaction_type) {
      query.vehicle_Transaction_type = vehicle_Transaction_type;
    }

    // Filter by transmission
    if (transmission) {
      query.transmission = transmission;
    }

    // Filter by fuel type
    if (fuelType) {
      query.fuelType = fuelType;
    }

    // Filter by brand name
    if (brand_name) {
      query.brand_name = { $regex: brand_name, $options: 'i' };
    }

    // Filter by year built
    if (Year_built) {
      query.Year_built = Year_built;
    }

    // Filter by price range
    if (price_min || price_max) {
      query.price_of_Vehicle = {};
      if (price_min) query.price_of_Vehicle.$gte = parseFloat(price_min);
      if (price_max) query.price_of_Vehicle.$lte = parseFloat(price_max);
    }

    // Filter by listing approval
    if (listing_approval) {
      query.listing_approval = listing_approval;
    }

    // Filter by sold status
    if (Soldstatus) {
      query.Soldstatus = Soldstatus;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { Title: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { model_name: { $regex: search, $options: 'i' } },
        { ReferanceNo: { $regex: search, $options: 'i' } },
        { VehicleNo: { $regex: search, $options: 'i' } },
        { OwnerName: { $regex: search, $options: 'i' } },
        { OwnerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'location', select: 'city', localField: 'location', foreignField: 'city_id' },
        { path: 'vehicle_type', select: 'type_name', localField: 'vehicle_type', foreignField: 'vehicletype_id' },
        { path: 'vehicle_Transaction_type', select: 'type_name', localField: 'vehicle_Transaction_type', foreignField: 'vehicleTransactiontype_id' },
        { path: 'transmission', select: 'transmission_name', localField: 'transmission', foreignField: 'transmission_id' },
        { path: 'fuelType', select: 'fuelType_name', localField: 'fuelType', foreignField: 'fuelType_id' },
        { path: 'setTemplate', select: 'template_name', localField: 'setTemplate', foreignField: 'template_id' },
        { path: 'setMusic', select: 'music_name', localField: 'setMusic', foreignField: 'music_id' },
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    const result = await Automobiles.paginate(query, options);

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
    console.error('Error getting all automobiles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get automobiles by authenticated user
export const getAutomobilesByAuth = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      location,
      vehicle_type,
      vehicle_Transaction_type,
      transmission,
      fuelType,
      brand_name,
      Year_built,
      price_min,
      price_max,
      listing_approval,
      Soldstatus,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = {
      created_by: user_id // Filter by authenticated user
    };

    // Filter by status
    if (status !== undefined) {
      query.status = status === 'true';
    }

    // Filter by location
    if (location) {
      query.location = location;
    }

    // Filter by vehicle type
    if (vehicle_type) {
      query.vehicle_type = vehicle_type;
    }

    // Filter by vehicle transaction type
    if (vehicle_Transaction_type) {
      query.vehicle_Transaction_type = vehicle_Transaction_type;
    }

    // Filter by transmission
    if (transmission) {
      query.transmission = transmission;
    }

    // Filter by fuel type
    if (fuelType) {
      query.fuelType = fuelType;
    }

    // Filter by brand name
    if (brand_name) {
      query.brand_name = { $regex: brand_name, $options: 'i' };
    }

    // Filter by year built
    if (Year_built) {
      query.Year_built = Year_built;
    }

    // Filter by price range
    if (price_min || price_max) {
      query.price_of_Vehicle = {};
      if (price_min) query.price_of_Vehicle.$gte = parseFloat(price_min);
      if (price_max) query.price_of_Vehicle.$lte = parseFloat(price_max);
    }

    // Filter by listing approval
    if (listing_approval) {
      query.listing_approval = listing_approval;
    }

    // Filter by sold status
    if (Soldstatus) {
      query.Soldstatus = Soldstatus;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { Title: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { model_name: { $regex: search, $options: 'i' } },
        { ReferanceNo: { $regex: search, $options: 'i' } },
        { VehicleNo: { $regex: search, $options: 'i' } },
        { OwnerName: { $regex: search, $options: 'i' } },
        { OwnerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort_by]: sort_order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'location', select: 'city', localField: 'location', foreignField: 'city_id' },
        { path: 'vehicle_type', select: 'type_name', localField: 'vehicle_type', foreignField: 'vehicletype_id' },
        { path: 'vehicle_Transaction_type', select: 'type_name', localField: 'vehicle_Transaction_type', foreignField: 'vehicleTransactiontype_id' },
        { path: 'transmission', select: 'transmission_name', localField: 'transmission', foreignField: 'transmission_id' },
        { path: 'fuelType', select: 'fuelType_name', localField: 'fuelType', foreignField: 'fuelType_id' },
        { path: 'setTemplate', select: 'template_name', localField: 'setTemplate', foreignField: 'template_id' },
        { path: 'setMusic', select: 'music_name', localField: 'setMusic', foreignField: 'music_id' },
        { path: 'created_by', select: 'name email', localField: 'created_by', foreignField: 'user_id' },
        { path: 'updated_by', select: 'name email', localField: 'updated_by', foreignField: 'user_id' }
      ]
    };

    const result = await Automobiles.paginate(query, options);

    res.status(200).json({
      success: true,
      message: 'Automobiles retrieved successfully for authenticated user',
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
    console.error('Error getting automobiles by auth:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 

// Dashboard Home API
export const getDashboardHome = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Get total vehicles count for the authenticated user
    const totalVehicles = await Automobiles.countDocuments({ 
      created_by: user_id,
      status: true 
    });

    // Get vehicle type statistics
    const vehicleTypeStats = await Automobiles.aggregate([
      {
        $match: {
          created_by: user_id,
          status: true
        }
      },
      {
        $lookup: {
          from: 'vehicletypes',
          localField: 'vehicle_type',
          foreignField: 'vehicletype_id',
          as: 'vehicleTypeInfo'
        }
      },
      {
        $unwind: '$vehicleTypeInfo'
      },
      {
        $group: {
          _id: '$vehicle_type',
          count: { $sum: 1 },
          type_name: { $first: '$vehicleTypeInfo.type_name' }
        }
      },
      {
        $project: {
          vehicle_type: '$_id',
          count: 1,
          type_name: 1,
          _id: 0
        }
      }
    ]);

    // Create vehicle type counts object
    const vehicleTypeCounts = {
      Sedan: 0,
      SUV: 0,
      Hatchback: 0,
      anyOther: 0
    };

    // Map the aggregated results to our required format
    vehicleTypeStats.forEach(stat => {
      const typeName = stat.type_name?.toLowerCase();
      if (typeName === 'sedan') {
        vehicleTypeCounts.Sedan = stat.count;
      } else if (typeName === 'suv') {
        vehicleTypeCounts.SUV = stat.count;
      } else if (typeName === 'hatchback') {
        vehicleTypeCounts.Hatchback = stat.count;
      } else {
        vehicleTypeCounts.anyOther += stat.count;
      }
    });

    // Get recent vehicles list ordered by DESC (most recent first)
    const recentVehicles = await Automobiles.find({ 
      created_by: user_id,
      status: true 
    })
    .sort({ created_at: -1 })
    .limit(10)
    .populate({ path: 'location', select: 'city', localField: 'location', foreignField: 'city_id' })
    .populate({ path: 'vehicle_type', select: 'type_name', localField: 'vehicle_type', foreignField: 'vehicletype_id' })
    .populate({ path: 'vehicle_Transaction_type', select: 'type_name', localField: 'vehicle_Transaction_type', foreignField: 'vehicleTransactiontype_id' })
    .populate({ path: 'transmission', select: 'transmission_name', localField: 'transmission', foreignField: 'transmission_id' })
    .populate({ path: 'fuelType', select: 'fuelType_name', localField: 'fuelType', foreignField: 'fuelType_id' })
    .select('Title brand_name model_name Year_built price_of_Vehicle ReferanceNo VehicleNo listing_approval Soldstatus created_at');

    // Add days ago field to each vehicle
    const vehiclesWithDaysAgo = recentVehicles.map(vehicle => {
      const vehicleObj = vehicle.toObject();
      const createdDate = new Date(vehicle.created_at);
      const currentDate = new Date();
      const timeDifference = currentDate.getTime() - createdDate.getTime();
      const daysAgo = Math.floor(timeDifference / (1000 * 3600 * 24));
      
      return {
        ...vehicleObj,
        daysAgo: daysAgo
      };
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard home data retrieved successfully',
      data: {
        total_Vehicles: totalVehicles,
        vehicleTypeCounts,
        getVehiclesList: vehiclesWithDaysAgo
      }
    });
  } catch (error) {
    console.error('Error getting dashboard home data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update automobile Sold status
export const updateSoldStatus = async (req, res) => {
  try {
    const { Automobiles_id, Soldstatus } = req.body;
    const user_id = req.user.user_id;

    if (!Automobiles_id) {
      return res.status(400).json({
        success: false,
        message: 'Automobile ID is required'
      });
    }

    if (!Soldstatus) {
      return res.status(400).json({
        success: false,
        message: 'Sold status is required'
      });
    }

    // Validate Soldstatus enum
    const validSoldStatuses = ['Sold', 'UnSold', 'Rented'];
    if (!validSoldStatuses.includes(Soldstatus)) {
      return res.status(400).json({
        success: false,
        message: 'Sold status must be one of: Sold, UnSold, Rented'
      });
    }

    // Find the automobile
    const automobile = await Automobiles.findOne({ Automobiles_id });
    if (!automobile) {
      return res.status(404).json({
        success: false,
        message: 'Automobile not found'
      });
    }

    // Update only the Sold status
    const updatedAutomobile = await Automobiles.findOneAndUpdate(
      { Automobiles_id },
      {
        Soldstatus,
        updated_by: user_id,
        updated_at: new Date()
      },
      { new: true }
    ).populate({ path: 'location', select: 'city', localField: 'location', foreignField: 'city_id' })
     .populate({ path: 'vehicle_type', select: 'type_name', localField: 'vehicle_type', foreignField: 'vehicletype_id' })
     .populate({ path: 'vehicle_Transaction_type', select: 'type_name', localField: 'vehicle_Transaction_type', foreignField: 'vehicleTransactiontype_id' })
     .populate({ path: 'transmission', select: 'transmission_name', localField: 'transmission', foreignField: 'transmission_id' })
     .populate({ path: 'fuelType', select: 'fuelType_name', localField: 'fuelType', foreignField: 'fuelType_id' });

    res.status(200).json({
      success: true,
      message: `Automobile sold status updated to ${Soldstatus} successfully`,
      data: updatedAutomobile
    });
  } catch (error) {
    console.error('Error updating automobile sold status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 