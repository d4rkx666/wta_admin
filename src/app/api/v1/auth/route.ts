// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
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
    const verify = await verifyIdToken(token);
    const currentSession = await getSession();
    
    let isLoggedIn = false;
    if(!currentSession && verify){
      await setSession(token);
    }else if(currentSession){
      isLoggedIn = true;
    }

    return NextResponse.json({ success: true, isLoggedIn: isLoggedIn });
  } catch (error) {
    return NextResponse.json(
      { error: String(error)},
      { status: 403 }
    );
  }
}