export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/feedback - Create a new customer feedback
export async function POST(request: NextRequest) {
  try {
    const { title, suggestion, name, email } = await request.json();

    if (!title || !suggestion) {
      return NextResponse.json(
        { error: 'Title and feedback are required' },
        { status: 400 }
      );
    }

    const insertData: {
      title: string;
      feedback: string;
      name?: string;
      email?: string;
      status: string;
    } = {
      title: title.trim(),
      feedback: suggestion.trim(),
      status: 'pending',
    };

    if (name && name.trim()) {
      insertData.name = name.trim();
    }

    if (email && email.trim()) {
      insertData.email = email.trim();
    }

    const { data, error } = await supabaseAdmin
      .from('customer_feedback')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Thank you for your feedback!',
    }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}