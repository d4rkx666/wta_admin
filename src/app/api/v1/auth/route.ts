// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/auth';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authorization token missing' },
      { status: 401 }
    );
  }

  try {
    await setSession(token); // set cookie
    const isAuth = await getSession(); // verify is user is authentic
    if(!isAuth){
      return NextResponse.json({ success: false, isLoggedIn: false });
    }

    return NextResponse.json({ success: true, isLoggedIn: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error)},
      { status: 403 }
    );
  }
}