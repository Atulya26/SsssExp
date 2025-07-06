import { auth } from './config';
import { signInAnonymously, User, onAuthStateChanged } from 'firebase/auth';

export const signInAnonymous = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserId = (): string | null => {
  const user = getCurrentUser();
  return user ? user.uid : null;
};