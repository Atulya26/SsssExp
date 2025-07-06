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
  members: Member[];
  expenses: Expense[];
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
      return { id: groupSnap.id, ...groupSnap.data() } as Group;
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
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() } as Group);
    });
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
  
  return onSnapshot(groupRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Group);
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
    const group = await getGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const newMember: Member = {
      id: Date.now().toString(),
      ...member
    };
    
    const updatedMembers = [...group.members, newMember];
    await updateGroup(groupId, { members: updatedMembers });
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
    const group = await getGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const updatedMembers = group.members.filter(m => m.id !== memberId);
    await updateGroup(groupId, { members: updatedMembers });
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
    const group = await getGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...expense
    };
    
    const updatedExpenses = [...group.expenses, newExpense];
    await updateGroup(groupId, { expenses: updatedExpenses });
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
    const group = await getGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const expenseIndex = group.expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) throw new Error('Expense not found');
    
    const updatedExpenses = [...group.expenses];
    updatedExpenses[expenseIndex] = { ...updatedExpenses[expenseIndex], ...updates };
    
    await updateGroup(groupId, { expenses: updatedExpenses });
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
    const group = await getGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const updatedExpenses = group.expenses.filter(e => e.id !== expenseId);
    await updateGroup(groupId, { expenses: updatedExpenses });
  } catch (error) {
    console.error('Error removing expense from group:', error);
    throw error;
  }
};