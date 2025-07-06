
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calculator } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  category?: string;
  splitWith: string[];
  createdAt: string;
}

interface BalancesProps {
  members: Member[];
  expenses: Expense[];
}

interface Balance {
  id: string;
  name: string;
  balance: number;
}

export function Balances({ members, expenses }: BalancesProps) {
  const calculateBalances = (): Balance[] => {
    const balances: { [key: string]: number } = {};
    
    // Initialize balances
    members.forEach(member => {
      balances[member.id] = 0;
    });
    
    // Calculate balances from expenses
    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const splitWith = expense.splitWith || [];
      const amountPerPerson = expense.amount / splitWith.length;
      
      // Person who paid gets credited
      balances[paidBy] += expense.amount;
      
      // People who split pay their share
      splitWith.forEach(memberId => {
        balances[memberId] -= amountPerPerson;
      });
    });
    
    // Convert to array format
    return members.map(member => ({
      id: member.id,
      name: member.name,
      balance: balances[member.id] || 0
    })).sort((a, b) => b.balance - a.balance);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const balances = calculateBalances();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 text-indigo-600 mr-2" />
          Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {balances.length > 0 ? (
            balances.map(balance => (
              <div key={balance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-gray-700">
                      {balance.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{balance.name}</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(balance.balance)}
                  </span>
                  <p className="text-xs text-gray-500">
                    {balance.balance >= 0 ? 'gets back' : 'owes'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No balances yet</p>
              <p className="text-xs">Add expenses to see balances</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}