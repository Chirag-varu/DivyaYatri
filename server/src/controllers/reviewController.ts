import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Review from '../models/Review';
import Temple from '../models/Temple';
import { AuthenticatedRequest } from '../middleware/auth';
import mongoose from 'mongoose';

/**
 * Get reviews for a temple
 * GET /api/reviews/temple/:templeId
 */
export const getTempleReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templeId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find({
      temple: templeId,
      isApproved: true
    })
      .populate('user', 'firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({
      temple: templeId,
      isApproved: true
    });

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { temple: templeId, isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        ratingStats,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get temple reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching reviews'
    });
  }
};

/**
 * Create a new review
 * POST /api/reviews
 */
export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { temple, rating, title, comment, images, visitDate } = req.body;

    // Check if temple exists
    const templeDoc = await Temple.findById(temple);
    if (!templeDoc) {
      res.status(404).json({
        success: false,
        error: 'Temple not found'
      });
      return;
    }

    // Check if user already reviewed this temple
    const existingReview = await Review.findOne({
      user: req.user._id,
      temple: temple
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        error: 'You have already reviewed this temple'
      });
      return;
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      temple,
      rating,
      title,
      comment,
      images: images || [],
      visitDate: visitDate ? new Date(visitDate) : undefined,
      isVerified: false,
      isApproved: true // Auto-approve, but can be moderated later
    });

    // Update temple rating statistics
    await updateTempleRating(temple);

    // Populate user data for response
    await review.populate('user', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating review'
    });
  }
};

/**
 * Update a review
 * PUT /api/reviews/:id
 */
export const updateReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        error: 'Review not found'
      });
      return;
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this review'
      });
      return;
    }

    const { rating, title, comment, images, visitDate } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        rating,
        title,
        comment,
        images,
        visitDate: visitDate ? new Date(visitDate) : review.visitDate
      },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName avatar');

    // Update temple rating if rating changed
    if (rating !== review.rating) {
      await updateTempleRating(review.temple.toString());
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: updatedReview
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating review'
    });
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        error: 'Review not found'
      });
      return;
    }

    // Check permissions
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
      return;
    }

    const templeId = review.temple;
    await Review.findByIdAndDelete(id);

    // Update temple rating statistics
    await updateTempleRating(templeId.toString());

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting review'
    });
  }
};

/**
 * Report a review
 * POST /api/reviews/:id/report
 */
export const reportReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Note: reason could be used for logging or admin notifications in the future
    // const { reason } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        error: 'Review not found'
      });
      return;
    }
    // Check if user already reported this review
    if (review.reportedBy.includes(new mongoose.Types.ObjectId(req.user._id))) {
      res.status(400).json({
        success: false,
        error: 'You have already reported this review'
      });
      return;
    }

    // Add user to reported list
    review.reportedBy.push(new mongoose.Types.ObjectId(req.user._id));
    await review.save();
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully. Our team will review it.'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while reporting review'
    });
  }
};

/**
 * Helper function to update temple rating statistics
 */
async function updateTempleRating(templeId: string): Promise<void> {
  try {
    const stats = await Review.aggregate([
      { $match: { temple: templeId, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const { averageRating = 0, totalReviews = 0 } = stats[0] || {};

    await Temple.findByIdAndUpdate(templeId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews
    });
  } catch (error) {
    console.error('Error updating temple rating:', error);
  }
}