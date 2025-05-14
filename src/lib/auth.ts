import { cookies } from 'next/headers';
import { verifyIdToken } from './firebase/admin';


export async function getSession() {
  const gettingCookies = await cookies();
  const session = gettingCookies.get('session')?.value;
  if (!session) return null;

  try {
    return await verifyIdToken(session);
  } catch (error) {
    await deleteSession();
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

export async function setSession(token: string) {
  const gettingCookies = await cookies();
  const expiresIn = 60 * 60 * 1000; // 1 hour
  try {
    gettingCookies.set('session', token, {
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
  gettingCookies.delete("session")
}