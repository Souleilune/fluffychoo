export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/settings - Get public settings (order form availability)
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('settings')
      .select('order_form_enabled, operating_hours_start, operating_hours_end, max_daily_orders, manual_override')
      .eq('id', 'app_settings')
      .single();

    if (error) {
      console.error('Settings fetch error:', error);
      // Return default if no settings found
      return NextResponse.json({
        success: true,
        data: { 
          order_form_enabled: true,
          operating_hours_start: 6,
          operating_hours_end: 21,
          max_daily_orders: 10,
          manual_override: false
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        order_form_enabled: settings.order_form_enabled,
        operating_hours_start: settings.operating_hours_start || 6,
        operating_hours_end: settings.operating_hours_end || 21,
        max_daily_orders: settings.max_daily_orders || 10,
        manual_override: settings.manual_override || false
      },
    });
  } catch (error) {
    console.error('Settings API error:', error);
    // Return default on error to prevent breaking the app
    return NextResponse.json({
      success: true,
      data: { 
        order_form_enabled: true,
        operating_hours_start: 6,
        operating_hours_end: 21,
        max_daily_orders: 10,
        manual_override: false
      },
    });
  }
}