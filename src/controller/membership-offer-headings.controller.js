import MembershipOfferHeadings from '../models/membership-offer-headings.model.js';

// Create membership offer heading
const createMembershipOfferHeading = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { package_id, heading_text, heading_emozi, sub_heading_text, sub_heading_emozi, status } = req.body;

    if (!package_id) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required'
      });
    }

    if (!heading_text) {
      return res.status(400).json({
        success: false,
        message: 'Heading text is required'
      });
    }

    const headingData = {
      package_id: parseInt(package_id),
      heading_text,
      heading_emozi,
      sub_heading_text,
      sub_heading_emozi,
      status: status !== undefined ? status : true,
      created_by: userId
    };

    const membershipOfferHeading = new MembershipOfferHeadings(headingData);
    const savedHeading = await membershipOfferHeading.save();

    res.status(201).json({
      success: true,
      message: 'Membership offer heading created successfully',
      data: savedHeading
    });
  } catch (error) {
    console.error('Create membership offer heading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating membership offer heading',
      error: error.message
    });
  }
};

// Update membership offer heading
const updateMembershipOfferHeading = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { paramId, package_id, heading_text, heading_emozi, sub_heading_text, sub_heading_emozi, status } = req.body;

    // Use ID from body if provided, otherwise use from params
    const id = paramId;

    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (package_id !== undefined) {
      updateData.package_id = parseInt(package_id);
    }

    if (heading_text !== undefined) {
      updateData.heading_text = heading_text;
    }

    if (heading_emozi !== undefined) {
      updateData.heading_emozi = heading_emozi;
    }

    if (sub_heading_text !== undefined) {
      updateData.sub_heading_text = sub_heading_text;
    }

    if (sub_heading_emozi !== undefined) {
      updateData.sub_heading_emozi = sub_heading_emozi;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedHeading = await MembershipOfferHeadings.findOneAndUpdate(
      { heading_id: parseInt(id) },
      updateData,
      { new: true }
    );

    if (!updatedHeading) {
      return res.status(404).json({
        success: false,
        message: 'Membership offer heading not found'
      });
    }

    res.json({
      success: true,
      message: 'Membership offer heading updated successfully',
      data: updatedHeading
    });
  } catch (error) {
    console.error('Update membership offer heading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating membership offer heading',
      error: error.message
    });
  }
};

// Get membership offer heading by ID
const getMembershipOfferHeadingById = async (req, res) => {
  try {
    const { id } = req.params;

    const membershipOfferHeading = await MembershipOfferHeadings.findOne({ heading_id: parseInt(id) });

    if (!membershipOfferHeading) {
      return res.status(404).json({
        success: false,
        message: 'Membership offer heading not found'
      });
    }

    res.json({
      success: true,
      data: membershipOfferHeading
    });
  } catch (error) {
    console.error('Error getting membership offer heading by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting membership offer heading by ID',
      error: error.message
    });
  }
};

// Get all membership offer headings
const getAllMembershipOfferHeadings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, package_id, search } = req.query;

    const query = {};

    if (status !== undefined) {
      query.status = status === 'true';
    }

    if (package_id) {
      query.package_id = parseInt(package_id);
    }

    if (search) {
      query.$or = [
        { heading_text: { $regex: search, $options: 'i' } },
        { sub_heading_text: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const headings = await MembershipOfferHeadings.paginate(query, options);

    res.json({
      success: true,
      message: `Found ${headings.docs.length} membership offer headings`,
      data: headings.docs,
      count: headings.totalDocs,
      pagination: {
        totalDocs: headings.totalDocs,
        limit: headings.limit,
        totalPages: headings.totalPages,
        page: headings.page,
        pagingCounter: headings.pagingCounter,
        hasPrevPage: headings.hasPrevPage,
        hasNextPage: headings.hasNextPage,
        prevPage: headings.prevPage,
        nextPage: headings.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting all membership offer headings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all membership offer headings',
      error: error.message
    });
  }
};

export {
  createMembershipOfferHeading,
  updateMembershipOfferHeading,
  getMembershipOfferHeadingById,
  getAllMembershipOfferHeadings
}; 