// HOTFIX: Create new file src/app/api/admin/products/reorder/route.ts

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

    // Update display_order for each product
    const updates = productIds.map((productId, index) => ({
      id: productId,
      display_order: index + 1,
      updated_at: new Date().toISOString(),
    }));

    // Use upsert to update multiple records efficiently
    const { error } = await supabaseAdmin
      .from('products')
      .upsert(updates, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to reorder products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Products reordered successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}