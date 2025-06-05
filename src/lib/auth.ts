import { cookies } from 'next/headers';
import { verifyIdToken } from './firebase/admin';
import { firestoreService } from '@/lib/services/firestore-service';

const SESSION_NAME = "admin-session";


export async function getSession():Promise<{uid: string, displayName: string, email: string, firstTime: boolean} | null> {
  const gettingCookies = await cookies();
  const session = gettingCookies.get(SESSION_NAME)?.value;
  if (!session) return null;

  try {
    const check =  await verifyIdToken(session);
    if(check){
      const isAdminUser = await firestoreService.checkUserRole(check.uid)
      if(!isAdminUser){
        await deleteSession();
        return null;
      }
    }
    return check;
  } catch{
    await deleteSession();
    return null;
  }
}

export async function setSession(token: string) {
  const gettingCookies = await cookies();
  const expiresIn = 60 * 60 * 1000; // 1 hour
  try {
    gettingCookies.set(SESSION_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn,
      path: '/',
    });
  } catch (error) {
    console.error('Error setting session cookie:', error);
    return null;
  }
}


export async function deleteSession() {
  const gettingCookies = await cookies();
  gettingCookies.delete(SESSION_NAME)
}