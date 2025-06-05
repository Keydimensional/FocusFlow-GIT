import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AppState } from '../types';

export const saveUserData = async (uid: string, data: AppState) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const loadUserData = async (uid: string): Promise<AppState | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as AppState;
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};