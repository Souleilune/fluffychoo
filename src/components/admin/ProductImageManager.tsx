'use client';

import { useState, useEffect } from 'react';
import { Upload, X, GripVertical, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  display_order: number;
  is_primary: boolean;
}

interface ProductImageManagerProps {
  productId: string;
  onClose: () => void;
}

export default function ProductImageManager({ productId, onClose }: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`);
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          alert(`File ${file.name} is not a supported format. Use PNG, JPG, or WebP.`);
          continue;
        }

        // Upload to storage
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          alert(`Failed to upload ${file.name}: ${uploadResult.error}`);
          continue;
        }

        // Add to product_images table
        const addImageResponse = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: uploadResult.url,
            storage_path: uploadResult.path,
            is_primary: images.length === 0 && i === 0, // First image is primary
          }),
        });

        const addImageResult = await addImageResponse.json();

        if (addImageResult.success) {
          setImages(prev => [...prev, addImageResult.data]);
        }
      }

      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // Update display_order
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));

    setImages(updatedImages);
    setDraggedIndex(null);

    // Save new order to backend
    try {
      await fetch(`/api/admin/products/${productId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: updatedImages.map(img => ({
            id: img.id,
            display_order: img.display_order,
          })),
        }),
      });
    } catch (error) {
      console.error('Failed to save order:', error);
      alert('Failed to save image order');
      fetchImages(); // Reload
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-amber-900">Manage Product Images</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-amber-700" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Area */}
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-300 border-dashed rounded-lg cursor-pointer bg-amber-50 hover:bg-amber-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 mb-3 text-amber-500 animate-spin" />
                    <p className="text-sm text-amber-700">Uploading images...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mb-3 text-amber-500" />
                    <p className="mb-2 text-sm text-amber-700">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-amber-600">PNG, JPG, or WebP (MAX. 10MB each)</p>
                    <p className="text-xs text-amber-600 mt-1">You can select multiple files</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Images Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-700">No images uploaded yet</p>
              <p className="text-sm text-amber-600 mt-2">Upload images using the area above</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-amber-700">
                  <strong>{images.length}</strong> image{images.length !== 1 ? 's' : ''} uploaded
                </p>
                <p className="text-xs text-amber-600">
                  <GripVertical className="w-3 h-3 inline mr-1" />
                  Drag to reorder
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`relative group bg-amber-50 rounded-lg overflow-hidden border-2 border-amber-200 cursor-move hover:shadow-lg transition-all ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Order Badge */}
                    <div className="absolute top-2 left-2 bg-amber-900 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      #{index + 1}
                    </div>

                    {/* Drag Handle */}
                    <div className="absolute top-2 right-2 bg-white/90 p-1 rounded z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-amber-600" />
                    </div>

                    {/* Image */}
                    <div className="relative w-full h-48">
                      <Image
                        src={image.image_url}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute bottom-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Primary Badge */}
                    {image.is_primary && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        PRIMARY
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-200 bg-amber-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-900 font-semibold rounded-xl hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}