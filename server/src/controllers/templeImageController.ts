import { Request, Response } from 'express';
import TempleImage from '../models/TempleImage';
import Temple from '../models/Temple';

// Get temple images
export const getTempleImages = async (req: Request, res: Response) => {
  try {
    const { templeId } = req.params;
    const { category, featured, page = 1, limit = 20 } = req.query;

    const query: any = { 
      temple: templeId,
      status: 'approved',
      isPublic: true
    };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const images = await TempleImage.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await TempleImage.countDocuments(query);

    res.json({
      success: true,
      data: {
        images,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching temple images',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Upload temple image
export const uploadTempleImage = async (req: Request, res: Response) => {
  try {
    const { templeId } = req.params;
    const {
      url,
      thumbnailUrl,
      originalName,
      mimeType,
      size,
      dimensions,
      category,
      description,
      tags
    } = req.body;

    // Verify temple exists
    const temple = await Temple.findById(templeId);
    if (!temple) {
      return res.status(404).json({
        success: false,
        message: 'Temple not found'
      });
    }

    const image = new TempleImage({
      temple: templeId,
      uploadedBy: req.user?._id,
      url,
      thumbnailUrl,
      originalName,
      mimeType,
      size,
      dimensions,
      category: category || 'other',
      description,
      tags: tags || [],
      status: 'pending' // Requires moderation
    });

    await image.save();

    await image.populate('uploadedBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully and is pending approval',
      data: { image }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Like/unlike image
export const toggleImageLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const image = await TempleImage.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    await image.toggleLike(userId);

    res.json({
      success: true,
      message: 'Image like toggled successfully',
      data: { 
        image,
        isLiked: image.isLikedBy(userId),
        likeCount: image.likeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling image like',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Report image
export const reportImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?._id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required'
      });
    }

    const image = await TempleImage.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    await image.reportImage(userId, reason);

    res.json({
      success: true,
      message: 'Image reported successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'You have already reported this image') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error reporting image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get featured images
export const getFeaturedImages = async (req: Request, res: Response) => {
  try {
    const { templeId } = req.params;
    const { limit = 10 } = req.query;

    const images = await TempleImage.getFeaturedImages(
      templeId ? templeId : undefined,
      Number(limit)
    );

    res.json({
      success: true,
      data: { images }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured images',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get popular images
export const getPopularImages = async (req: Request, res: Response) => {
  try {
    const { templeId } = req.params;
    const { limit = 10 } = req.query;

    const images = await TempleImage.getPopularImages(
      templeId ? templeId : undefined,
      Number(limit)
    );

    res.json({
      success: true,
      data: { images }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular images',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Download image (increment counter)
export const downloadImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await TempleImage.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    await image.incrementDownloads();

    res.json({
      success: true,
      message: 'Download count updated',
      data: { downloadUrl: image.url }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing download',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};