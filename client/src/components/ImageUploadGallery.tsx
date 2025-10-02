import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  X, 
  Eye, 
  Download, 
  Share2, 
  Heart, 
  Camera,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Grid,
  List,
  Search,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';

interface UploadedImage {
  _id: string;
  fileName: string;
  originalName: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  type: string;
  uploadedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  uploadedAt: string;
  metadata: {
    width: number;
    height: number;
    alt?: string;
    description?: string;
    tags: string[];
  };
  likes: number;
  downloads: number;
  isPublic: boolean;
  status: 'pending' | 'approved' | 'rejected';
  templeId?: string;
  templeName?: string;
}

interface ImageUploadProps {
  templeId?: string;
  templeName?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  allowMultiple?: boolean;
  onUploadComplete?: (images: UploadedImage[]) => void;
  showGallery?: boolean;
}

export default function ImageUploadGallery({ 
  templeId, 
  templeName,
  maxFiles = 5, 
  maxSize = 10,
  allowMultiple = true,
  onUploadComplete,
  showGallery = true
}: ImageUploadProps) {
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'my-uploads' | 'liked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);

  // Mock uploaded images
  const mockImages: UploadedImage[] = [
    {
      _id: '1',
      fileName: 'golden-temple-1.jpg',
      originalName: 'Golden Temple Morning.jpg',
      url: '/api/placeholder/800/600',
      thumbnailUrl: '/api/placeholder/300/200',
      size: 2548576,
      type: 'image/jpeg',
      uploadedBy: {
        _id: user?.id || '1',
        name: 'Rajesh Kumar'
      },
      uploadedAt: '2024-09-28T10:30:00Z',
      metadata: {
        width: 1920,
        height: 1280,
        alt: 'Golden Temple during morning hours',
        description: 'Beautiful view of Golden Temple during morning prayers',
        tags: ['golden temple', 'morning', 'prayers', 'sikhi']
      },
      likes: 24,
      downloads: 12,
      isPublic: true,
      status: 'approved',
      templeId: '1',
      templeName: 'Golden Temple'
    },
    {
      _id: '2',
      fileName: 'meenakshi-temple-gopuram.jpg',
      originalName: 'Meenakshi Temple Gopuram.jpg',
      url: '/api/placeholder/800/600',
      thumbnailUrl: '/api/placeholder/300/200',
      size: 3245678,
      type: 'image/jpeg',
      uploadedBy: {
        _id: '2',
        name: 'Priya Sharma'
      },
      uploadedAt: '2024-09-27T15:45:00Z',
      metadata: {
        width: 2048,
        height: 1536,
        alt: 'Intricate carvings on Meenakshi Temple gopuram',
        description: 'Magnificent architectural details of the south gopuram',
        tags: ['meenakshi temple', 'architecture', 'gopuram', 'carvings']
      },
      likes: 18,
      downloads: 8,
      isPublic: true,
      status: 'approved',
      templeId: '2',
      templeName: 'Meenakshi Temple'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error({
          title: 'Invalid file type',
          description: `${file.name} is not an image file.`,
        });
        return false;
      }
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error({
          title: 'File too large',
          description: `${file.name} exceeds ${maxSize}MB limit.`,
        });
        return false;
      }
      
      return true;
    });

    // Check total file count
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      toast.error({
        title: 'Too many files',
        description: `You can only upload up to ${maxFiles} files.`,
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!isAuthenticated) {
      toast.error({
        title: 'Authentication required',
        description: 'Please sign in to upload images.',
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error({
        title: 'No files selected',
        description: 'Please select at least one image to upload.',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadedImageResults: UploadedImage[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Simulate successful upload
        const newImage: UploadedImage = {
          _id: Date.now().toString() + i,
          fileName: `${Date.now()}-${file.name}`,
          originalName: file.name,
          url: URL.createObjectURL(file),
          thumbnailUrl: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          uploadedBy: {
            _id: user?.id || '1',
            name: user?.name || 'User'
          },
          uploadedAt: new Date().toISOString(),
          metadata: {
            width: 1920,
            height: 1280,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            description: '',
            tags: []
          },
          likes: 0,
          downloads: 0,
          isPublic: true,
          status: 'pending',
          templeId,
          templeName
        };
        
        uploadedImageResults.push(newImage);
      }
      
      setUploadedImages(prev => [...uploadedImageResults, ...prev]);
      setSelectedFiles([]);
      setUploadProgress({});
      
      if (onUploadComplete) {
        onUploadComplete(uploadedImageResults);
      }
      
      toast.success({
        title: 'Upload successful!',
        description: `${uploadedImageResults.length} image(s) uploaded successfully.`,
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error({
        title: 'Upload failed',
        description: 'There was an error uploading your images. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageAction = async (action: 'like' | 'download' | 'share', image: UploadedImage) => {
    if (!isAuthenticated && action === 'like') {
      toast.error({
        title: 'Authentication required',
        description: 'Please sign in to like images.',
      });
      return;
    }

    switch (action) {
      case 'like':
        // Toggle like
        setUploadedImages(prev => 
          prev.map(img => 
            img._id === image._id 
              ? { ...img, likes: img.likes + (img.likes > 0 ? -1 : 1) }
              : img
          )
        );
        toast.success({
          title: 'Liked!',
          description: 'You liked this image.',
        });
        break;
        
      case 'download':
        // Simulate download
        const link = document.createElement('a');
        link.href = image.url;
        link.download = image.originalName;
        link.click();
        
        // Update download count
        setUploadedImages(prev => 
          prev.map(img => 
            img._id === image._id 
              ? { ...img, downloads: img.downloads + 1 }
              : img
          )
        );
        
        toast.success({
          title: 'Download started',
          description: 'Image download has started.',
        });
        break;
        
      case 'share':
        // Copy link to clipboard
        navigator.clipboard.writeText(image.url);
        toast.success({
          title: 'Link copied',
          description: 'Image link copied to clipboard.',
        });
        break;
    }
  };

  const filteredImages = [...mockImages, ...uploadedImages].filter(image => {
    if (filter === 'my-uploads' && image.uploadedBy._id !== user?.id) return false;
    if (filter === 'liked' && image.likes === 0) return false;
    if (searchQuery && !image.metadata.alt?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !image.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !image.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Upload Images
          </CardTitle>
          <CardDescription>
            Share beautiful photos of {templeName || 'temples'} with the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={allowMultiple}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <h3 className="text-lg font-semibold text-text mb-2">
              {allowMultiple ? 'Upload Images' : 'Upload Image'}
            </h3>
            <p className="text-text/70 mb-4">
              Click here or drag and drop your images
            </p>
            <div className="text-sm text-text/60">
              <p>Supported formats: JPG, PNG, WebP</p>
              <p>Maximum size: {maxSize}MB per file</p>
              {allowMultiple && <p>Maximum files: {maxFiles}</p>}
            </div>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Selected Files ({selectedFiles.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-text/60">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {uploadProgress[file.name] !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress[file.name]}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={uploadFiles}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {showGallery && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Image Gallery
                </CardTitle>
                <CardDescription>
                  Browse and interact with community uploads
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/60 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-primary/20 rounded-lg text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-primary/20 rounded-lg text-sm focus:border-primary focus:outline-none"
                >
                  <option value="all">All Images</option>
                  <option value="my-uploads">My Uploads</option>
                  <option value="liked">Liked</option>
                </select>
                
                {/* View Mode */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text mb-2">No images found</h3>
                <p className="text-text/70">Be the first to upload an image!</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredImages.map((image) => (
                  <Card 
                    key={image._id} 
                    className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      viewMode === 'list' ? 'flex flex-row' : ''
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className={`${viewMode === 'list' ? 'w-48' : 'w-full'} relative overflow-hidden`}>
                      <img
                        src={image.thumbnailUrl}
                        alt={image.metadata.alt}
                        className={`${
                          viewMode === 'list' ? 'h-32' : 'h-48'
                        } w-full object-cover group-hover:scale-110 transition-transform duration-700`}
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        {image.status === 'pending' && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                        {image.status === 'approved' && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </span>
                        )}
                      </div>

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageAction('like', image);
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageAction('download', image);
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageAction('share', image);
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(image);
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className={`${viewMode === 'list' ? 'flex-1' : 'w-full'} p-4`}>
                      <h4 className="font-semibold text-text group-hover:text-primary transition-colors duration-300 mb-2">
                        {image.metadata.alt || image.originalName}
                      </h4>
                      
                      {image.metadata.description && (
                        <p className="text-sm text-text/70 mb-3 line-clamp-2">
                          {image.metadata.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-text/60 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{image.uploadedBy.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-text/60">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{image.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            <span>{image.downloads}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {image.metadata.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {image.metadata.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{image.metadata.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedImage.metadata.alt || selectedImage.originalName}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="max-h-[70vh] overflow-auto">
              <img
                src={selectedImage.url}
                alt={selectedImage.metadata.alt}
                className="w-full h-auto object-contain"
              />
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedImage.uploadedBy.name}</p>
                    <p className="text-sm text-text/60">{new Date(selectedImage.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImageAction('like', selectedImage)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {selectedImage.likes}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImageAction('download', selectedImage)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImageAction('share', selectedImage)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              {selectedImage.metadata.description && (
                <p className="text-text/80 mb-4">{selectedImage.metadata.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-text/60">
                <div>
                  <span>{selectedImage.metadata.width} × {selectedImage.metadata.height} • {formatFileSize(selectedImage.size)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedImage.metadata.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}