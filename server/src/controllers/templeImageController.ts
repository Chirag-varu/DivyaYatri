import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TempleImage, { ITempleImage } from '../models/TempleImage';
import Temple from '../models/Temple';

type ReqWithUser = Request & { user?: { _id?: string | mongoose.Types.ObjectId } };

const toObjectId = (v: any): mongoose.Types.ObjectId | undefined => {
  try {
    return v ? new mongoose.Types.ObjectId(v) : undefined;
  } catch {
    return undefined;
  }
};

export const getTempleImages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { templeId } = req.params;
    const { category } = req.query as Record<string, string>;
    const featured = String(req.query.featured ?? 'false');
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const query: any = { temple: templeId, status: 'approved', isPublic: true };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const images = await TempleImage.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await TempleImage.countDocuments(query);
    return res.json({ success: true, data: { images, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching temple images', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const uploadTempleImage = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { templeId } = req.params;
    const { url, thumbnailUrl, originalName, mimeType, size, dimensions, category, description, tags } = req.body as any;

    const temple = await Temple.findById(templeId);
    if (!temple) return res.status(404).json({ success: false, message: 'Temple not found' });

    const uploadedBy = toObjectId(req.user?._id);
    const imageData: Partial<ITempleImage> = {
      temple: toObjectId(templeId) as any,
      uploadedBy: uploadedBy as any,
      url,
      thumbnailUrl,
      originalName,
      mimeType,
      size,
      dimensions,
      category: category || 'other',
      description,
      tags: Array.isArray(tags) ? tags : (tags ? [String(tags)] : []),
      status: 'pending'
    } as Partial<ITempleImage>;

    const image = new TempleImage(imageData as any);
    await image.save();
    await image.populate('uploadedBy', 'name avatar');
    return res.status(201).json({ success: true, message: 'Image uploaded successfully and is pending approval', data: { image } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error uploading image', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const toggleImageLike = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userOid = toObjectId(req.user?._id);
    if (!userOid) return res.status(401).json({ success: false, message: 'Authentication required' });

    const image = await TempleImage.findById(id) as ITempleImage | null;
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    if (typeof image.toggleLike === 'function') await image.toggleLike(userOid);
    const isLiked = typeof image.isLikedBy === 'function' ? image.isLikedBy(userOid) : false;
    const likeCount = (image as any).likeCount ?? image.socialInteractions?.likes?.length ?? 0;
    return res.json({ success: true, message: 'Image like toggled successfully', data: { image, isLiked, likeCount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error toggling image like', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const reportImage = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };
    const userOid = toObjectId(req.user?._id);
    if (!userOid) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!reason) return res.status(400).json({ success: false, message: 'Report reason is required' });

    const image = await TempleImage.findById(id) as ITempleImage | null;
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    if (typeof image.reportImage === 'function') {
      try {
        await image.reportImage(userOid, reason);
      } catch (err) {
        if (err instanceof Error && err.message === 'You have already reported this image') return res.status(400).json({ success: false, message: err.message });
        throw err;
      }
    }
    return res.json({ success: true, message: 'Image reported successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error reporting image', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getFeaturedImages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { templeId } = req.params;
    const limit = Number((req.query.limit as string) ?? '10');
    const images = await (TempleImage as any).getFeaturedImages(templeId ? templeId : undefined, limit);
    return res.json({ success: true, data: { images } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching featured images', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getPopularImages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { templeId } = req.params;
    const limit = Number((req.query.limit as string) ?? '10');
    const images = await (TempleImage as any).getPopularImages(templeId ? templeId : undefined, limit);
    return res.json({ success: true, data: { images } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching popular images', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const downloadImage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const image = await TempleImage.findById(id) as ITempleImage | null;
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    if (typeof image.incrementDownloads === 'function') await image.incrementDownloads();
    return res.json({ success: true, message: 'Download count updated', data: { downloadUrl: image.url } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error processing download', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
