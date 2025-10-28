export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/settings/check-availability - Check if order form should be available
export async function GET() {
  try {
    // Get settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 'app_settings')
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json({
        success: true,
        data: { 
          is_available: true,
          reason: null
        },
      });
    }

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: { 
          is_available: true,
          reason: null
        },
      });
    }

    // Check if form is manually disabled (order_form_enabled = false)
    // This is the ONLY case where manual control fully overrides auto-rules
    if (!settings.order_form_enabled) {
      return NextResponse.json({
        success: true,
        data: {
          is_available: false,
          reason: 'manually_closed',
          message: `We're taking a short pause for now. If you need assistance or have any questions, we’d love to hear from you on our socials.`
        },
      });
    }

   
    // Check operating hours (Philippine Time - UTC+8)
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const currentHour = phTime.getHours();
    
    const operatingStart = settings.operating_hours_start || 6;
    const operatingEnd = settings.operating_hours_end || 21;
    
    if (currentHour < operatingStart || currentHour >= operatingEnd) {
      return NextResponse.json({
        success: true,
        data: {
          is_available: false,
          reason: 'outside_hours',
          message: `We're all tucked in for the night. The order form reopens again from ${operatingStart}:00 AM to ${operatingEnd}:00 PM (Philippine Time). Message us on our socials if you need assistance.`,
          operating_hours: {
            start: operatingStart,
            end: operatingEnd,
            current_hour: currentHour
          }
        },
      });
    }

    // Check today's pending order count
    const startOfDayPH = new Date(phTime);
    startOfDayPH.setHours(0, 0, 0, 0);
    
    const endOfDayPH = new Date(phTime);
    endOfDayPH.setHours(23, 59, 59, 999);

    // Count pending orders created today, sum their quantities
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('quantity')
      .eq('status', 'pending')
      .gte('created_at', startOfDayPH.toISOString())
      .lte('created_at', endOfDayPH.toISOString());

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      // On error, allow orders to prevent blocking
      return NextResponse.json({
        success: true,
        data: { 
          is_available: true,
          reason: null
        },
      });
    }

    // Calculate total quantity from all pending orders today
    const totalPendingQuantity = orders?.reduce((sum, order) => sum + (order.quantity || 0), 0) || 0;
    const maxDailyOrders = settings.max_daily_orders || 10;

    if (totalPendingQuantity >= maxDailyOrders) {
      return NextResponse.json({
        success: true,
        data: {
          is_available: false,
          reason: 'max_orders_reached',
          message: 'We have reached our maximum order capacity for today. Please try again tomorrow.',
          order_count: {
            current: totalPendingQuantity,
            max: maxDailyOrders
          }
        },
      });
    }

    // All checks passed, form is available
    return NextResponse.json({
      success: true,
      data: {
        is_available: true,
        reason: null,
        order_count: {
          current: totalPendingQuantity,
          max: maxDailyOrders
        }
      },
    });

  } catch (error) {
    console.error('Availability check error:', error);
    // On error, allow orders to prevent blocking
    return NextResponse.json({
      success: true,
      data: { 
        is_available: true,
        reason: null
      },
    });
  }
}