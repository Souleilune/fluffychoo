import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// GET /api/admin/categories - Fetch all categories
export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('product_categories')
      .select(`
        *,
        products:products(count)
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories: ' + error.message },
        { status: 500 }
      );
    }

    // Transform data to include product count
    const categoriesWithCount = categories.map(category => ({
      ...category,
      product_count: category.products?.[0]?.count || 0,
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, is_active = true } = body;

    // Validate required fields
    const trimmedName = name?.trim();
    if (!trimmedName || trimmedName === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Get the highest display_order
    const { data: maxOrderData } = await supabaseAdmin
      .from('product_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.display_order ?? -1) + 1;

    // Process description
    let processedDescription = null;
    if (description !== null && description !== undefined && typeof description === 'string') {
      const trimmedDesc = description.trim();
      if (trimmedDesc !== '') {
        processedDescription = trimmedDesc;
      }
    }

    const categoryData = {
    name: trimmedName,
    description: processedDescription,
    color: body.color || '#f59e0b', // Default to amber
    is_active: is_active === true || is_active === 'true',
    display_order: nextOrder,
    };

    const { data, error } = await supabaseAdmin
      .from('product_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create category: ' + error.message },
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

// PATCH /api/admin/categories - Update category
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (updateFields.name !== undefined) {
      const name = updateFields.name?.trim();
      if (!name || name === '') {
        return NextResponse.json(
          { error: 'Category name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (updateFields.description !== undefined) {
      const description = updateFields.description?.trim();
      updateData.description = description && description !== '' ? description : null;
    }

    if (updateFields.is_active !== undefined) {
      updateData.is_active = Boolean(updateFields.is_active);
    }

    if (updateFields.display_order !== undefined) {
      updateData.display_order = parseInt(updateFields.display_order);
    }

    if (updateFields.color !== undefined) {
    const color = updateFields.color?.trim();
    updateData.color = color && color !== '' ? color : '#f59e0b';
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('product_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update category: ' + error.message },
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

// DELETE /api/admin/categories - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has products
    const { data: products, error: productError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (productError) {
      console.error('Error checking products:', productError);
    }

    // If category has products, set their category_id to null instead of blocking deletion
    if (products && products.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ category_id: null })
        .eq('category_id', id);

      if (updateError) {
        console.error('Error updating products:', updateError);
        return NextResponse.json(
          { error: 'Failed to unlink products from category' },
          { status: 500 }
        );
      }
    }

    // Delete the category
    const { error } = await supabaseAdmin
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete category: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}