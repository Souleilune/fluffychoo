import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
  try {
    // Get total orders
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get pending orders
    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get completed orders
    const { count: completedOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get active products
    const { count: activeProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get recent orders (last 5)
    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get orders by status
    const { data: ordersByStatus } = await supabaseAdmin
      .from('orders')
      .select('status');

    const statusCounts = ordersByStatus?.reduce((acc: { [key: string]: number }, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Get revenue (sum of all completed orders)
    const { data: completedOrdersData } = await supabaseAdmin
      .from('orders')
      .select('quantity, order')
      .eq('status', 'completed');

    // Calculate total revenue (this is approximate - you might want to add price to orders table)
    const totalRevenue = completedOrdersData?.reduce((sum, order) => {
      // Assuming average price of $2.99 per item
      return sum + (order.quantity * 2.99);
    }, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        orders: {
          total: totalOrders || 0,
          pending: pendingOrders || 0,
          completed: completedOrders || 0,
          byStatus: statusCounts || {},
        },
        products: {
          total: totalProducts || 0,
          active: activeProducts || 0,
        },
        revenue: {
          total: totalRevenue.toFixed(2),
        },
        recentOrders: recentOrders || [],
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}