import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!getApps().length) {
   initializeApp({
      credential: cert(serviceAccount),
   });
}

const adminApp = getApp();
const adminDb = getFirestore(adminApp);


export async function verifyIdToken(token: string) {
   const auth = getAuth(adminApp);
   return await auth.verifyIdToken(token);
 }

export { adminDb };