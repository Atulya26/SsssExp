import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AddExpense } from './components/AddExpense';
import { ExpenseDirectory } from './components/ExpenseDirectory';
import { Balances } from './components/Balances';
import { Settlements } from './components/Settlements';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Calculator, Receipt, Users, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Firebase imports
import { onAuthStateChange, signInAnonymous } from './src/firebase/auth';
import { 
  createGroup, 
  subscribeToUserGroups, 
  subscribeToGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  addExpenseToGroup,
  removeExpenseFromGroup,
  Group,
  Member,
  Expense,
  getGroup
} from './src/firebase/firestore';

// Local interfaces for Sidebar compatibility
interface SidebarGroup {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  memberIds: string[]; // NEW FIELD
  expenses: Expense[];
  createdAt: string;
}

export default function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        try {
          await signInAnonymous();
        } catch (error) {
          console.error('Authentication failed:', error);
          setError('Failed to authenticate. Please refresh the page.');
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Subscribe to user's groups
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserGroups(userId, (userGroups) => {
      setGroups(userGroups);
      
      // Set active group if none is selected and groups exist
      if (!activeGroup && userGroups.length > 0) {
        setActiveGroup(userGroups[0]);
      }
      
      // Update active group if it exists in the new groups list
      if (activeGroup) {
        const updatedActiveGroup = userGroups.find(g => g.id === activeGroup.id);
        if (updatedActiveGroup) {
          setActiveGroup(updatedActiveGroup);
        } else if (userGroups.length > 0) {
          setActiveGroup(userGroups[0]);
        } else {
          setActiveGroup(null);
        }
      }
    });

    return unsubscribe;
  }, [userId]);

  // Subscribe to active group updates
  useEffect(() => {
    if (!activeGroup) return;

    const unsubscribe = subscribeToGroup(activeGroup.id, (updatedGroup) => {
      if (updatedGroup) {
        setActiveGroup(updatedGroup);
      }
    });

    return unsubscribe;
  }, [activeGroup?.id]);

  const handleCreateGroup = async (groupData: { name: string; description?: string }) => {
    if (!userId) return;
    
    try {
      const newGroupData: Omit<Group, 'id'> = {
        name: groupData.name,
        description: groupData.description,
        members: [{ id: userId, name: 'You', email: '' }],
        memberIds: [userId], // NEW FIELD
        expenses: [],
        createdBy: userId,
        createdAt: new Date().toISOString()
      };
      const newGroupId = await createGroup(newGroupData);
      toast.success('Group created successfully!');
      // Fetch the new group and set as active
      const newGroup = await getGroup(newGroupId);
      if (newGroup) setActiveGroup(newGroup);
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group. Please try again.');
    }
  };

  const handleSelectGroup = (group: SidebarGroup) => {
    // Convert SidebarGroup to Group by adding createdBy field
    const fullGroup: Group = {
      ...group,
      createdBy: userId || ''
    };
    setActiveGroup(fullGroup);
  };

  const handleAddMember = async (member: { name: string; email?: string }) => {
    if (!activeGroup) return;
    
    try {
      await addMemberToGroup(activeGroup.id, member);
      toast.success('Member added successfully!');
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error('Failed to add member. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeGroup) return;
    
    try {
      await removeMemberFromGroup(activeGroup.id, memberId);
      toast.success('Member removed successfully!');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member. Please try again.');
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!activeGroup) return;
    
    try {
      await addExpenseToGroup(activeGroup.id, expense);
      toast.success('Expense added successfully!');
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast.error('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!activeGroup) return;
    
    try {
      await removeExpenseFromGroup(activeGroup.id, expenseId);
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense. Please try again.');
    }
  };

  const getGroupStats = () => {
    if (!activeGroup) return { totalExpenses: 0, memberCount: 0, expenseCount: 0, averageExpense: 0 };
    
    const totalExpenses = activeGroup.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const memberCount = activeGroup.members.length;
    const expenseCount = activeGroup.expenses.length;
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    
    return { totalExpenses, memberCount, expenseCount, averageExpense };
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your expense groups...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Calculator className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getGroupStats();

  // Welcome state - no active group
  if (!activeGroup) {
    return (
      <div className="h-screen flex bg-gray-50">
        <Sidebar 
          groups={groups}
          activeGroup={activeGroup}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={handleCreateGroup}
          userId={userId || ''}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Expense Splitter</h2>
            <p className="text-gray-600 mb-6">Create or select a group to start splitting expenses with your friends.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar 
        groups={groups}
        activeGroup={activeGroup}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        userId={userId || ''}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />
      
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activeGroup.name}</h1>
              {activeGroup.description && (
                <p className="text-gray-600 mt-1">{activeGroup.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalExpenses.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Members</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.memberCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Receipt className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expenses</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.expenseCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{stats.averageExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <Calculator className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-xl font-semibold text-gray-900">Live</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 overflow-y-auto h-[calc(100%-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <AddExpense 
                members={activeGroup.members}
                onAddExpense={handleAddExpense}
              />
              <ExpenseDirectory 
                expenses={activeGroup.expenses}
                members={activeGroup.members}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <Balances 
                members={activeGroup.members}
                expenses={activeGroup.expenses}
              />
              <Settlements 
                members={activeGroup.members}
                expenses={activeGroup.expenses}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}