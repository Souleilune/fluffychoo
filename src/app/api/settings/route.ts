import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/settings - Get public settings (order form availability)
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('settings')
      .select('order_form_enabled')
      .eq('id', 'app_settings')
      .single();

    if (error) {
      console.error('Settings fetch error:', error);
      // Return default if no settings found
      return NextResponse.json({
        success: true,
        data: { order_form_enabled: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: { order_form_enabled: settings.order_form_enabled },
    });
  } catch (error) {
    console.error('Settings API error:', error);
    // Return default on error to prevent breaking the app
    return NextResponse.json({
      success: true,
      data: { order_form_enabled: true },
    });
  }
}