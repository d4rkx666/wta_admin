// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authorization token missing' },
      { status: 401 }
    );
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const verify = await verifyIdToken(token);
    const currentSession = await getSession();
    
    // check if is correct and not current session
    if(verify && !currentSession){
      const getCookies = await cookies();

      getCookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: expiresIn,
        path: '/',
      });
    }else if(currentSession){
      
    }else{
      throw new Error();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error)},
      { status: 403 }
    );
  }
}