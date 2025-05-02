import { adminDb } from '../firebase/admin';
import { DocumentData } from 'firebase-admin/firestore';

class FirestoreService {
  async getDocument(collection: string, docId: string): Promise<DocumentData | null> {
    const docRef = adminDb.collection(collection).doc(docId);
    const doc = await docRef.get();
    return doc.exists? doc : null;
  }

  async setDocument(collection: string, docId: string, data: any): Promise<void> {
    const docRef = adminDb.collection(collection).doc(docId);
    await docRef.set(data, { merge: true }); // merge: true updates existing docs
  }

  async deleteDocument(collection: string, docId: string): Promise<void> {
    const docRef = adminDb.collection(collection).doc(docId);
    await docRef.delete();
  }
}

export const firestoreService = new FirestoreService();