import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { FamilyMember, UserRole } from '../../types';
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  Baby,
  Edit2,
  Trash2,
  Globe,
  Palette,
  Calendar,
  X,
  Check,
} from 'lucide-react';

const PRESET_MEMBER_COLORS = [
  '#FF4FA3', // Pink
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Rose
  '#3B82F6', // Blue
  '#F97316', // Orange
];

export const FamilyView: React.FC = () => {
  const { family, members, addMember, updateMember, removeMember, updateHousehold } = useFamily();
  const { user } = useAuth();

  // Household settings edit state
  const [isEditingHousehold, setIsEditingHousehold] = useState(false);
  const [householdName, setHouseholdName] = useState(family?.name || '');
  const [householdTimezone, setHouseholdTimezone] = useState(family?.timezone || 'UTC');

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<UserRole>('adult');
  const [memberColor, setMemberColor] = useState('#FF4FA3');
  const [memberBirthday, setMemberBirthday] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberRole('adult');
    setMemberColor(PRESET_MEMBER_COLORS[members.length % PRESET_MEMBER_COLORS.length]);
    setMemberBirthday('');
    setError(null);
    setIsMemberModalOpen(true);
  };

  const openEditModal = (m: FamilyMember) => {
    setEditingMember(m);
    setMemberName(m.name);
    setMemberRole(m.role);
    setMemberColor(m.color || '#FF4FA3');
    setMemberBirthday(m.birthday || '');
    setError(null);
    setIsMemberModalOpen(true);
  };

  const handleSaveHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) return;
    await updateHousehold({ name: householdName.trim(), timezone: householdTimezone });
    setIsEditingHousehold(false);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      setError('Member name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingMember) {
        await updateMember(editingMember.id, {
          name: memberName.trim(),
          role: memberRole,
          color: memberColor,
          birthday: memberBirthday || null,
        });
      } else {
        await addMember({
          name: memberName.trim(),
          role: memberRole,
          color: memberColor,
          birthday: memberBirthday || null,
        });
      }
      setIsMemberModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the household?`)) {
      try {
        await removeMember(id);
      } catch (err: any) {
        alert(err?.message || 'Failed to remove member.');
      }
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return <Shield className="w-4 h-4 text-[#FF4FA3]" />;
      case 'child':
        return <Baby className="w-4 h-4 text-cyan-400" />;
      default:
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div id="family-view-container" className="flex flex-col flex-1 max-w-5xl mx-auto w-full space-y-6">
      {/* Household Profile Card */}
      <div className="p-6 rounded-3xl bg-[#121620] border border-[#242C3D] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FF4FA3]" />
            <h2 className="text-2xl font-bold text-white tracking-tight font-serif">
              {family?.name || 'My Family'}
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-gray-500" /> Timezone: {family?.timezone || 'UTC'}
            <span>•</span>
            <span>{members.length} Household {members.length === 1 ? 'Member' : 'Members'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditingHousehold ? (
            <form onSubmit={handleSaveHousehold} className="flex items-center gap-2">
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="bg-[#1A202C] border border-[#242C3D] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#FF4FA3] text-white hover:bg-[#e63e90] cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingHousehold(false)}
                className="p-2 rounded-xl bg-[#1A202C] text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setHouseholdName(family?.name || '');
                setHouseholdTimezone(family?.timezone || 'UTC');
                setIsEditingHousehold(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#1A202C] hover:bg-[#242C3D] text-gray-300 text-xs font-semibold border border-[#242C3D] transition-colors cursor-pointer"
            >
              Edit Household
            </button>
          )}

          <button
            id="add-family-member-btn"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold transition-all shadow-md shadow-[#FF4FA3]/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const isCurrentUser = member.user_id === user?.id;

          return (
            <div
              key={member.id}
              id={`member-card-${member.id}`}
              className="p-5 rounded-3xl bg-[#121620] border border-[#242C3D] hover:border-[#242C3D]/90 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md relative"
                    style={{ backgroundColor: member.color || '#FF4FA3' }}
                  >
                    {member.name.slice(0, 1).toUpperCase()}
                    {isCurrentUser && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#121620]" title="You" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      {member.name}
                      {isCurrentUser && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          You
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 capitalize mt-0.5">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1.5 rounded-xl hover:bg-[#1A202C] text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Member"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {members.length > 1 && !isCurrentUser && (
                    <button
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Member details */}
              <div className="pt-3 border-t border-[#242C3D]/60 space-y-1.5 text-xs text-gray-400">
                {member.birthday ? (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-[#FF4FA3]" /> Birthday:
                    </span>
                    <span className="font-mono text-gray-200">{member.birthday}</span>
                  </div>
                ) : (
                  <div className="text-gray-600 text-[11px]">No birthday registered</div>
                )}
                {member.user_email && (
                  <div className="text-[11px] text-gray-500 truncate font-mono">
                    {member.user_email}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Edit / Add Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#121620] border border-[#242C3D] rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#242C3D]">
              <h3 className="text-base font-bold text-white">
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 rounded-xl hover:bg-[#1A202C] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Robin, Sophie, Leo..."
                  className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Family Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as UserRole)}
                  className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                >
                  <option value="adult">Adult</option>
                  <option value="administrator">Administrator</option>
                  <option value="child">Child</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-[#FF4FA3]" /> Member Accent Color
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {PRESET_MEMBER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMemberColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                        memberColor === c
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121620] scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FF4FA3]" /> Birthday (Optional)
                </label>
                <input
                  type="date"
                  value={memberBirthday}
                  onChange={(e) => setMemberBirthday(e.target.value)}
                  className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#242C3D]">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A202C] hover:bg-[#242C3D] text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold shadow-md shadow-[#FF4FA3]/25"
                >
                  {isSubmitting ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
