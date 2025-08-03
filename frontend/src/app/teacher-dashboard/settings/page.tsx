"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '../components/NavigationBar';
import { authAPI, tokenUtils } from '../../../services/api';

const TeacherSettingsPage: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authAPI.logout();
      tokenUtils.removeToken();
      localStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      tokenUtils.removeToken();
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar */}
          <NavigationBar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Settings</p>
            </div>

            {/* Account Settings */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Account</h2>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-2">
                <label className="text-[#111418] text-sm font-medium leading-normal">Name</label>
                <input type="text" className="border border-[#dce0e5] rounded-xl px-3 py-2 text-[#111418] text-sm font-normal leading-normal" placeholder="Your Name" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#111418] text-sm font-medium leading-normal">Email</label>
                <input type="email" className="border border-[#dce0e5] rounded-xl px-3 py-2 text-[#111418] text-sm font-normal leading-normal" placeholder="your.email@example.com" />
              </div>
              <button className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors">
                Change Password
              </button>
            </div>

            {/* Notifications */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Notifications</h2>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[#111418] text-sm font-medium leading-normal">Email Notifications</p>
                {/* Basic Toggle Placeholder */}
                <div className="w-10 h-6 bg-gray-300 rounded-full flex items-center p-1 duration-300 ease-in-out">
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-0"></div>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Authentication</h2>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[#111418] text-sm font-medium leading-normal">Sign in with Google</p>
                 {/* Basic Toggle Placeholder */}
                 <div className="w-10 h-6 bg-gray-300 rounded-full flex items-center p-1 duration-300 ease-in-out">
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-0"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#111418] text-sm font-medium leading-normal">Sign in with Microsoft</p>
                 {/* Basic Toggle Placeholder */}
                 <div className="w-10 h-6 bg-gray-300 rounded-full flex items-center p-1 duration-300 ease-in-out">
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-0"></div>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Session</h2>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between p-4 border border-[#dde0e4] rounded-xl">
                <div>
                  <p className="text-[#111418] text-sm font-medium leading-normal">Sign Out</p>
                  <p className="text-[#637588] text-xs">Sign out of your account</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      Signing out...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Help & Support */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Help & Support</h2>
            <div className="flex flex-col gap-4 p-4">
              <a href="#" className="text-[#4798ea] text-sm font-medium leading-normal hover:text-[#3a7bc8] transition-colors">Help Center</a>
              <a href="#" className="text-[#4798ea] text-sm font-medium leading-normal hover:text-[#3a7bc8] transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettingsPage;