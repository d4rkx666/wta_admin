import { cookies } from 'next/headers';
import { verifyIdToken } from './firebase/admin';


export async function getSession() {
  const gettingCookies = await cookies();
  const session = gettingCookies.get('session')?.value;
  if (!session) return null;

  try {
    return await verifyIdToken(session);
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}