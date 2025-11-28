export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface ProductUpdateData {
  name?: string;
  price?: number | null;
  discount_price?: number | null;
  description?: string | null;
  image?: string | null;
  is_active?: boolean;
  display_order?: number;
  updated_at?: string;
  stock?: number; // ✅ ADD THIS LINE
  category_id?: string | null;
}

// GET /api/admin/products - Get all products
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        product_categories (
          id,
          name,
          color
        )
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received POST body:', JSON.stringify(body, null, 2));
    
    const name = body?.name;
    const price = body?.price;
    const discount_price = body?.discount_price;
    const description = body?.description;
    const image = body?.image;
    const is_active = body?.is_active;
    const stock = body?.stock;
    const category_id = body?.category_id;

    console.log('Field analysis:', {
      name: { value: name, type: typeof name, isNull: name === null, isUndefined: name === undefined },
      price: { value: price, type: typeof price },
      discount_price: { value: discount_price, type: typeof discount_price },
      description: { value: description, type: typeof description },
      image: { value: image, type: typeof image },
      is_active: { value: is_active, type: typeof is_active },
    });

    if (name === null || name === undefined) {
      console.error('VALIDATION FAILED: name is null or undefined');
      return NextResponse.json(
        { error: 'Product name is required (received null/undefined)' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string') {
      console.error('VALIDATION FAILED: name is not a string, type:', typeof name);
      return NextResponse.json(
        { error: `Product name must be a string (received ${typeof name})` },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName === '') {
      console.error('VALIDATION FAILED: name is empty after trim');
      return NextResponse.json(
        { error: 'Product name cannot be empty' },
        { status: 400 }
      );
    }

    const { data: maxOrderData } = await supabaseAdmin
      .from('products')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (maxOrderData && maxOrderData[0]?.display_order || 0) + 1;

    let processedPrice = null;
    if (price !== null && price !== undefined && price !== '') {
      if (typeof price === 'string' && price.trim() !== '') {
        const numPrice = parseFloat(price.trim());
        if (!isNaN(numPrice) && numPrice >= 0) {
          processedPrice = numPrice;
        }
      } else if (typeof price === 'number' && !isNaN(price) && price >= 0) {
        processedPrice = price;
      }
    }

    let processedDiscountPrice = null;
    if (discount_price !== null && discount_price !== undefined && discount_price !== '') {
      if (typeof discount_price === 'string' && discount_price.trim() !== '') {
        const numDiscountPrice = parseFloat(discount_price.trim());
        if (!isNaN(numDiscountPrice) && numDiscountPrice >= 0) {
          processedDiscountPrice = numDiscountPrice;
        }
      } else if (typeof discount_price === 'number' && !isNaN(discount_price) && discount_price >= 0) {
        processedDiscountPrice = discount_price;
      }
    }

    // ✅ ADD THIS ENTIRE STOCK PROCESSING BLOCK
    let processedStock = 0;
    if (stock !== null && stock !== undefined) {
      if (typeof stock === 'string' && stock.trim() !== '') {
        const numStock = parseInt(stock.trim(), 10);
        if (!isNaN(numStock) && numStock >= 0) {
          processedStock = numStock;
        }
      } else if (typeof stock === 'number' && !isNaN(stock) && stock >= 0) {
        processedStock = Math.floor(stock);
      }
    }

    let processedDescription = null;
    if (description !== null && description !== undefined && typeof description === 'string') {
      const trimmedDesc = description.trim();
      if (trimmedDesc !== '') {
        processedDescription = trimmedDesc;
      }
    }

    let processedImage = null;
    if (image !== null && image !== undefined && typeof image === 'string') {
      const trimmedImage = image.trim();
      if (trimmedImage !== '') {
        processedImage = trimmedImage;
      }
    }

    let processedCategoryId = null;
      if (category_id !== null && category_id !== undefined && typeof category_id === 'string') {
        const trimmedCategoryId = category_id.trim();
        if (trimmedCategoryId !== '' && trimmedCategoryId !== 'null' && trimmedCategoryId !== 'undefined') {
          processedCategoryId = trimmedCategoryId;
        }
      }

    const productData = {
      name: trimmedName,
      price: processedPrice,
      discount_price: processedDiscountPrice,
      stock: processedStock,  // ✅ ADD THIS LINE
      description: processedDescription,
      image: processedImage,
      is_active: is_active === true || is_active === 'true',
      display_order: nextOrder,
      category_id: processedCategoryId,
    };

    console.log('FINAL PRODUCT DATA:', JSON.stringify(productData, null, 2));

    if (!productData.name || productData.name === '') {
      console.error('CRITICAL ERROR: Final product data has empty name!');
      return NextResponse.json(
        { error: 'Product name became empty after processing' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create product: ' + error.message },
        { status: 500 }
      );
    }

    console.log('Product created successfully:', data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products - Update product
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating product:', id, 'with fields:', updateFields);

    const updateData: ProductUpdateData = {};

    if (updateFields.name !== undefined) {
      const name = updateFields.name?.trim();
      if (!name || name === '') {
        return NextResponse.json(
          { error: 'Product name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (updateFields.price !== undefined) {
      const price = updateFields.price?.trim();
      updateData.price = price && price !== '' ? parseFloat(price) : null;
    }

    if (updateFields.discount_price !== undefined) {
      const discount_price = updateFields.discount_price?.trim();
      updateData.discount_price = discount_price && discount_price !== '' ? parseFloat(discount_price) : null;
    }

    // ✅ ADD THIS ENTIRE STOCK UPDATE BLOCK
    if (updateFields.stock !== undefined && updateFields.stock !== null) {
      const stockValue = typeof updateFields.stock === 'string' 
        ? parseInt(updateFields.stock.trim(), 10) 
        : updateFields.stock;
      if (!isNaN(stockValue) && stockValue >= 0) {
        updateData.stock = Math.floor(stockValue);
      }
    }

    if (updateFields.description !== undefined) {
      const description = updateFields.description?.trim();
      updateData.description = description && description !== '' ? description : null;
    }

    if (updateFields.image !== undefined) {
      const image = updateFields.image?.trim();
      updateData.image = image && image !== '' ? image : null;
    }

    if (updateFields.is_active !== undefined) {
      updateData.is_active = Boolean(updateFields.is_active);
    }

    if (updateFields.display_order !== undefined) {
      updateData.display_order = parseInt(updateFields.display_order);
    }

    if (updateFields.category_id !== undefined) {
      const categoryId = updateFields.category_id;
      if (categoryId === null || categoryId === '' || categoryId === 'null' || categoryId === 'undefined') {
        updateData.category_id = null;
      } else {
        updateData.category_id = categoryId;
      }
    }

    updateData.updated_at = new Date().toISOString();

    console.log('Updating with data:', updateData);

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update product: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}