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


//eslint-disable-next-line
export async function verifyIdToken(token: string):Promise<any | null>{
   try{
      const auth = getAuth(adminApp);
      const decoded = await auth.verifyIdToken(token);

      if(decoded.email){

         const data={
            uid: decoded.uid,
            email: decoded.email,
            displayName: "",
         }

         const userDoc = await getFirestore().collection('users').doc(decoded.uid).get();

         if (userDoc.exists) {
            const userFirestoreData = userDoc.data();


            if(!userFirestoreData?.isActive){
               return null
            }else{
               data.displayName = userFirestoreData.name as string
               return {
                  ...data,
                  ...userFirestoreData,
               };
            }
         }
      }else{
         return null;
      }
   }catch{
      return null;
   }
}

export { adminDb };