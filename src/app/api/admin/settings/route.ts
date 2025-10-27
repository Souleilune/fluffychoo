export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/settings - Get settings
export async function GET() {
  try {
    // Get or create settings record
    const result = await supabaseAdmin
      .from('settings')
      .select('*')
      .single();
    
    let settings = result.data;
    const error = result.error;

    if (error && error.code === 'PGRST116') {
      // No settings found, create default
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('settings')
        .insert([{ 
          id: 'app_settings',
          order_form_enabled: true,
          max_daily_orders: 10,
          manual_override: false,
          operating_hours_start: 6,
          operating_hours_end: 21,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Failed to create settings:', createError);
        return NextResponse.json(
          { error: 'Failed to create settings' },
          { status: 500 }
        );
      }
      settings = newSettings;
    } else if (error) {
      console.error('Settings fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Update settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      order_form_enabled, 
      max_daily_orders, 
      operating_hours_start,
      operating_hours_end 
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, string | number | boolean> = {
      updated_at: new Date().toISOString()
    };

    // Validate and add order_form_enabled
    // When toggling, we just update the enabled status
    // The auto-rules (time and count) still apply regardless
    if (typeof order_form_enabled === 'boolean') {
      updateData.order_form_enabled = order_form_enabled;
    }

    // Validate and add max_daily_orders
    if (max_daily_orders !== undefined) {
      const maxOrders = parseInt(max_daily_orders);
      if (isNaN(maxOrders) || maxOrders < 1) {
        return NextResponse.json(
          { error: 'max_daily_orders must be a positive number' },
          { status: 400 }
        );
      }
      updateData.max_daily_orders = maxOrders;
    }

    // Validate and add operating_hours_start
    if (operating_hours_start !== undefined) {
      const startHour = parseInt(operating_hours_start);
      if (isNaN(startHour) || startHour < 0 || startHour > 23) {
        return NextResponse.json(
          { error: 'operating_hours_start must be between 0 and 23' },
          { status: 400 }
        );
      }
      updateData.operating_hours_start = startHour;
    }

    // Validate and add operating_hours_end
    if (operating_hours_end !== undefined) {
      const endHour = parseInt(operating_hours_end);
      if (isNaN(endHour) || endHour < 0 || endHour > 23) {
        return NextResponse.json(
          { error: 'operating_hours_end must be between 0 and 23' },
          { status: 400 }
        );
      }
      updateData.operating_hours_end = endHour;
    }

    // Update settings
    const { data, error } = await supabaseAdmin
      .from('settings')
      .update(updateData)
      .eq('id', 'app_settings')
      .select()
      .single();

    if (error) {
      console.error('Settings update error:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}