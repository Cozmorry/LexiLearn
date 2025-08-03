"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavigationBar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="layout-content-container flex flex-col w-80">
      <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#111418] text-base font-medium leading-normal">ReadRight</h1>
          <div className="flex flex-col gap-2">
            <Link href="/teacher-dashboard">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/teacher-dashboard') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="House" data-size="24px" data-weight="fill">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">Home</p>
              </div>
            </Link>

            <Link href="/teacher-dashboard/students">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/teacher-dashboard/students') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="Users" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">My Students</p>
              </div>
            </Link>

            <Link href="/teacher-dashboard/modules">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/teacher-dashboard/modules') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="BookOpen" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">Modules</p>
              </div>
            </Link>

            <Link href="/teacher-dashboard/assignments">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/teacher-dashboard/assignments') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="ClipboardText" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,40H176V24a8,8,0,0,0-16,0V40H96V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V72a8,8,0,0,0,16,0V56h64V72a8,8,0,0,0,16,0V56h40V216H40ZM88,144a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,144Zm0,32a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,176Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">Assignments</p>
              </div>
            </Link>

            <Link href="/teacher-dashboard/reports">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/teacher-dashboard/reports') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="PresentationChart" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">Reports</p>
              </div>
            </Link>

            <Link href="/teacher-dashboard/settings">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/teacher-dashboard/settings') ? 'bg-[#f0f2f4]' : 'hover:bg-[#f8f9fa]'
              }`}>
                <div className="text-[#111418]" data-icon="Gear" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,184a56,56,0,1,0-56-56A56.06,56.06,0,0,0,128,184Zm0-96a40,40,0,1,1-40,40A40,40,0,0,1,128,88Zm90.58,35.15-13.2-6.33a8,8,0,0,0-8.33,2.31,73.32,73.32,0,0,1-11,11.07,8,8,0,0,0-1.94,8.4l4.17,12.77a8,8,0,0,1-10.47,10.47l-12.77-4.17a8,8,0,0,0-8.4,1.94,73.32,73.32,0,0,1-11.07,11,8,8,0,0,0-2.31,8.33l6.33,13.2A8,8,0,0,1,160,216a8,8,0,0,1-3.34-.72l-13.2-6.33a8,8,0,0,0-8.33,2.31,73.32,73.32,0,0,1-11.07,11,8,8,0,0,0-8.4,1.94l-12.77,4.17a8,8,0,0,1-10.47-10.47l4.17-12.77a8,8,0,0,0-1.94-8.4,73.32,73.32,0,0,1-11-11.07,8,8,0,0,0-8.33-2.31l-13.2,6.33A8,8,0,0,1,32,160a8,8,0,0,1,.72-3.34l6.33-13.2a8,8,0,0,0-2.31-8.33,73.32,73.32,0,0,1-11.07-11,8,8,0,0,0-1.94-8.4l-4.17-12.77a8,8,0,0,1,10.47-10.47l12.77,4.17a8,8,0,0,0,8.4-1.94,73.32,73.32,0,0,1,11.07-11,8,8,0,0,0,2.31-8.33l-6.33-13.2A8,8,0,0,1,96,40a8,8,0,0,1,3.34.72l13.2,6.33a8,8,0,0,0,8.33-2.31,73.32,73.32,0,0,1,11.07-11,8,8,0,0,0,8.4-1.94l12.77-4.17a8,8,0,0,1,10.47,10.47l-4.17,12.77a8,8,0,0,0,1.94,8.4,73.32,73.32,0,0,1,11,11.07,8,8,0,0,0,2.31,8.33Z"></path>
                  </svg>
                </div>
                <p className="text-[#111418] text-sm font-medium leading-normal">Settings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
