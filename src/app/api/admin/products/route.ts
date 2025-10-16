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
    console.log('Received POST body:', JSON.stringify(body, null, 2));
    
    // BULLETPROOF: Extract and validate fields with extreme caution
    const name = body?.name;
    const price = body?.price;
    const description = body?.description;
    const image = body?.image;
    const stock = body?.stock;
    const is_active = body?.is_active;

    console.log('Field analysis:', {
      name: { value: name, type: typeof name, isNull: name === null, isUndefined: name === undefined },
      price: { value: price, type: typeof price },
      description: { value: description, type: typeof description },
      image: { value: image, type: typeof image },
      stock: { value: stock, type: typeof stock },
      is_active: { value: is_active, type: typeof is_active },
    });

    // BULLETPROOF: Name validation
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

    // BULLETPROOF: Get display_order
    const { data: maxOrderData } = await supabaseAdmin
      .from('products')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (maxOrderData && maxOrderData[0]?.display_order || 0) + 1;

    // BULLETPROOF: Process other fields safely
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

    let processedStock = 0;
    if (stock !== null && stock !== undefined) {
      const numStock = typeof stock === 'string' ? parseInt(stock) : stock;
      if (!isNaN(numStock) && numStock >= 0) {
        processedStock = numStock;
      }
    }

    // BULLETPROOF: Final product data
    const productData = {
      name: trimmedName, // We know this is safe now
      price: processedPrice,
      description: processedDescription,
      image: processedImage,
      stock: processedStock,
      is_active: is_active === true || is_active === 'true',
      display_order: nextOrder,
    };

    console.log('FINAL PRODUCT DATA:', JSON.stringify(productData, null, 2));

    // BULLETPROOF: Final validation before insert
    if (!productData.name || productData.name === '') {
      console.error('CRITICAL ERROR: Final product data has empty name!');
      return NextResponse.json(
        { error: 'Critical error: product name is empty in final data' },
        { status: 500 }
      );
    }

    console.log('Attempting database insert...');
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to create product: ' + error.message },
        { status: 500 }
      );
    }

    console.log('SUCCESS: Product created:', data);
    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
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