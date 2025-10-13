import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, location, contactNumber, order, quantity } = body;
    
    if (!name || !location || !contactNumber || !order || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Insert order into Supabase using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          name,
          location,
          email: body.email || null,
          contact_number: contactNumber,
          order,
          quantity,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to submit order. Please try again.' },
        { status: 500 }
      );
    }

    // Send confirmation email if email is provided
    if (body.email) {
      try {
        await sendOrderConfirmationEmail({
          name,
          email: body.email,
          order,
          quantity,
          location,
          contactNumber,
        });
        
        console.log('✅ Order confirmation email sent to:', body.email);
      } catch (emailError) {
        // Log the error but don't fail the order
        console.error('⚠️ Failed to send confirmation email:', emailError);
        // Order is still successful, just email failed
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order submitted successfully',
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}