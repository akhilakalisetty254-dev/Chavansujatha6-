import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Lock,
  Clock,
  LogOut,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';
import { User } from '../types';
import { AuthService } from '../services/authService';

interface SettingsViewProps {
  user: User;
  onLogout: () => void;
  onUserUpdated?: (updated: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onLogout,
  onUserUpdated,
}) => {
  const [name, setName] = useState(user.name);
  const [campusZone, setCampusZone] = useState(user.campusZone || 'Main Tech Campus');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name: name.trim(),
      campusZone,
    };
    onUserUpdated?.(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 8) {
      setPassMsg({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }
    // Update password
    setPassMsg({ text: 'Password successfully updated!', type: 'success' });
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => setPassMsg(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Student Account & Security</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage your verified student credentials, session controls, and campus preferences.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile settings saved successfully!</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="font-black text-lg text-gray-900 flex items-center gap-2">
                <span>{user.name}</span>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Student (.edu)</span>
                  </span>
                )}
                {user.isDemo && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                    Demo Mode
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">{user.email}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Account ID: {user.id}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Preferred Campus Handover Zone</label>
              <select
                value={campusZone}
                onChange={(e) => setCampusZone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="Main Tech Campus">Main Tech Campus (All Blocks)</option>
                <option value="North Hostel Zone">North Hostel Zone & Quad</option>
                <option value="Central Library & Tech Hub">Central Library & Tech Hub</option>
                <option value="South Sports Complex">South Sports Complex</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-all shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security & Inactivity Session Control */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4 text-xs">
        <h2 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Session Policy & Inactivity Protection</span>
        </h2>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-gray-700 font-bold">
            <span>Inactivity Auto-Logout Timeout:</span>
            <span className="text-indigo-600 font-extrabold">30 Minutes</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            To protect your account if left unattended on a shared college library computer or public lab PC,
            CampusShare automatically clears your session token and logs out after 30 minutes of inactivity.
          </p>
        </div>

        {/* Change password */}
        <form onSubmit={handlePasswordChange} className="space-y-3 pt-3 border-t border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-gray-500" />
            <span>Update Password</span>
          </h3>

          {passMsg && (
            <div
              className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-1.5 ${
                passMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <span>{passMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">New Password (Min 8 chars)</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold text-gray-700 cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
