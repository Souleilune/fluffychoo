import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createToken, verifyPassword } from '@/lib/admin-auth';
import { cookies } from 'next/headers';

// POST /api/admin/auth - Login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Login attempt:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin by email
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    console.log('📊 Database query result:', {
      found: !!admin,
      error: error?.message,
      adminEmail: admin?.email,
      hasPasswordHash: !!admin?.password_hash,
      passwordHashLength: admin?.password_hash?.length
    });

    if (error || !admin) {
      console.log('❌ Admin not found in database');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('🔍 Verifying password...');
    const isValid = await verifyPassword(password, admin.password_hash);
    console.log('🔍 Password verification result:', isValid);

    if (!isValid) {
      console.log('❌ Password verification failed');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // Create JWT token
    const token = await createToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/auth - Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}