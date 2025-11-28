'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit, Trash2, X, Save, FolderOpen, GripVertical, Package, Search } from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  description: string | null;
  color?: string | null;
  display_order: number;
  is_active: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number | null;
  discount_price?: number | null;
  description: string | null;
  image: string | null;
  stock: number;
  is_active: boolean;
  category_id?: string | null;
}

// Predefined color options
const COLOR_OPTIONS = [
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-900' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-900' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-900' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900' },
  { name: 'Green', value: '#22c55e', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
  { name: 'Lime', value: '#84cc16', bg: 'bg-lime-100', border: 'border-lime-300', text: 'text-lime-900' },
  { name: 'Yellow', value: '#eab308', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
  { name: 'Gray', value: '#6b7280', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-900' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#f59e0b', // Default amber
    is_active: true,
  });

  // Products view modal states
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryProducts = async (categoryId: string) => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      if (data.success) {
        const filtered = data.data.filter((product: Product) => product.category_id === categoryId);
        setCategoryProducts(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      alert('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: '#f59e0b', is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#f59e0b',
      is_active: category.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: '#f59e0b', is_active: true });
  };

  const openProductsModal = async (category: Category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setIsProductsModalOpen(true);
    await fetchCategoryProducts(category.id);
  };

  const closeProductsModal = () => {
    setIsProductsModalOpen(false);
    setSelectedCategory(null);
    setCategoryProducts([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const url = '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      const body = editingCategory
        ? { id: editingCategory.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCategories();
        closeModal();
      } else {
        alert(data.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id: string, productCount: number) => {
    const confirmMessage = productCount > 0
      ? `This category has ${productCount} product(s). Deleting it will unlink these products. Continue?`
      : 'Are you sure you want to delete this category?';

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex((c) => c.id === categoryId);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === categories.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const reorderedCategories = [...categories];
    const [movedCategory] = reorderedCategories.splice(currentIndex, 1);
    reorderedCategories.splice(newIndex, 0, movedCategory);

    const updates = reorderedCategories.map((cat, index) => ({
      id: cat.id,
      display_order: index,
    }));

    setCategories(reorderedCategories);

    try {
      await Promise.all(
        updates.map((update) =>
          fetch('/api/admin/categories', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update),
          })
        )
      );
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      await fetchCategories();
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
          is_active: !category.is_active,
        }),
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        alert('Failed to update category status');
      }
    } catch (error) {
      console.error('Failed to toggle category:', error);
      alert('Failed to update category status');
    }
  };

  const getColorClasses = (colorValue: string | null | undefined) => {
    const color = COLOR_OPTIONS.find(c => c.value === colorValue);
    return color || COLOR_OPTIONS[0]; // Default to amber if not found
  };

  const filteredProducts = categoryProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Product Categories</h1>
            <p className="text-amber-700 mt-1">Organize your products into categories</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-6 py-2.5 text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
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
            <span>{isReordering ? 'Done Reordering' : 'Reorder Categories'}</span>
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-amber-200">
            <FolderOpen className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">No Categories Yet</h3>
            <p className="text-amber-600 mb-4">Create your first category to organize products</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-2.5 text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {categories.map((category, index) => {
              const colorClasses = getColorClasses(category.color);
              return (
                <div
                  key={category.id}
                  onClick={() => !isReordering && openProductsModal(category)}
                  className={`bg-white rounded-xl border-2 border-amber-100 p-6 transition-all duration-300 ${
                    !isReordering ? 'hover:shadow-lg cursor-pointer hover:border-amber-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Color Badge */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color || '#f59e0b' }}
                      >
                        <FolderOpen className="w-6 h-6 text-white" />
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-amber-900">{category.name}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              category.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {category.description && (
                          <p className="text-amber-700 mb-3">{category.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-amber-600">
                          <div className="flex items-center space-x-1">
                            <Package className="w-4 h-4" />
                            <span>{category.product_count || 0} products</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isReordering ? (
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleReorder(category.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-amber-600 hover:text-amber-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <GripVertical className="w-5 h-5 rotate-90" />
                          </button>
                          <button
                            onClick={() => handleReorder(category.id, 'down')}
                            disabled={index === categories.length - 1}
                            className="p-1 text-amber-600 hover:text-amber-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <GripVertical className="w-5 h-5 -rotate-90" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleActive(category)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              category.is_active
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                          >
                            {category.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.product_count || 0)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-amber-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-amber-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={closeModal} className="text-amber-600 hover:text-amber-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="e.g., Mochi Brownies"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Brief description of this category..."
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Category Color *
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`relative h-12 rounded-lg transition-all duration-200 ${
                        formData.color === color.value
                          ? 'ring-4 ring-offset-2 ring-amber-400 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {formData.color === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  Selected: {COLOR_OPTIONS.find(c => c.value === formData.color)?.name || 'Amber'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-amber-900">
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-2.5 border-2 border-amber-200 text-amber-900 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-2.5 text-amber-900 font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(to right, #fef9c3, #fde68a)' }}
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Category Products Modal */}
      {isProductsModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header with Category Color */}
            <div 
              className="p-6 border-b-4 flex items-center justify-between bg-white"
              style={{ borderBottomColor: selectedCategory.color || '#f59e0b' }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedCategory.color || '#f59e0b' }}
                >
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{selectedCategory.name}</h2>
                  <p className="text-sm text-amber-700 mt-1">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                    {searchQuery && ` (filtered from ${categoryProducts.length})`}
                  </p>
                </div>
              </div>
              <button onClick={closeProductsModal} className="text-amber-600 hover:text-amber-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-amber-100 bg-amber-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">
                    {searchQuery ? 'No products found' : 'No products in this category'}
                  </h3>
                  <p className="text-amber-600">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Add products and assign them to this category'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border-2 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                      style={{ borderColor: selectedCategory.color || '#f59e0b' }}
                    >
                      <div className="flex space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {product.image ? (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-amber-50">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div 
                              className="w-20 h-20 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${selectedCategory.color || '#f59e0b'}20` }}
                            >
                              <Package 
                                className="w-8 h-8" 
                                style={{ color: selectedCategory.color || '#f59e0b' }} 
                              />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-amber-900 mb-1 truncate">
                            {product.name}
                          </h4>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            {product.discount_price ? (
                              <>
                                <span className="text-lg font-bold text-amber-900">
                                  ${product.discount_price}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.price}
                                </span>
                              </>
                            ) : product.price ? (
                              <span className="text-lg font-bold text-amber-900">
                                ${product.price}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">Price TBD</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 text-xs">
                            <span
                              className={`px-2 py-1 rounded-full font-medium ${
                                product.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-amber-700">
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}