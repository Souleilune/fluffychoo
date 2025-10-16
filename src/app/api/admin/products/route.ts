import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/products - Get all products
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

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
    console.log('Received POST body:', body);
    
    // Extract and validate fields
    const name = body.name?.trim();
    const price = body.price?.trim();
    const description = body.description?.trim();
    const image = body.image?.trim();
    const stock = body.stock;
    const is_active = body.is_active;

    // Validate required fields
    if (!name) {
      console.log('Validation failed: name is missing');
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Get the next display_order value
    const { data: maxOrderData } = await supabaseAdmin
      .from('products')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (maxOrderData && maxOrderData[0]?.display_order || 0) + 1;

    // Prepare the product data
    const productData = {
      name: name,
      price: price && price !== '' ? parseFloat(price) : null,
      description: description && description !== '' ? description : null,
      image: image && image !== '' ? image : null,
      stock: stock ? parseInt(stock) : 0,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      display_order: nextOrder,
    };

    console.log('Inserting product data:', productData);

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create product: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 });
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
    console.log('Received PATCH body:', body);
    
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Process update data
    const updateData: any = {};

    if (updateFields.name !== undefined) {
      const name = updateFields.name?.trim();
      if (!name) {
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

    if (updateFields.description !== undefined) {
      const description = updateFields.description?.trim();
      updateData.description = description && description !== '' ? description : null;
    }

    if (updateFields.image !== undefined) {
      const image = updateFields.image?.trim();
      updateData.image = image && image !== '' ? image : null;
    }

    if (updateFields.stock !== undefined) {
      updateData.stock = parseInt(updateFields.stock) || 0;
    }

    if (updateFields.is_active !== undefined) {
      updateData.is_active = Boolean(updateFields.is_active);
    }

    if (updateFields.display_order !== undefined) {
      updateData.display_order = parseInt(updateFields.display_order);
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