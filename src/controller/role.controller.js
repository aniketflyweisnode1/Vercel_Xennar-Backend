import Role from '../models/role.model.js';

// Create role
const createRole = async (req, res) => {
  try {
    const { role_name } = req.body;
    const created_by = req.user?.user_id;

    if (!role_name) {
      return res.status(400).json({
        success: false,
        message: "Role name is required"
      });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ role_name: role_name.trim() });
    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "Role with this name already exists"
      });
    }

    const role = await Role.create({
      role_name: role_name.trim(),
      created_by
    });

    return res.status(201).json({
      success: true,
      data: role,
      message: "Role created successfully"
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {

    const { role_id, role_name, status } = req.body;
    const updated_by = req.user?.user_id;

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required"
      });
    }

    const role = await Role.findOne({ role_id: parseInt(role_id) });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    // Check if role name is being updated and if it already exists
    if (role_name && role_name !== role.role_name) {
      const existingRole = await Role.findOne({
        role_name: role_name.trim(),
        role_id: { $ne: parseInt(role_id) }
      });
      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: "Role with this name already exists"
        });
      }
    }

    const updateData = {
      updated_by,
      updated_at: new Date()
    };

    if (role_name) updateData.role_name = role_name.trim();
    if (status !== undefined) updateData.status = status;

    const updatedRole = await Role.findOneAndUpdate(
      { role_id: parseInt(role_id) },
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedRole,
      message: "Role updated successfully"
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const { role_id } = req.params;

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required"
      });
    }

    const role = await Role.findOne({ role_id: parseInt(role_id) });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
      message: "Role retrieved successfully"
    });
  } catch (error) {
    console.error('Error getting role:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting role',
      error: error.message
    });
  }
};

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};

    if (status !== undefined) {
      query.status = status === 'true';
    }

    if (search) {
      query.role_name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const roles = await Role.paginate(query, options);

    return res.status(200).json({
      success: true,
      data: roles.docs,
      pagination: {
        totalDocs: roles.totalDocs,
        limit: roles.limit,
        totalPages: roles.totalPages,
        page: roles.page,
        pagingCounter: roles.pagingCounter,
        hasPrevPage: roles.hasPrevPage,
        hasNextPage: roles.hasNextPage,
        prevPage: roles.prevPage,
        nextPage: roles.nextPage
      },
      message: "Roles retrieved successfully"
    });
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting roles',
      error: error.message
    });
  }
};

export {
  createRole,
  updateRole,
  getRoleById,
  getAllRoles
}; 