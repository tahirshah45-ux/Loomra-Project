import React, { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useAdminState } from '../../AdminContext';
import type { TeamMember } from '../../types/admin.types';

const TeamSettings: React.FC = () => {
  const { team, addTeamMember, updateTeamMember, deleteTeamMember } = useAdminState();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    role: 'Manager',
    status: 'Active',
    permissions: []
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      alert('Please fill in all required fields.');
      return;
    }

    const member: TeamMember = {
      id: `team-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role as any,
      status: newMember.status as any,
      permissions: newMember.permissions || [],
      profilePicture: ''
    };

    addTeamMember(member);
    setNewMember({ name: '', email: '', role: 'Manager', status: 'Active', permissions: [] });
    setIsAddingMember(false);
    alert('Team member added successfully!');
  };

  const roleOptions = ['Admin', 'Manager', 'Support', 'Editor'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1c1b1b]">Team Members</h3>
          <p className="text-sm text-neutral-500 mt-1">Manage admin users and their access permissions.</p>
        </div>
        <button
          onClick={() => setIsAddingMember(!isAddingMember)}
          className="inline-flex items-center gap-2 rounded-full bg-[#b30400] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300]"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {isAddingMember && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[#1c1b1b]">Name</label>
              <input
                type="text"
                value={newMember.name || ''}
                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="John Doe"
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1b1b]">Email</label>
              <input
                type="email"
                value={newMember.email || ''}
                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="john@example.com"
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1b1b]">Role</label>
              <select
                value={newMember.role || 'Manager'}
                onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1c1b1b]">Status</label>
              <select
                value={newMember.status || 'Active'}
                onChange={e => setNewMember({ ...newMember, status: e.target.value as any })}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b30400]/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              onClick={handleAddMember}
              className="inline-flex items-center gap-2 rounded-full bg-[#b30400] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300]"
            >
              <Save size={16} />
              Add Member
            </button>
            <button
              onClick={() => setIsAddingMember(false)}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#1c1b1b] transition hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {team.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <p className="text-sm">No team members added yet.</p>
            </div>
          ) : (
            team.map(member => (
              <div key={member.id} className="flex items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4">
                <div className="flex-1">
                  <p className="font-semibold text-[#1c1b1b]">{member.name}</p>
                  <div className="mt-1 flex gap-2 text-xs text-neutral-500">
                    <span>{member.email}</span>
                    <span>•</span>
                    <span>{member.role}</span>
                    <span>•</span>
                    <span className={member.status === 'Active' ? 'text-emerald-600 font-semibold' : 'text-neutral-500'}>
                      {member.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${member.name}?`)) {
                      deleteTeamMember(member.id);
                    }
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:text-black"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;
