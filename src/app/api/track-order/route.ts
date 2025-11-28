// src/app/api/track-order/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/track-order?reference=FLC-YYYYMMDD-XXXXX
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    // Validate reference parameter
    if (!reference) {
      return NextResponse.json(
        { error: 'Order reference is required' },
        { status: 400 }
      );
    }

    // Validate reference format
    const referencePattern = /^FLC-\d{8}-[A-Z0-9]{5}$/;
    if (!referencePattern.test(reference)) {
      return NextResponse.json(
        { error: 'Invalid order reference format' },
        { status: 400 }
      );
    }

    // Query order by reference number using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_reference, name, order, quantity, total_amount, status, created_at, updated_at')
      .eq('order_reference', reference.trim().toUpperCase())
      .single();

    if (error) {
      // Check if it's a "not found" error
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found. Please check your reference number.' },
          { status: 404 }
        );
      }
      
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch order details' },
        { status: 500 }
      );
    }

    // Return only safe customer data (no sensitive info like contact number, email, location)
    return NextResponse.json({
      success: true,
      data: {
        order_reference: data.order_reference,
        name: data.name,
        order: data.order,
        quantity: data.quantity,
        total_amount: data.total_amount,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}