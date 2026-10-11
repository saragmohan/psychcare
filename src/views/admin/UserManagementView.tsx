import React, { useState } from 'react';
import {
  ShieldAlert,
  Crown,
  Search,
  Clock,
  Trash2,
  UserPlus,
  X,
  Building,
  ShieldCheck,
  Mail,
  User as UserIcon,
  Filter,
} from 'lucide-react';
import type { User } from '../../types';
import { storage } from '../../services/storageService';
import { AvatarPickerModal } from '../../components/AvatarPickerModal';

export const UserManagementView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [, setRefreshKey] = useState(0);
  const [selectedUserForAvatar, setSelectedUserForAvatar] = useState<User | null>(null);

  // New Practitioner Provision Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newClinic, setNewClinic] = useState('');
  const [newLicense, setNewLicense] = useState('');
  const [newPlan, setNewPlan] = useState<'trial' | 'premium' | 'free'>('trial');

  const forceRefresh = () => setRefreshKey((prev) => prev + 1);
  const users: User[] = storage.getUsers();

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.clinicName && u.clinicName.toLowerCase().includes(search.toLowerCase()));
    const matchesPlan = filterPlan === 'all' || u.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleGrantPremium = (userId: string) => {
    storage.adminGrantPremium(userId, 365);
    forceRefresh();
  };

  const handleRevokePremium = (userId: string) => {
    storage.adminRevokePremium(userId);
    forceRefresh();
  };

  const handleBanUser = (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this practitioner account? Access will be restricted.')) {
      storage.adminBanUser(userId);
      forceRefresh();
    }
  };

  const handleUnbanUser = (userId: string) => {
    storage.adminUnbanUser(userId);
    forceRefresh();
  };

  const handleExtendTrial = (userId: string) => {
    storage.adminExtendTrial(userId, 3);
    forceRefresh();
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete practitioner "${userName}"?\n\nThis will remove their account and all associated patient records.`
      )
    ) {
      storage.adminDeleteUser(userId);
      forceRefresh();
    }
  };

  const handleCreatePractitionerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      alert('Please fill out practitioner name and email.');
      return;
    }

    storage.adminCreatePractitioner({
      name: newName,
      email: newEmail,
      clinicName: newClinic,
      licenseNumber: newLicense,
      plan: newPlan,
    });

    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewClinic('');
    setNewLicense('');
    setNewPlan('trial');
    forceRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" /> Super Admin Control Console
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            User Management & License Overrides
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grant or revoke premium access, manage 3-day trial extensions, and provision practitioner accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Practitioner</span>
          </button>
        </div>
      </div>

      {/* KPI Filter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setFilterPlan('all');
            setFilterStatus('all');
          }}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterPlan === 'all' && filterStatus === 'all'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">All Accounts</div>
          <div className="text-xl font-black text-white mt-0.5">{users.length}</div>
        </button>

        <button
          onClick={() => {
            setFilterPlan('premium');
            setFilterStatus('all');
          }}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterPlan === 'premium'
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Premium Pro</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">
            {users.filter((u) => u.plan === 'premium').length}
          </div>
        </button>

        <button
          onClick={() => {
            setFilterPlan('trial');
            setFilterStatus('all');
          }}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterPlan === 'trial'
              ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">3-Day Trials</div>
          <div className="text-xl font-black text-indigo-400 mt-0.5">
            {users.filter((u) => u.plan === 'trial').length}
          </div>
        </button>

        <button
          onClick={() => {
            setFilterPlan('all');
            setFilterStatus('banned');
          }}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterStatus === 'banned'
              ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">Suspended</div>
          <div className="text-xl font-black text-rose-400 mt-0.5">
            {users.filter((u) => u.status === 'banned').length}
          </div>
        </button>
      </div>

      {/* Toolbar Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search practitioner name, email, or clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">All Plans & Tiers</option>
            <option value="trial" className="bg-slate-900 text-white">Trialing Users</option>
            <option value="premium" className="bg-slate-900 text-white">Premium Subscribers</option>
            <option value="free" className="bg-slate-900 text-white">Free Tier Users</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">All Account Statuses</option>
            <option value="active" className="bg-slate-900 text-white">Active Only</option>
            <option value="banned" className="bg-slate-900 text-white">Suspended / Banned Only</option>
          </select>
        </div>
      </div>

      {/* MOBILE VIEW: Stacked Responsive Cards */}
      <div className="block md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-slate-500 text-xs">
            No matching users found for this filter criteria.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const trialInfo = storage.getTrialTimeRemaining(user);
            return (
              <div
                key={user.id}
                className={`bg-slate-900 border rounded-3xl p-4 shadow-lg space-y-3 ${
                  user.status === 'banned' ? 'border-red-900/50 bg-red-950/10' : 'border-slate-800'
                }`}
              >
                {/* User Info Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForAvatar(user)}
                      className="cursor-pointer group relative shrink-0"
                      title="Choose avatar character DP"
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 group-hover:ring-amber-500/70 transition shadow-md"
                      />
                    </button>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>
                  </div>

                  {/* Account Status Badge */}
                  {user.status === 'banned' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 shrink-0">
                      BANNED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Plan & Clinic Metadata */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Plan</div>
                    {user.plan === 'premium' ? (
                      <span className="inline-flex items-center gap-1 text-amber-300 font-bold mt-0.5">
                        <Crown className="w-3 h-3 text-amber-400" /> Premium Pro
                      </span>
                    ) : user.plan === 'trial' ? (
                      <span className="inline-flex items-center gap-1 text-indigo-300 font-bold mt-0.5">
                        <Clock className="w-3 h-3 text-indigo-400" /> Trial ({trialInfo.formatted})
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold mt-0.5">Free Tier</span>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Clinic / Practice</div>
                    <div className="text-slate-300 truncate mt-0.5 font-medium">
                      {user.clinicName || 'Private Practice'}
                    </div>
                  </div>
                </div>

                {/* Mobile Admin Action Buttons */}
                {user.role !== 'admin' && (
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">

                    {user.plan === 'premium' ? (
                      <button
                        onClick={() => handleRevokePremium(user.id)}
                        className="min-h-[38px] py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-[11px] flex items-center justify-center text-center cursor-pointer"
                      >
                        Revoke Pro
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGrantPremium(user.id)}
                        className="min-h-[38px] py-2 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-[11px] flex items-center justify-center text-center shadow-md cursor-pointer"
                      >
                        Grant Pro
                      </button>
                    )}

                    <button
                      onClick={() => handleExtendTrial(user.id)}
                      className="min-h-[38px] py-2 px-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded-xl font-bold text-[11px] flex items-center justify-center text-center border border-indigo-800 cursor-pointer"
                    >
                      +3 Days
                    </button>

                    {user.status === 'banned' ? (
                      <button
                        onClick={() => handleUnbanUser(user.id)}
                        className="min-h-[38px] py-2 px-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl font-bold text-[11px] flex items-center justify-center text-center border border-emerald-800 cursor-pointer"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBanUser(user.id)}
                        className="min-h-[38px] py-2 px-2 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl font-bold text-[11px] flex items-center justify-center text-center border border-red-800 cursor-pointer"
                      >
                        Ban
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="min-h-[38px] py-2 px-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl font-bold text-[11px] border border-rose-800/80 flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Full Structured Data Table */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Practitioner / User</th>
              <th className="px-6 py-4">Role & Clinic</th>
              <th className="px-6 py-4">Subscription Plan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredUsers.map((user) => {
              const trialInfo = storage.getTrialTimeRemaining(user);
              return (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    user.status === 'banned' ? 'bg-red-950/15' : ''
                  }`}
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForAvatar(user)}
                      className="cursor-pointer group relative shrink-0"
                      title="Choose avatar character DP"
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 group-hover:ring-amber-500/70 transition shadow-md"
                      />
                    </button>
                    <div>
                      <div className="font-bold text-white text-xs">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200 capitalize">{user.role}</div>
                    <div className="text-[11px] text-slate-500">{user.clinicName || 'Private Practice'}</div>
                  </td>

                  <td className="px-6 py-4">
                    {user.plan === 'premium' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[11px]">
                        <Crown className="w-3 h-3 text-amber-400" /> PREMIUM PRO
                      </span>
                    ) : user.plan === 'trial' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-bold border border-indigo-800 text-[11px]">
                        <Clock className="w-3 h-3 text-indigo-400" /> Trial ({trialInfo.formatted})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold text-[11px]">
                        FREE TIER
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {user.status === 'banned' ? (
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 font-bold border border-red-500/40 text-[11px]">
                        BANNED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {user.role !== 'admin' && (
                      <div className="inline-flex items-center justify-end gap-2">
                        {user.plan === 'premium' ? (
                          <button
                            onClick={() => handleRevokePremium(user.id)}
                            className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-[11px] inline-flex items-center justify-center transition-all cursor-pointer"
                          >
                            Revoke Pro
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGrantPremium(user.id)}
                            className="h-8 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-[11px] inline-flex items-center justify-center transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            Grant Pro
                          </button>
                        )}

                        <button
                          onClick={() => handleExtendTrial(user.id)}
                          className="h-8 px-3 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded-xl font-semibold text-[11px] border border-indigo-800 inline-flex items-center justify-center transition-all cursor-pointer"
                        >
                          +3 Days Trial
                        </button>

                        {user.status === 'banned' ? (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            className="h-8 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl font-semibold text-[11px] border border-emerald-800 inline-flex items-center justify-center transition-all cursor-pointer"
                          >
                            Unban User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="h-8 px-3 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl font-semibold text-[11px] border border-red-800 inline-flex items-center justify-center transition-all cursor-pointer"
                          >
                            Ban Account
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="h-8 px-3 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded-xl font-semibold text-[11px] border border-rose-800/80 inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          title="Permanently Delete Practitioner Account"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Provision New Practitioner Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-white space-y-4 my-auto max-h-[90vh] overflow-y-auto cursor-default relative"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" /> Provision New Practitioner Account
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePractitionerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Practitioner Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Dr. Eleanor Vance, PsyD"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="doctor@practice.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Clinic / Hospital</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="North Shore Clinical Therapy"
                      value={newClinic}
                      onChange={(e) => setNewClinic(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">License Number</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="PSY-77291"
                      value={newLicense}
                      onChange={(e) => setNewLicense(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial License Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  <option value="trial">3-Day Full Access Trial</option>
                  <option value="premium">⭐ Premium Pro (Unlimited)</option>
                  <option value="free">Basic / Free Tier</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition text-center"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={Boolean(selectedUserForAvatar)}
        onClose={() => setSelectedUserForAvatar(null)}
        currentAvatarUrl={selectedUserForAvatar?.avatarUrl || ''}
        userName={selectedUserForAvatar?.name || ''}
        onSelectAvatar={(avatarUrl) => {
          if (selectedUserForAvatar) {
            storage.updateUserAvatar(selectedUserForAvatar.id, avatarUrl);
            forceRefresh();
            setSelectedUserForAvatar(null);
          }
        }}
      />
    </div>
  );
};
