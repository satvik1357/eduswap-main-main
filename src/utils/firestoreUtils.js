// src/utils/firestoreUtils.js

import { getFirestore, addDoc, collection, Timestamp } from 'firebase/firestore';

export const createRequest = async (requesterId, receiverId) => {
  const db = getFirestore();
  try {
    await addDoc(collection(db, 'requests'), {
      requesterId,
      receiverId,
      status: 'pending',
      timestamp: Timestamp.now()
    });
    console.log('Request sent successfully.');
  } catch (error) {
    console.error('Error sending request: ', error);
    throw error;
  }
};
