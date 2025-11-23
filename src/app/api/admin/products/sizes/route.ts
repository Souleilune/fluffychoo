export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface ProductSize {
  id?: string;
  product_id: string;
  size_name: string;
  price: number;
  discount_price?: number | null;
  is_active: boolean;
  display_order?: number;
}

// GET /api/admin/products/sizes?product_id=xxx - Get sizes for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('product_sizes')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch product sizes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product sizes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products/sizes - Create a new size for a product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, size_name, price, discount_price, is_active, display_order }: ProductSize = body;

    if (!product_id || !size_name || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Product ID, size name, and price are required' },
        { status: 400 }
      );
    }

    // Get the next display_order if not provided
    let order = display_order;
    if (order === undefined || order === null) {
      const { data: existingSizes } = await supabaseAdmin
        .from('product_sizes')
        .select('display_order')
        .eq('product_id', product_id)
        .order('display_order', { ascending: false })
        .limit(1);

      order = existingSizes && existingSizes.length > 0 
        ? existingSizes[0].display_order + 1 
        : 0;
    }

    const insertData = {
      product_id,
      size_name: size_name.trim(),
      price: parseFloat(price.toString()),
      discount_price: discount_price ? parseFloat(discount_price.toString()) : null,
      is_active: is_active !== undefined ? is_active : true,
      display_order: order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('product_sizes')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Failed to create product size:', error);
      return NextResponse.json(
        { error: 'Failed to create product size: ' + error.message },
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

// PATCH /api/admin/products/sizes - Update a product size
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Size ID is required' },
        { status: 400 }
      );
    }

    const updateData: Partial<ProductSize> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (updateFields.size_name !== undefined) {
      const name = updateFields.size_name?.trim();
      if (!name || name === '') {
        return NextResponse.json(
          { error: 'Size name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.size_name = name;
    }

    if (updateFields.price !== undefined) {
      updateData.price = parseFloat(updateFields.price.toString());
    }

    if (updateFields.discount_price !== undefined) {
      updateData.discount_price = updateFields.discount_price 
        ? parseFloat(updateFields.discount_price.toString()) 
        : null;
    }

    if (updateFields.is_active !== undefined) {
      updateData.is_active = Boolean(updateFields.is_active);
    }

    if (updateFields.display_order !== undefined) {
      updateData.display_order = parseInt(updateFields.display_order.toString());
    }

    const { data, error } = await supabaseAdmin
      .from('product_sizes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update product size:', error);
      return NextResponse.json(
        { error: 'Failed to update product size: ' + error.message },
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

// DELETE /api/admin/products/sizes?id=xxx - Delete a product size
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Size ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('product_sizes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete product size:', error);
      return NextResponse.json(
        { error: 'Failed to delete product size' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product size deleted successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}