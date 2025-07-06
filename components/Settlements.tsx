import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowRight, HandCoins } from 'lucide-react';

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

interface SettlementsProps {
  members: Member[];
  expenses: Expense[];
}

interface Balance {
  id: string;
  name: string;
  balance: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function Settlements({ members, expenses }: SettlementsProps) {
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
    }));
  };

  const calculateSettlements = (balances: Balance[]): Settlement[] => {
    const settlements: Settlement[] = [];
    const positiveBalances = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const negativeBalances = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
    
    // Create copies to avoid mutating original data
    const positiveBalancesCopy = positiveBalances.map(b => ({ ...b }));
    const negativeBalancesCopy = negativeBalances.map(b => ({ ...b }));
    
    let posIndex = 0;
    let negIndex = 0;
    
    while (posIndex < positiveBalancesCopy.length && negIndex < negativeBalancesCopy.length) {
      const positive = positiveBalancesCopy[posIndex];
      const negative = negativeBalancesCopy[negIndex];
      
      const amount = Math.min(positive.balance, Math.abs(negative.balance));
      
      if (amount > 0.01) { // Only create settlement if amount is significant
        settlements.push({
          from: negative.name,
          to: positive.name,
          amount: amount
        });
      }
      
      positive.balance -= amount;
      negative.balance += amount;
      
      if (Math.abs(positive.balance) < 0.01) posIndex++;
      if (Math.abs(negative.balance) < 0.01) negIndex++;
    }
    
    return settlements;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const balances = calculateBalances();
  const settlements = calculateSettlements(balances);

  // Check if all settled
  const allSettled = balances.every(balance => Math.abs(balance.balance) < 0.01);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HandCoins className="h-5 w-5 text-indigo-600 mr-2" />
          Suggested Settlements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {allSettled ? (
            <div className="text-center py-8 text-gray-500">
              <HandCoins className="h-12 w-12 mx-auto mb-3 text-green-300" />
              <p className="text-sm text-green-600 font-medium">All settled up! 🎉</p>
              <p className="text-xs text-gray-500">Everyone's balances are even</p>
            </div>
          ) : settlements.length > 0 ? (
            settlements.map((settlement, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">{settlement.from}</span> pays{' '}
                      <span className="font-medium">{settlement.to}</span>
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {formatAmount(settlement.amount)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HandCoins className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No settlements needed</p>
              <p className="text-xs">Add expenses to see settlements</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}