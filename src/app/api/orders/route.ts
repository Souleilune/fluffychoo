export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';
import { generateOrderReference } from '@/lib/order-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, location, contactNumber, order, quantity, termsAccepted, captchaToken } = body;
    const { orderItems } = body;
    
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

    // Validate terms acceptance
    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions' },
        { status: 400 }
      );
    }

    // CAPTCHA VERIFICATION
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'CAPTCHA verification required' },
        { status: 400 }
      );
    }

    // Verify CAPTCHA token with Google
    const captchaVerifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const captchaResponse = await fetch(captchaVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
    });

    const captchaData = await captchaResponse.json();

    if (!captchaData.success) {
      console.error('CAPTCHA verification failed:', captchaData);
      return NextResponse.json(
        { error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Generate unique order reference
    const orderReference = generateOrderReference();
    
    let totalAmount = 0;
    if (orderItems && Array.isArray(orderItems)) {
      totalAmount = orderItems.reduce((sum, item) => {
        const effectivePrice = item.discount_price !== null && item.discount_price !== undefined 
          ? item.discount_price 
          : item.price;
        return sum + (effectivePrice * item.quantity);
      }, 0);
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
          total_amount: totalAmount,
          status: 'pending',
          payment_proof_url: body.paymentProofUrl || null,
          terms_accepted: termsAccepted,
          order_reference: orderReference,
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
          orderReference,
        });
        
        console.log('✅ Order confirmation email sent to:', body.email);
      } catch (emailError) {
        // Log the error but don't fail the order
        console.error('⚠️ Failed to send confirmation email:', emailError);
        // Order is still successful, just email failed
      }
    }

    // Send admin notification (always send, even if customer email failed)
    try {
      await sendAdminOrderNotification({
        name,
        email: body.email || null,
        order,
        quantity,
        location,
        contactNumber,
        orderReference,
        paymentProofUrl: body.paymentProofUrl || null,
      });
      
      console.log('✅ Admin notification sent');
    } catch (emailError) {
      // Log the error but don't fail the order
      console.error('⚠️ Failed to send admin notification:', emailError);
      // Order is still successful, just notification failed
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