import { jwtVerify, SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export async function createToken(user: AdminUser): Promise<string> {
  const token = await new SignJWT({ 
    id: user.id,
    email: user.email,
    name: user.name,
    type: 'admin'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET_KEY);

  return token;
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    if (payload.type !== 'admin') {
      return null;
    }

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt. For now, we'll use a simple hash
  // Install bcryptjs: npm install bcryptjs @types/bcryptjs
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // TEMPORARY BYPASS FOR TESTING - REMOVE IN PRODUCTION!
    if (hash === 'TEST_BYPASS' && password === 'admin123') {
      console.log('⚠️  Using TEST BYPASS - password accepted');
      return true;
    }
    
    console.log('🔐 verifyPassword called:', {
      passwordLength: password?.length,
      hashLength: hash?.length,
      hashPrefix: hash?.substring(0, 7)
    });
    
    const bcrypt = await import('bcryptjs');
    const result = await bcrypt.compare(password, hash);
    
    console.log('🔐 bcrypt.compare result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in verifyPassword:', error);
    return false;
  }
}