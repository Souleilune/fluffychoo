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
    const { order_form_enabled } = body;

    if (typeof order_form_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'order_form_enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Update settings
    const { data, error } = await supabaseAdmin
      .from('settings')
      .update({ 
        order_form_enabled,
        updated_at: new Date().toISOString()
      })
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