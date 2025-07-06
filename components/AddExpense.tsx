import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { PlusCircle } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email?: string;
}

interface Expense {
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  category?: string;
  splitWith: string[];
}

interface AddExpenseProps {
  members: Member[];
  onAddExpense: (expense: Expense) => void;
}

export function AddExpense({ members, onAddExpense }: AddExpenseProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('');
  const [splitWith, setSplitWith] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !amount || !paidBy || splitWith.length === 0) {
      return;
    }

    onAddExpense({
      description: description.trim(),
      amount: parseFloat(amount),
      date,
      paidBy,
      category: category || undefined,
      splitWith
    });

    // Reset form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaidBy('');
    setCategory('');
    setSplitWith([]);
  };

  const handleClearForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaidBy('');
    setCategory('');
    setSplitWith([]);
  };

  const handleSplitWithChange = (memberId: string, checked: boolean) => {
    if (checked) {
      setSplitWith([...splitWith, memberId]);
    } else {
      setSplitWith(splitWith.filter(id => id !== memberId));
    }
  };

  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlusCircle className="h-5 w-5 text-indigo-600 mr-2" />
            Add Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Add members first</p>
            <p className="text-xs">You need at least one member to add expenses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="h-5 w-5 text-indigo-600 mr-2" />
          Add Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paid-by">Paid By</Label>
              <Select value={paidBy} onValueChange={setPaidBy} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">🍽️ Food</SelectItem>
                  <SelectItem value="Accommodation">🏠 Accommodation</SelectItem>
                  <SelectItem value="Transportation">🚗 Transportation</SelectItem>
                  <SelectItem value="Entertainment">🎉 Entertainment</SelectItem>
                  <SelectItem value="Utilities">💡 Utilities</SelectItem>
                  <SelectItem value="Other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Split With</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-32 overflow-y-auto mt-2">
              {members.map(member => (
                <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={splitWith.includes(member.id)}
                    onCheckedChange={(checked) => handleSplitWithChange(member.id, checked as boolean)}
                  />
                  <span className="text-sm text-gray-700">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Add Expense
            </Button>
            <Button type="button" variant="outline" onClick={handleClearForm} className="flex-1">
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}