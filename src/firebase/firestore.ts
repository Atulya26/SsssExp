import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface Member {
  id: string;
  name: string;
  email?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  category?: string;
  splitWith: string[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  memberIds: string[]; // NEW FIELD
  createdBy: string;
  createdAt: string;
}

const GROUPS_COLLECTION = 'groups';

// Group operations
export const createGroup = async (groupData: Omit<Group, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, GROUPS_COLLECTION), {
      ...groupData,
      createdAt: Timestamp.now().toDate().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const updateGroup = async (groupId: string, updates: Partial<Group>): Promise<void> => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    await updateDoc(groupRef, updates);
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    await deleteDoc(groupRef);
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

export const getGroup = async (groupId: string): Promise<Group | null> => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (groupSnap.exists()) {
      const groupData = groupSnap.data() as Omit<Group, 'id' | 'members' | 'expenses'>;

      // Fetch members subcollection
      const membersSnapshot = await getDocs(collection(groupRef, 'members'));
      const members: Member[] = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Member[];

      // Fetch expenses subcollection
      const expensesSnapshot = await getDocs(collection(groupRef, 'expenses'));
      const expenses: Expense[] = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];

      return { id: groupSnap.id, ...groupData, members, expenses } as Group;
    }
    return null;
  } catch (error) {
    console.error('Error getting group:', error);
    throw error;
  }
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const q = query(
      collection(db, GROUPS_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const groups: Group[] = [];
    
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() } as Group);
    });
    
    return groups;
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
};

export const subscribeToUserGroups = (
  userId: string, 
  callback: (groups: Group[]) => void
): (() => void) => {
  const q = query(
    collection(db, GROUPS_COLLECTION),
    where('memberIds', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, async (querySnapshot) => {
    const groups: Group[] = [];
    for (const doc of querySnapshot.docs) {
      const groupData = doc.data() as Omit<Group, 'id' | 'members' | 'expenses'>;
      const membersSnapshot = await getDocs(collection(doc.ref, 'members'));
      const members: Member[] = membersSnapshot.docs.map(memberDoc => ({ id: memberDoc.id, ...memberDoc.data() })) as Member[];
      const expensesSnapshot = await getDocs(collection(doc.ref, 'expenses'));
      const expenses: Expense[] = expensesSnapshot.docs.map(expenseDoc => ({ id: expenseDoc.id, ...expenseDoc.data() })) as Expense[];
      groups.push({ id: doc.id, ...groupData, members, expenses } as Group);
    }
    callback(groups);
  }, (error) => {
    console.error('Error in groups subscription:', error);
  });
};

export const subscribeToGroup = (
  groupId: string,
  callback: (group: Group | null) => void
): (() => void) => {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  
  return onSnapshot(groupRef, async (docSnap) => {
    if (docSnap.exists()) {
      const groupData = docSnap.data() as Omit<Group, 'id' | 'members' | 'expenses'>;

      // Fetch members subcollection
      const membersSnapshot = await getDocs(collection(groupRef, 'members'));
      const members: Member[] = membersSnapshot.docs.map(memberDoc => ({ id: memberDoc.id, ...memberDoc.data() })) as Member[];

      // Fetch expenses subcollection
      const expensesSnapshot = await getDocs(collection(groupRef, 'expenses'));
      const expenses: Expense[] = expensesSnapshot.docs.map(expenseDoc => ({ id: expenseDoc.id, ...expenseDoc.data() })) as Expense[];

      callback({ id: docSnap.id, ...groupData, members, expenses } as Group);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in group subscription:', error);
  });
};

// Member operations
export const addMemberToGroup = async (
  groupId: string, 
  member: Omit<Member, 'id'>
): Promise<void> => {
  try {
    const membersCollectionRef = collection(db, GROUPS_COLLECTION, groupId, 'members');
    await addDoc(membersCollectionRef, member);
  } catch (error) {
    console.error('Error adding member to group:', error);
    throw error;
  }
};

export const removeMemberFromGroup = async (
  groupId: string, 
  memberId: string
): Promise<void> => {
  try {
    const memberRef = doc(db, GROUPS_COLLECTION, groupId, 'members', memberId);
    await deleteDoc(memberRef);
  } catch (error) {
    console.error('Error removing member from group:', error);
    throw error;
  }
};

// Expense operations
export const addExpenseToGroup = async (
  groupId: string, 
  expense: Omit<Expense, 'id' | 'createdAt'>
): Promise<void> => {
  try {
    const expensesCollectionRef = collection(db, GROUPS_COLLECTION, groupId, 'expenses');
    await addDoc(expensesCollectionRef, {
      ...expense,
      createdAt: Timestamp.now().toDate().toISOString()
    });
  } catch (error) {
    console.error('Error adding expense to group:', error);
    throw error;
  }
};

export const updateExpenseInGroup = async (
  groupId: string, 
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> => {
  try {
    const expenseRef = doc(db, GROUPS_COLLECTION, groupId, 'expenses', expenseId);
    await updateDoc(expenseRef, updates);
  } catch (error) {
    console.error('Error updating expense in group:', error);
    throw error;
  }
};

export const removeExpenseFromGroup = async (
  groupId: string, 
  expenseId: string
): Promise<void> => {
  try {
    const expenseRef = doc(db, GROUPS_COLLECTION, groupId, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error removing expense from group:', error);
    throw error;
  }
};