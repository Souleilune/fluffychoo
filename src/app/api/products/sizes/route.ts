export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/products/sizes?product_id=xxx - Get active sizes for a product (public)
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
      .select('id, size_name, price, discount_price, stock, display_order')
      .eq('product_id', productId)
      .eq('is_active', true)
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