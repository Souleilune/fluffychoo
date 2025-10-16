import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/admin/products/reorder - Update product display order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    // Update each product's display_order individually using update instead of upsert
    const updatePromises = productIds.map(async (productId, index) => {
      const { error } = await supabaseAdmin
        .from('products')
        .update({
          display_order: index + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (error) {
        console.error(`Error updating product ${productId}:`, error);
        throw error;
      }
      
      return productId;
    });

    // Execute all updates
    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Products reordered successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder products' },
      { status: 500 }
    );
  }
}