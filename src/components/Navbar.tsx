import React, { useState } from 'react';
import {
  Compass,
  PlusCircle,
  FolderArchive,
  Bot,
  Settings as SettingsIcon,
  LogOut,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AppRoute, User } from '../types';

interface NavbarProps {
  activeRoute: AppRoute;
  setActiveRoute: (route: AppRoute) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  pendingRequestsCount: number;
  selectedCampus: string;
  setSelectedCampus: (c: string) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRoute,
  setActiveRoute,
  searchQuery,
  setSearchQuery,
  pendingRequestsCount,
  selectedCampus,
  setSelectedCampus,
  currentUser,
  onLogout,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo -> Redirect to Dashboard */}
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={() => setActiveRoute('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <span className="text-xl">♻️</span>
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-gray-900 leading-none">
                Campus<span className="text-indigo-600">Share</span>
              </div>
              <div className="text-[10px] text-gray-500 font-medium tracking-wide uppercase mt-0.5">
                Rent & Reuse Hub
              </div>
            </div>
          </div>

          {/* Campus Selector Pill (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent border-0 text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="Main Tech Campus">Main Tech Campus</option>
              <option value="North Hostel Zone">North Hostel Zone & Quad</option>
              <option value="Central Library & Tech Hub">Central Library & Tech Hub</option>
              <option value="South Sports Complex">South Sports Complex</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-sm mx-2 relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear, calculators, sports..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 hover:bg-gray-100 focus:bg-white text-xs sm:text-sm text-gray-800 border border-gray-200 focus:border-indigo-500 rounded-xl outline-none transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Links: Dashboard, Upload, Info Vault, CampusBot, Settings */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {/* Dashboard */}
            <button
              onClick={() => setActiveRoute('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeRoute === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Info Vault */}
            <button
              onClick={() => setActiveRoute('vault')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeRoute === 'vault'
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Info Vault</span>
              {pendingRequestsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-extrabold rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Upload (Post Item) */}
            <button
              onClick={() => setActiveRoute('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer ${
                activeRoute === 'upload'
                  ? 'bg-indigo-700 ring-2 ring-indigo-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Gear</span>
            </button>

            {/* CampusBot AI */}
            <button
              onClick={() => setActiveRoute('campusbot')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeRoute === 'campusbot'
                  ? 'bg-purple-50 text-purple-700 font-bold shadow-2xs ring-1 ring-purple-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">CampusBot</span>
            </button>

            {/* Settings & Profile Dropdown */}
            <div className="relative pl-1 border-l border-gray-200 ml-1">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left text-xs leading-tight">
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <span className="truncate max-w-[90px]">{currentUser.name.split(' ')[0]}</span>
                    {currentUser.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {currentUser.isDemo ? 'Demo Mode' : 'Verified'}
                  </div>
                </div>
              </button>

              {/* Profile dropdown menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 text-xs z-50 animate-in fade-in duration-150"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <div className="font-black text-gray-900 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{currentUser.email}</div>
                  </div>

                  <button
                    onClick={() => setActiveRoute('settings')}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => setActiveRoute('vault')}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-gray-500" />
                    <span>My Info Vault</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    onClick={onLogout}
                    className="w-full px-3 py-2 rounded-xl text-left font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, categories..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 text-xs text-gray-800 border border-gray-200 rounded-xl outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
