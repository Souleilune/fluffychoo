import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/feedback - Create a new customer feedback
export async function POST(request: NextRequest) {
  try {
    const { title, suggestion, name, email } = await request.json();

    if (!title || !suggestion) {
      return NextResponse.json(
        { error: 'Title and suggestion are required' },
        { status: 400 }
      );
    }

    const insertData: {
      title: string;
      suggestion: string;
      status: string;
      created_by: null;
    } = {
      title: `[Customer] ${title.trim()}`,
      suggestion: `From: ${name || 'Anonymous'}${email ? ` (${email})` : ''}\n\n${suggestion.trim()}`,
      status: 'pending',
      created_by: null,
    };

    const { data, error } = await supabaseAdmin
      .from('suggestions')
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