'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit, Trash2, X, Save, Package, Upload, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number | null;
  description: string | null;
  image: string | null;
  stock: number;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    stock: '0',
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setSelectedFile(null);
    setImagePreview(null);
    // SAFE: Ensure all string fields are proper strings
    setFormData({
      name: '',
      price: '',
      description: '',
      image: '',
      stock: '0',
      is_active: true,
    });
    setIsModalOpen(true);
  };
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSelectedFile(null);
    setImagePreview(product.image);
    // SAFE: Handle potential null/undefined values from product
    setFormData({
      name: product.name || '', // Ensure string
      price: product.price?.toString() || '', // Safe conversion
      description: product.description || '', // Handle null
      image: product.image || '', // Handle null
      stock: product.stock?.toString() || '0', // Safe conversion
      is_active: product.is_active !== undefined ? product.is_active : true,
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return formData.image || null;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate required fields - with null/undefined checks
  if (!formData.name || typeof formData.name !== 'string' || formData.name.trim() === '') {
    alert('Product name is required');
    return;
  }

  console.log('Form data before processing:', formData);

  try {
    let imageUrl = formData.image;
    if (selectedFile) {
      imageUrl = await uploadImage() || '';
      if (!imageUrl && selectedFile) {
        return; // Upload failed
      }
    }

    // FIXED: Safe payload creation with proper null checks
    const payload = {
      name: formData.name.trim(), // We already validated this above
      price: (formData.price && typeof formData.price === 'string' && formData.price.trim() !== '') 
        ? formData.price.trim() 
        : '',
      description: (formData.description && typeof formData.description === 'string' && formData.description.trim() !== '') 
        ? formData.description.trim() 
        : '',
      image: (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') 
        ? imageUrl.trim() 
        : '',
      stock: formData.stock || '0',
      is_active: formData.is_active,
    };

    console.log('Payload being sent:', payload);

    // Additional validation before sending
    if (!payload.name || payload.name === '') {
      console.error('ERROR: Payload name is empty after processing!');
      alert('Error: Product name became empty during processing');
      return;
    }

    let response;
    if (editingProduct) {
      response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProduct.id, ...payload }),
      });
    } else {
      response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    const result = await response.json();
    console.log('API Response:', result);

    if (response.ok && result.success) {
      await fetchProducts();
      setIsModalOpen(false);
      setSelectedFile(null);
      setImagePreview(null);
    } else {
      alert(`Failed to save product: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Failed to save product:', error);
    alert(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // Reordering functions
  const moveProduct = async (fromIndex: number, toIndex: number) => {
    const reorderedProducts = [...products];
    const [movedProduct] = reorderedProducts.splice(fromIndex, 1);
    reorderedProducts.splice(toIndex, 0, movedProduct);

    // Update local state immediately for better UX
    setProducts(reorderedProducts);

    // Send reorder request to API
    try {
      const productIds = reorderedProducts.map(product => product.id);
      const response = await fetch('/api/admin/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        // Revert on failure
        await fetchProducts();
        alert('Failed to reorder products');
      }
    } catch (error) {
      console.error('Failed to reorder products:', error);
      await fetchProducts();
      alert('Failed to reorder products');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveProduct(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Product Management</h1>
            <p className="text-amber-700 mt-1">Manage your product catalog and arrange display order</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-6 py-2.5 text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Reorder Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsReordering(!isReordering)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isReordering
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-150'
            }`}
          >
            <GripVertical className="w-4 h-4" />
            <span>{isReordering ? 'Exit Reorder Mode' : 'Reorder Products'}</span>
          </button>
          {isReordering && (
            <p className="text-sm text-amber-600">
              Drag and drop products to rearrange their order on the front page
            </p>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                draggable={isReordering}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden hover:shadow-md transition-all ${
                  isReordering ? 'cursor-move hover:shadow-lg' : ''
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                {/* Reorder Handle */}
                {isReordering && (
                  <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        Position {index + 1}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveProduct(index, index - 1)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                      )}
                      {index < products.length - 1 && (
                        <button
                          onClick={() => moveProduct(index, index + 1)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Product Image */}
                <div className="relative h-48 bg-amber-50 flex items-center justify-center">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-amber-300" />
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-amber-900">{product.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-amber-600 mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-amber-900">
                      {product.price !== null && product.price !== undefined ? `$${product.price.toFixed(2)}` : 'Price TBD'}
                    </span>
                    <span className="text-sm text-amber-600">Stock: {product.stock}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 px-4 py-2 text-amber-900 font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
                      style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-200 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-amber-100">
            <Package className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <p className="text-amber-600">No products yet. Create your first product!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-amber-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={1}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter product name (e.g., fluffychoo)"
                />
              </div>

              {/* Price - Now Optional */}
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Price ($) <span className="text-gray-500 text-sm font-normal">(Optional - leave empty for "Price TBD")</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="2.99 (optional)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Describe your product..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Product Image
                </label>
                
                {imagePreview && (
                  <div className="mb-4 relative w-full h-48 bg-amber-50 rounded-lg overflow-hidden border-2 border-amber-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                        setFormData({ ...formData, image: '' });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-300 border-dashed rounded-lg cursor-pointer bg-amber-50 hover:bg-amber-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-amber-500" />
                      <p className="mb-2 text-sm text-amber-700">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-amber-600">PNG, JPG, or WebP (MAX. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-amber-900">Product is active</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 text-amber-700 font-semibold rounded-xl border border-amber-300 hover:bg-amber-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !formData.name.trim()}
                  className={`flex-1 px-6 py-3 font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 ${
                    isUploading || !formData.name.trim()
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'text-amber-900 hover:shadow-lg transform hover:scale-[1.02]'
                  }`}
                  style={!isUploading && formData.name.trim() ? 
                    { background: 'linear-gradient(to right, #fef9c3, #fde68a)' } : 
                    {}
                  }
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700"></div>
                      <span>Uploading...</span>
                    </>
                  ) : !formData.name.trim() ? (
                    <>
                      <span>Product name required</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}