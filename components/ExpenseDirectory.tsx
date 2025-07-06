
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Receipt, User, Calendar, DollarSign, Trash2 } from 'lucide-react';

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

interface ExpenseDirectoryProps {
  expenses: Expense[];
  members: Member[];
  onDeleteExpense: (expenseId: string) => void;
}

export function ExpenseDirectory({ expenses, members, onDeleteExpense }: ExpenseDirectoryProps) {
  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const recentExpenses = expenses.slice().reverse().slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="h-5 w-5 text-indigo-600 mr-2" />
          Expense Directory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentExpenses.length > 0 ? (
            recentExpenses.map(expense => (
              <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{expense.description}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDeleteExpense(expense.id)}
                        title="Delete Expense"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {getMemberName(expense.paidBy)}
                      </span>
                      <span className="flex items-center font-semibold text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatAmount(expense.amount)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(expense.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>
                        Split with: {expense.splitWith.map(id => getMemberName(id)).join(', ')}
                      </span>
                      {expense.category && (
                        <Badge variant="secondary" className="text-xs">
                          {expense.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No expenses yet. Add your first expense to get started!</p>
            </div>
          )}
        </div>
        
        {expenses.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800">
              View All {expenses.length} Expenses
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}