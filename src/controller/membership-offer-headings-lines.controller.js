import MembershipOfferHeadingsLines from '../models/membership-offer-headings-lines.model.js';

// Create membership offer heading line
const createMembershipOfferHeadingLine = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { package_id, heading_id, line_text, line_emozi, status } = req.body;

    if (!package_id) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required'
      });
    }

    if (!heading_id) {
      return res.status(400).json({
        success: false,
        message: 'Heading ID is required'
      });
    }

    if (!line_text) {
      return res.status(400).json({
        success: false,
        message: 'Line text is required'
      });
    }

    const lineData = {
      package_id: parseInt(package_id),
      heading_id: parseInt(heading_id),
      line_text,
      line_emozi,
      status: status !== undefined ? status : true,
      created_by: userId
    };

    const membershipOfferHeadingLine = new MembershipOfferHeadingsLines(lineData);
    const savedLine = await membershipOfferHeadingLine.save();

    res.status(201).json({
      success: true,
      message: 'Membership offer heading line created successfully',
      data: savedLine
    });
  } catch (error) {
    console.error('Create membership offer heading line error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating membership offer heading line',
      error: error.message
    });
  }
};

// Update membership offer heading line
const updateMembershipOfferHeadingLine = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { lines_id, package_id, heading_id, line_text, line_emozi, status } = req.body;
    const id = lines_id;
    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (package_id !== undefined) {
      updateData.package_id = parseInt(package_id);
    }

    if (heading_id !== undefined) {
      updateData.heading_id = parseInt(heading_id);
    }

    if (line_text !== undefined) {
      updateData.line_text = line_text;
    }

    if (line_emozi !== undefined) {
      updateData.line_emozi = line_emozi;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedLine = await MembershipOfferHeadingsLines.findOneAndUpdate(
      { lines_id: parseInt(id) },
      updateData,
      { new: true }
    );

    if (!updatedLine) {
      return res.status(404).json({
        success: false,
        message: 'Membership offer heading line not found'
      });
    }

    res.json({
      success: true,
      message: 'Membership offer heading line updated successfully',
      data: updatedLine
    });
  } catch (error) {
    console.error('Update membership offer heading line error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating membership offer heading line',
      error: error.message
    });
  }
};

// Get membership offer heading line by ID
const getMembershipOfferHeadingLineById = async (req, res) => {
  try {
    const { id } = req.params;

    const membershipOfferHeadingLine = await MembershipOfferHeadingsLines.findOne({ lines_id: parseInt(id) });

    if (!membershipOfferHeadingLine) {
      return res.status(404).json({
        success: false,
        message: 'Membership offer heading line not found'
      });
    }

    res.json({
      success: true,
      data: membershipOfferHeadingLine
    });
  } catch (error) {
    console.error('Error getting membership offer heading line by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting membership offer heading line by ID',
      error: error.message
    });
  }
};

// Get all membership offer heading lines
const getAllMembershipOfferHeadingLines = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, package_id, heading_id, search } = req.query;

    const query = {};

    if (status !== undefined) {
      query.status = status === 'true';
    }

    if (package_id) {
      query.package_id = parseInt(package_id);
    }

    if (heading_id) {
      query.heading_id = parseInt(heading_id);
    }

    if (search) {
      query.line_text = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const lines = await MembershipOfferHeadingsLines.paginate(query, options);

    res.json({
      success: true,
      message: `Found ${lines.docs.length} membership offer heading lines`,
      data: lines.docs,
      count: lines.totalDocs,
      pagination: {
        totalDocs: lines.totalDocs,
        limit: lines.limit,
        totalPages: lines.totalPages,
        page: lines.page,
        pagingCounter: lines.pagingCounter,
        hasPrevPage: lines.hasPrevPage,
        hasNextPage: lines.hasNextPage,
        prevPage: lines.prevPage,
        nextPage: lines.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting all membership offer heading lines:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all membership offer heading lines',
      error: error.message
    });
  }
};

export {
  createMembershipOfferHeadingLine,
  updateMembershipOfferHeadingLine,
  getMembershipOfferHeadingLineById,
  getAllMembershipOfferHeadingLines
}; 