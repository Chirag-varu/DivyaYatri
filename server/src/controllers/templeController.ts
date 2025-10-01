import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Temple from '../models/Temple';
import Review from '../models/Review';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Get all temples with filtering and pagination
 * GET /api/temples
 */
export const getTemples = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      state,
      city,
      deity,
      tags,
      sortBy = 'popularity',
      sortOrder = 'desc',
      verified,
      lat,
      lng,
      radius = 50
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Location filters
    if (state) query.state = new RegExp(state as string, 'i');
    if (city) query.city = new RegExp(city as string, 'i');
    if (deity) query.deity = new RegExp(deity as string, 'i');
    if (verified !== undefined) query.verified = verified === 'true';

    // Tags filter
    if (tags) {
      const tagArray = (tags as string).split(',');
      query.tags = { $in: tagArray };
    }

    // Geolocation filter
    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = parseFloat(radius as string);

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusKm * 1000 // Convert to meters
        }
      };
    }

    // Sort options
    const sortOptions: any = {};
    if (sortBy === 'rating') {
      sortOptions.averageRating = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'reviews') {
      sortOptions.totalReviews = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sortOptions.name = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.popularity = -1; // Default to popularity desc
    }

    // Execute query
    const temples = await Temple.find(query)
      .select('-fullHistory') // Exclude full history for list view
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'firstName lastName')
      .lean();

    // Get total count for pagination
    const total = await Temple.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        temples,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get temples error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching temples'
    });
  }
};

/**
 * Get single temple by ID or slug
 * GET /api/temples/:idOrSlug
 */
export const getTemple = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    // Try to find by ID first, then by slug
    let temple = await Temple.findById(idOrSlug)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!temple) {
      temple = await Temple.findOne({ seoSlug: idOrSlug })
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');
    }

    if (!temple || !temple.isActive) {
      res.status(404).json({
        success: false,
        error: 'Temple not found'
      });
      return;
    }

    // Get recent reviews
    const reviews = await Review.find({ 
      temple: temple._id, 
      isApproved: true 
    })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        temple,
        reviews
      }
    });
  } catch (error) {
    console.error('Get temple error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching temple'
    });
  }
};

/**
 * Create a new temple
 * POST /api/temples
 */
export const createTemple = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const templeData = {
      ...req.body,
      createdBy: req.user._id,
      verified: req.user.role === 'admin', // Auto-verify if admin
      isActive: true
    };

    const temple = await Temple.create(templeData);

    res.status(201).json({
      success: true,
      message: 'Temple created successfully',
      data: {
        temple
      }
    });
  } catch (error) {
    console.error('Create temple error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating temple'
    });
  }
};

/**
 * Update temple
 * PUT /api/temples/:id
 */
export const updateTemple = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const temple = await Temple.findById(id);
    if (!temple) {
      res.status(404).json({
        success: false,
        error: 'Temple not found'
      });
      return;
    }

    // Check permissions
    const isOwner = temple.createdBy.toString() === req.user._id.toString();
    const isManager = temple.managerClaim?.ownerId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isManager && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this temple'
      });
      return;
    }

    const updatedTemple = await Temple.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedBy: req.user._id,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Temple updated successfully',
      data: {
        temple: updatedTemple
      }
    });
  } catch (error) {
    console.error('Update temple error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating temple'
    });
  }
};

/**
 * Delete temple
 * DELETE /api/temples/:id
 */
export const deleteTemple = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const temple = await Temple.findById(id);
    if (!temple) {
      res.status(404).json({
        success: false,
        error: 'Temple not found'
      });
      return;
    }

    // Check permissions - only admin or owner can delete
    const isOwner = temple.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete this temple'
      });
      return;
    }

    // Soft delete by setting isActive to false
    await Temple.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Temple deleted successfully'
    });
  } catch (error) {
    console.error('Delete temple error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting temple'
    });
  }
};

/**
 * Claim temple ownership
 * POST /api/temples/:id/claim
 */
export const claimTemple = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { verificationDocuments } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const temple = await Temple.findById(id);
    if (!temple) {
      res.status(404).json({
        success: false,
        error: 'Temple not found'
      });
      return;
    }

    // Check if temple is already claimed
    if (temple.managerClaim && temple.managerClaim.status === 'approved') {
      res.status(400).json({
        success: false,
        error: 'Temple is already claimed by another user'
      });
      return;
    }

    // Create or update claim
    const claimData = {
      ownerId: req.user._id,
      verifiedAt: new Date(),
      verificationDocuments: verificationDocuments || [],
      status: 'pending' as const
    };

    await Temple.findByIdAndUpdate(id, {
      managerClaim: claimData
    });

    res.status(200).json({
      success: true,
      message: 'Temple claim submitted successfully. Admin will review your request.'
    });
  } catch (error) {
    console.error('Claim temple error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while claiming temple'
    });
  }
};

/**
 * Get nearby temples
 * GET /api/temples/nearby
 */
export const getNearbyTemples = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = 10, limit = 10 } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);
    const limitNum = parseInt(limit as string);

    const temples = await Temple.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusKm * 1000
        }
      }
    })
      .select('name city state deity images averageRating totalReviews lat lng')
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        temples
      }
    });
  } catch (error) {
    console.error('Get nearby temples error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching nearby temples'
    });
  }
};