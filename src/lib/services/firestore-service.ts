import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { adminDb } from '../firebase/admin';

/* eslint-disable */
class FirestoreService {
  async getDocument(collection: string, docId: string): Promise<any | null> {
    const docRef = adminDb.collection(collection).doc(docId);
    const doc = await docRef.get();
    return doc.exists? doc.data() : null;
  }

  async getDocuments(collection: string, fieldName:string, docId: string): Promise<any | null> {
    const collectionRef = adminDb.collection(collection);
    const querySnapshot = await collectionRef.where(fieldName, '==', docId).get();

    const documents: any[] = [];
    querySnapshot.forEach(doc => {
      documents.push(doc.data());
    });
    return documents
  }

  async getDocumentsBy(collection: string, fieldName:string, query: string): Promise<any | null> {
    const collectionRef = adminDb.collection(collection);
    const querySnapshot = await collectionRef.where(fieldName, '==', query).get();

    const documents: any[] = [];
    querySnapshot.forEach(doc => {
      documents.push(doc.data());
    });
    return documents
  }

  async getCollection(collection: string): Promise<any | null> {
    const docRef = adminDb.collection(collection);
    const snap = await docRef.get();
    return snap.docs? snap.docs.map(doc => doc.data()) : null;
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

  async setMultipleDocuments(data:MultipleDoc[]): Promise<void>{
    await adminDb.runTransaction( async (transaction) => {
      for (const docData of data) {
        const docRef = adminDb.collection(docData.collection).doc(docData.docId);
        transaction.set(docRef, docData.data, { merge: true }); 
      }
    });
  }
  
  async deleteMultipleDocuments(data:MultipleDoc[]): Promise<void>{
    await adminDb.runTransaction( async (transaction) => {
      for (const docData of data) {
        const docRef = adminDb.collection(docData.collection).doc(docData.docId);
        transaction.delete(docRef); 
      }
    });
  }

  async checkUserRole(uid: string):Promise<boolean> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.role === 'admin') {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}
}
/* eslint-enable */

export const firestoreService = new FirestoreService();