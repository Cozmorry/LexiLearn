"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const StudentNavigationBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirect to localhost:3000
    window.location.href = 'http://localhost:3000';
  };

  return (
    <div className="layout-content-container flex flex-col w-80">
      <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
        <div className="flex flex-col gap-4">
          {/* LexiLearn Logo */}
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#4798ea] to-[#3a7bc8] rounded-xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#4798ea] text-xl font-bold leading-tight">LexiLearn</h1>
              <p className="text-[#637588] text-xs font-medium">Reading & Learning</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Link href="/student-dashboard">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/student-dashboard') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="House" data-size="24px" data-weight="fill">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">Home</p>
              </div>
            </Link>

            <Link href="/student-dashboard/modules">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/student-dashboard/modules') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="BookOpen" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">Modules</p>
              </div>
            </Link>

            <Link href="/student-dashboard/progress">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/student-dashboard/progress') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="ChartBar" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,200H32V40a8,8,0,0,0-16,0V208a8,8,0,0,0,8,8H224a8,8,0,0,0,0-16ZM88,152a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V104a8,8,0,0,1,8-8H80a8,8,0,0,1,8,8Zm48,0a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8h32a8,8,0,0,1,8,8Zm48,0a8,8,0,0,1-8,8H144a8,8,0,0,1-8-8V72a8,8,0,0,1,8-8h32a8,8,0,0,1,8,8Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">Progress</p>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-red-50 text-red-600 w-full"
            >
              <div className="text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"></path>
                </svg>
              </div>
              <p className="text-red-600 text-sm font-medium leading-normal">Logout</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentNavigationBar; 