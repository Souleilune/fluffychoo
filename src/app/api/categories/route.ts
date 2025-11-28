export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/categories - Get all active categories (public)
export async function GET() {
  try {
    // Create public supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('product_categories')
      .select('id, name, color, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      );
    }

    console.log('Categories fetched:', data); // Debug log

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}