import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Users, Calculator, X, UserPlus } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  expenses: any[];
  createdAt: string;
}

interface SidebarProps {
  groups: Group[];
  activeGroup: Group | null;
  onSelectGroup: (group: Group) => void;
  onCreateGroup: (groupData: { name: string; description?: string }) => void;
  userId: string;
  onAddMember?: (member: { name: string; email?: string }) => void;
  onRemoveMember?: (memberId: string) => void;
}

export function Sidebar({ 
  groups, 
  activeGroup, 
  onSelectGroup, 
  onCreateGroup, 
  userId,
  onAddMember,
  onRemoveMember
}: SidebarProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    onCreateGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || undefined
    });
    
    setNewGroupName('');
    setNewGroupDesc('');
    setIsGroupDialogOpen(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !onAddMember) return;
    
    onAddMember({
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || undefined
    });
    
    setNewMemberName('');
    setNewMemberEmail('');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Expense Splitter</h1>
            <p className="text-sm text-gray-600">Split bills fairly among friends</p>
          </div>
        </div>
        
        {/* User ID Display */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Your User ID:</p>
          <p className="text-xs font-mono text-gray-800 break-all">
            {userId || 'Loading...'}
          </p>
        </div>
      </div>

      {/* Groups Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">Select Group</Label>
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-1" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a new group to split expenses with your friends and family.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="group-desc">Description (optional)</Label>
                    <Input
                      id="group-desc"
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      placeholder="Describe your group"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">Create Group</Button>
                    <Button type="button" variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-2">
            {groups.map(group => (
              <div
                key={group.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                  activeGroup?.id === group.id 
                    ? 'border-indigo-200 bg-indigo-50 ring-1 ring-indigo-200' 
                    : 'border-gray-200'
                }`}
                onClick={() => onSelectGroup(group)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{group.name}</h3>
                    {group.description && (
                      <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                    )}
                  </div>
                  {activeGroup?.id === group.id && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full ml-2" />
                  )}
                </div>
              </div>
            ))}
            
            {groups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No groups yet</p>
                <p className="text-xs">Create your first group to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Members Section */}
        {activeGroup && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <Label htmlFor="member-name" className="text-sm">Member Name</Label>
                  <Input
                    id="member-name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Member name"
                    className="h-8"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="member-email" className="text-sm">Email (optional)</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="h-8"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Add Member
                </Button>
              </form>

              {/* Members List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeGroup.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => onRemoveMember?.(member.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {activeGroup.members.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <UserPlus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">No members yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}