export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/suggestions - Get all suggestions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('suggestions')
      .select('*, admins(name, email)');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/suggestions - Create a new suggestion
export async function POST(request: NextRequest) {
  try {
    const { title, suggestion, created_by } = await request.json();

    if (!title || !suggestion) {
      return NextResponse.json(
        { error: 'Title and suggestion are required' },
        { status: 400 }
      );
    }

    const insertData: {
      title: string;
      suggestion: string;
      created_by?: string;
    } = {
      title: title.trim(),
      suggestion: suggestion.trim(),
    };

    if (created_by) {
      insertData.created_by = created_by;
    }

    const { data, error } = await supabaseAdmin
      .from('suggestions')
      .insert([insertData])
      .select('*, admins(name, email)')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/suggestions - Update suggestion status
export async function PATCH(request: NextRequest) {
  try {
    const { id, title, suggestion, status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Suggestion ID is required' },
        { status: 400 }
      );
    }

    const updateData: {
      updated_at: string;
      title?: string;
      suggestion?: string;
      status?: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (suggestion !== undefined) updateData.suggestion = suggestion.trim();
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabaseAdmin
      .from('suggestions')
      .update(updateData)
      .eq('id', id)
      .select('*, admins(name, email)')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/suggestions - Delete a suggestion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Suggestion ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('suggestions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Suggestion deleted successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}