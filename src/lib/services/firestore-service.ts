import { adminDb } from '../firebase/admin';
import { DocumentData } from 'firebase-admin/firestore';

/* eslint-disable */
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

  async upsertData(collection: string, docId: string, fieldName: string, data: any, data_id: string): Promise<void> {
    const docRef = adminDb.collection(collection).doc(docId);

    // Fetch the document to check if the data already exists in the array
    const docSnapshot = await docRef.get();
    
    if (!docSnapshot.exists) {
        throw new Error(`Document with ID ${docId} does not exist.`);
    }

    const currentData = docSnapshot.data()?.[fieldName] as Object[];

    // Check if the data with the specific data_id exists in the array
    const existingIndex = currentData.findIndex(item => (item as { id: string }).id === data_id);

    if (existingIndex >= 0) {
        // If it exists, update the existing data (remove the old one and insert the updated one)
        currentData[existingIndex] = data;
    } else {
        // If it doesn't exist, add the new data
        currentData.push(data);
    }

    // Now update the document with the new array
    await docRef.update({ [fieldName]: currentData });
  }

  async deleteDocument(collection: string, docId: string): Promise<void> {
    const docRef = adminDb.collection(collection).doc(docId);
    await docRef.delete();
  }

  async updateDocument(collection: string, docId: string, fieldName: string, data: Object): Promise<void> {
    const docRef = adminDb.collection(collection).doc(docId);
    await docRef.update({ [fieldName]: data });
  }
}
/* eslint-enable */

export const firestoreService = new FirestoreService();