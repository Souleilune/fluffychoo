'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductImageManager from '@/components/admin/ProductImageManager';
import { Plus, Edit, Trash2, X, Save, Package, Upload, GripVertical, ArrowUp, ArrowDown, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number | null;
  discount_price?: number | null;
  description: string | null;
  image: string | null;
  stock: number;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
  category_id?: string | null; 
  product_categories?: {         
    id: string;                
    name: string;          
    color: string     
  } | null;                
}

interface ProductSize {
  id: string;
  product_id: string;
  size_name: string;
  price: number;
  discount_price?: number | null;
  stock: number; 
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
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
  discount_price: '',
  stock: '0',  // ✅ ADD THIS LINE
  description: '',
  image: '',
  is_active: true,
  category_id: '',
});
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [currentProductForSizes, setCurrentProductForSizes] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const [editingSize, setEditingSize] = useState<ProductSize | null>(null);
  const [sizeFormData, setSizeFormData] = useState({
    size_name: '',
    price: '',
    discount_price: '',
    stock: '0',
    is_active: true,
  });
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [currentProductForImages, setCurrentProductForImages] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const fetchCategories = async () => {
  try {
    const response = await fetch('/api/admin/categories');
    const data = await response.json();
    if (data.success) {
      setCategories(data.data.filter((cat: Category) => cat.is_active));
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

  const openCreateModal = () => {
  setEditingProduct(null);
  setSelectedFile(null);
  setImagePreview(null);
  setFormData({
    name: '',
    price: '',
    discount_price: '',
    stock: '0',  // ✅ ADD THIS LINE
    description: '',
    image: '',
    is_active: true,
    category_id: '',
  });
  setIsModalOpen(true);
};

  const openEditModal = (product: Product) => {
  setEditingProduct(product);
  setSelectedFile(null);
  setImagePreview(product.image);
  setFormData({
    name: product.name || '',
    price: product.price?.toString() || '',
    discount_price: product.discount_price?.toString() || '',
    stock: product.stock?.toString() || '0',  // ✅ ADD THIS LINE
    description: product.description || '',
    image: product.image || '',
    is_active: product.is_active !== undefined ? product.is_active : true,
    category_id: product.category_id || '',
  });
  setIsModalOpen(true);
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return; 
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    try {
      let imageUrl = formData.image;

      if (selectedFile) {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResponse.ok && uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          alert(`Image upload failed: ${uploadResult.error || 'Unknown error'}`);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const payload = {
        name: formData.name.trim(),
        price: (formData.price && formData.price.trim() !== '') 
          ? formData.price.trim() 
          : '',
        discount_price: (formData.discount_price && formData.discount_price.trim() !== '') 
          ? formData.discount_price.trim() 
          : '',
        stock: formData.stock ? parseInt(formData.stock, 10) : 0,  // ✅ ADD THIS LINE
        description: (formData.description && formData.description.trim() !== '') 
          ? formData.description.trim() 
          : '',
        image: (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') 
          ? imageUrl.trim() 
          : '',
        is_active: formData.is_active,
        category_id: (formData.category_id && formData.category_id.trim() !== '') ? formData.category_id.trim() : null,  // ← ADD THIS
      };

      if (!payload.name || payload.name === '') {
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

  const moveProduct = async (fromIndex: number, toIndex: number) => {
    const reorderedProducts = [...products];
    const [movedProduct] = reorderedProducts.splice(fromIndex, 1);
    reorderedProducts.splice(toIndex, 0, movedProduct);

    setProducts(reorderedProducts);

    try {
      const productIds = reorderedProducts.map(product => product.id);
      const response = await fetch('/api/admin/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
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

  const openSizeModal = async (product: Product) => {
  setCurrentProductForSizes(product);
  setIsSizeModalOpen(true);
  await fetchSizes(product.id);
};

const fetchSizes = async (productId: string) => {
  setIsLoadingSizes(true);
  try {
    const response = await fetch(`/api/admin/products/sizes?product_id=${productId}`);
    const data = await response.json();
    if (data.success) {
      setSizes(data.data || []);
    }
  } catch (error) {
    console.error('Failed to fetch sizes:', error);
  } finally {
    setIsLoadingSizes(false);
  }
};

const openCreateSizeForm = () => {
  setEditingSize(null);
  setSizeFormData({
    size_name: '',
    price: '',
    discount_price: '',
    is_active: true,
    stock: '0',  // ✅ ADD THIS LINE
  });
};

const openEditSizeForm = (size: ProductSize) => {
  setEditingSize(size);
  setSizeFormData({
    size_name: size.size_name,
    price: size.price.toString(),
    discount_price: size.discount_price?.toString() || '',
    stock: size.stock?.toString() || '0',  // ✅ ADD THIS LINE
    is_active: size.is_active,
  });
};

const handleSaveSize = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentProductForSizes) return;

  try {
    const payload = {
      product_id: currentProductForSizes.id,
      size_name: sizeFormData.size_name.trim(),
      price: parseFloat(sizeFormData.price),
      discount_price: sizeFormData.discount_price ? parseFloat(sizeFormData.discount_price) : null,
      stock: parseInt(sizeFormData.stock, 10) || 0,  // ✅ ADD THIS LINE
      is_active: sizeFormData.is_active,
    };

    let response;
    if (editingSize) {
      response = await fetch('/api/admin/products/sizes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingSize.id, ...payload }),
      });
    } else {
      response = await fetch('/api/admin/products/sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (response.ok) {
      await fetchSizes(currentProductForSizes.id);
      setSizeFormData({
        size_name: '',
        price: '',
        discount_price: '',
        is_active: true,
        stock: '0',
      });
      setEditingSize(null);
    } else {
      const data = await response.json();
      alert(`Failed to save size: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Failed to save size:', error);
    alert('Failed to save size');
  }
};

const handleDeleteSize = async (sizeId: string) => {
  if (!confirm('Are you sure you want to delete this size?')) return;
  if (!currentProductForSizes) return;

  try {
    const response = await fetch(`/api/admin/products/sizes?id=${sizeId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await fetchSizes(currentProductForSizes.id);
    } else {
      alert('Failed to delete size');
    }
  } catch (error) {
    console.error('Failed to delete size:', error);
    alert('Failed to delete size');
  }
};

  return (
    <AdminLayout>
      <div className="space-y-6">
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

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsReordering(!isReordering)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isReordering
                ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <GripVertical className="w-4 h-4" />
            <span>{isReordering ? 'Done Reordering' : 'Reorder Products'}</span>
          </button>
          {isReordering && (
            <p className="text-sm text-amber-700">Drag products or use arrows to reorder</p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
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
                className={`bg-white rounded-xl overflow-hidden shadow-md border border-amber-100 transition-all duration-300 ${
                  isReordering ? 'cursor-move hover:shadow-lg' : ''
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
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

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-amber-900">{product.name}</h3>
                    {/* ✅ CORRECTED - Category badge moved to top-right with other badges */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        product.stock === 0 
                          ? 'bg-red-100 text-red-800' 
                          : product.stock < 10 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        Stock: {product.stock}
                      </span>
                      {/* ✅ MOVED HERE - Category badge now in top-right corner */}
                      
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-sm text-amber-600 mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      {product.discount_price !== null && product.discount_price !== undefined ? (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ${product.price !== null && product.price !== undefined ? product.price.toFixed(2) : 'N/A'}
                          </span>
                          <span className="text-2xl font-bold text-amber-900">
                            ${product.discount_price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-amber-900">
                          {product.price !== null && product.price !== undefined ? `$${product.price.toFixed(2)}` : 'Price TBD'}
                        </span>
                      )}
                      {product.product_categories && (
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${product.product_categories.color || '#f59e0b'}20`,
                            color: product.product_categories.color || '#f59e0b'
                          }}
                        >
                          {product.product_categories.name}
                        </span>
                      )}
                    </div>
                  </div>
                  

                  <div className="space-y-2">
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
    <button
  onClick={(e) => {
    e.stopPropagation();
    setCurrentProductForImages(product);
    setIsImageManagerOpen(true);
  }}
  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
>
  <ImageIcon className="w-4 h-4" />
  <span>Images</span>
</button>
  </div>
  <button
    onClick={() => openSizeModal(product)}
    className="w-full px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
  >
    <Package className="w-4 h-4" />
    <span>Manage Sizes</span>
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
                  placeholder="Enter product name (e.g., Fluffychoo)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Price ($) <span className="text-gray-500 text-sm font-normal">(Optional - leave empty for &quot;Price TBD&quot;)</span>
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

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Discount Price ($) <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="1.99 (optional)"
                />
              </div>

              {/* ✅ ADD THIS ENTIRE STOCK INPUT FIELD */}
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.stock}  // ✅ CORRECT - Use formData for product form
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}  // ✅ CORRECT
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter stock quantity (e.g., 15)"
                />
                <p className="text-xs text-amber-600 mt-1">
                  Set to 0 to mark this product as sold out
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-amber-600 mt-1">
                  Optional: Assign this product to a category
                </p>
              </div>

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

      
      {/* Size Management Modal */}
{isSizeModalOpen && currentProductForSizes && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-amber-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Manage Sizes</h2>
          <p className="text-sm text-amber-700 mt-1">{currentProductForSizes.name}</p>
        </div>
        <button
          onClick={() => {
            setIsSizeModalOpen(false);
            setCurrentProductForSizes(null);
            setSizes([]);
            setEditingSize(null);
          }}
          className="text-amber-600 hover:text-amber-800"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Add/Edit Size Form */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            {editingSize ? 'Edit Size' : 'Add New Size'}
          </h3>
          <form onSubmit={handleSaveSize} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Size Name *
                </label>
                <input
                  type="text"
                  required
                  value={sizeFormData.size_name}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, size_name: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder='e.g., 6", Small, Regular'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Price (₱) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={sizeFormData.price}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Discount Price (₱) <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sizeFormData.discount_price}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, discount_price: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={sizeFormData.stock}
                  onChange={(e) => setSizeFormData({ ...sizeFormData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter stock quantity"
                />
                <p className="text-xs text-amber-600 mt-1">
                  Set to 0 to mark as sold out
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sizeFormData.is_active}
                    onChange={(e) => setSizeFormData({ ...sizeFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-amber-900">Active</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingSize ? 'Update Size' : 'Add Size'}</span>
              </button>
              {editingSize && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSize(null);
                    setSizeFormData({
                      size_name: '',
                      price: '',
                      discount_price: '',
                      is_active: true,
                      stock: '0',
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        

        {/* Sizes List */}
        <div>
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Available Sizes</h3>
          {isLoadingSizes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
            </div>
          ) : sizes.length === 0 ? (
            <div className="text-center py-8 bg-amber-50 rounded-xl border border-amber-200">
              <Package className="w-12 h-12 text-amber-300 mx-auto mb-2" />
              <p className="text-amber-600">No sizes added yet. Add your first size above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sizes.map((size) => (
                <div
                  key={size.id}
                  className="bg-white rounded-xl p-4 border border-amber-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                     <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-amber-900">{size.size_name}</h4>
                      {!size.is_active && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                          Inactive
                        </span>
                      )}
                      {/* ✅ ADD THIS STOCK BADGE */}
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        size.stock === 0 
                          ? 'bg-red-100 text-red-800' 
                          : size.stock < 10 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        Stock: {size.stock}
                      </span>
                    </div>
                      <div className="flex items-center gap-3 mt-2">
                        {size.discount_price !== null && size.discount_price !== undefined ? (
                          <>
                            <span className="text-sm text-gray-500 line-through">
                              ₱{size.price.toFixed(2)}
                            </span>
                            <span className="text-lg font-bold text-amber-900">
                              ₱{size.discount_price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-amber-900">
                            ₱{size.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditSizeForm(size)}
                        className="px-3 py-2 text-amber-900 font-semibold rounded-lg hover:bg-amber-50 transition-all flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSize(size.id)}
                        className="px-3 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
    
  </div>
  
)}
{/* Image Manager Modal */}
{isImageManagerOpen && currentProductForImages && (
  <ProductImageManager
    productId={currentProductForImages.id}
    onClose={() => {
      setIsImageManagerOpen(false);
      setCurrentProductForImages(null);
    }}
  />
)}
    </AdminLayout>
  );
}