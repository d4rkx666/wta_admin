import { adminDb } from '../firebase/admin';
import { DocumentData } from 'firebase-admin/firestore';

class FirestoreService {
  async getDocument(collection: string, docId: string): Promise<DocumentData | null> {
    const docRef = adminDb.collection(collection).doc(docId);
    const doc = await docRef.get();
    return doc.exists? doc : null;
  }
}

export const firestoreService = new FirestoreService();