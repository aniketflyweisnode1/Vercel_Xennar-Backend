import Music from '../models/music.model.js';

// Create music
const createMusic = async (req, res) => {
  try {
    const { music_name, status } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!music_name) {
      return res.status(400).json({
        success: false,
        message: 'Music name is required'
      });
    }

    // Check if music already exists
    const existingMusic = await Music.findOne({ music_name });
    if (existingMusic) {
      return res.status(400).json({
        success: false,
        message: 'Music already exists'
      });
    }

    const musicData = new Music({
      music_name,
      status: status !== undefined ? status : true,
      created_by: userId
    });

    const savedMusic = await musicData.save();

    // Populate the saved music with references
    const populatedMusic = await Music.findOne({ music_id: savedMusic.music_id })
      
      ;

    res.status(201).json({
      success: true,
      message: 'Music created successfully',
      data: populatedMusic
    });
  } catch (error) {
    console.error('Create music error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating music',
      error: error.message
    });
  }
};

// Get music by ID
const getMusicById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const music = await Music.findOne({ music_id: id })
      
      ;
    
    if (!music) {
      return res.status(404).json({
        success: false,
        message: 'Music not found'
      });
    }

    res.json({
      success: true,
      data: music
    });
  } catch (error) {
    console.error('Error getting music:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting music',
      error: error.message
    });
  }
};

// Get all music
const getAllMusic = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status !== undefined) {
      query.status = status === 'true';
    }
    
    // Search functionality
    if (search) {
      query.music_name = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const musicList = await Music.paginate(query, options);

    res.json({
      success: true,
      data: musicList.docs,
      pagination: {
        totalDocs: musicList.totalDocs,
        limit: musicList.limit,
        totalPages: musicList.totalPages,
        page: musicList.page,
        pagingCounter: musicList.pagingCounter,
        hasPrevPage: musicList.hasPrevPage,
        hasNextPage: musicList.hasNextPage,
        prevPage: musicList.prevPage,
        nextPage: musicList.nextPage
      }
    });
  } catch (error) {
    console.error('Error getting music:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting music',
      error: error.message
    });
  }
};

// Update music
const updateMusic = async (req, res) => {
  try {
    const { id, music_name, status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required in body' });
    }

    const updateData = {
      updated_by: userId,
      updated_at: new Date()
    };

    if (music_name !== undefined) {
      updateData.music_name = music_name;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedMusic = await Music.findOneAndUpdate(
      { music_id: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMusic) {
      return res.status(404).json({
        success: false,
        message: 'Music not found'
      });
    }

    res.json({
      success: true,
      message: 'Music updated successfully',
      data: updatedMusic
    });
  } catch (error) {
    console.error('Error updating music:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating music',
      error: error.message
    });
  }
};

export {
  createMusic,
  getMusicById,
  getAllMusic,
  updateMusic
}; 