"use client";

import React from 'react';
import NavigationBar from '../teacher-dashboard/components/NavigationBar'; 
import Link from 'next/link';

export default function TeacherDashboardPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <NavigationBar/>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Teacher Command Center</p>
            </div>
            
            {/* Summary Statistics Cards */}
            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5]">
                <p className="text-[#111418] text-base font-medium leading-normal">Total Students</p>
                <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">25</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5]">
                <p className="text-[#111418] text-base font-medium leading-normal">Modules Completed</p>
                <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">150</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5]">
                <p className="text-[#111418] text-base font-medium leading-normal">Average Score</p>
                <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">85%</p>
              </div>
            </div>

            {/* Secret Code Section */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Secret Codes</h2>
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Grade</th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                        Secret Code
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Ethan Harper
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">3rd</td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal font-mono">
                        ABC123XYZ
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Olivia Bennett
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">2nd</td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal font-mono">
                        DEF456UVW
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Noah Carter
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">1st</td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal font-mono">
                        GHI789RST
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Ava Mitchell
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">3rd</td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal font-mono">
                        JKL012MNO
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Liam Foster
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">2nd</td>
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal font-mono">
                        PQR345LMN
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Section */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Recent Activity</h2>
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Module</th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Ethan Harper
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#4798ea] text-sm font-normal leading-normal">
                        <Link href="#" className="hover:underline">Module 3: Reading</Link>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        <div className="flex items-center gap-2">
                          <span>92</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        2024-03-15
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Olivia Bennett
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#4798ea] text-sm font-normal leading-normal">
                        <Link href="#" className="hover:underline">Module 2: Spelling</Link>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        <div className="flex items-center gap-2">
                          <span>78</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        2024-03-14
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Noah Carter
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#4798ea] text-sm font-normal leading-normal">
                        <Link href="#" className="hover:underline">Module 1: Comprehension</Link>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        <div className="flex items-center gap-2">
                          <span>88</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '88%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        2024-03-13
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Ava Mitchell
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#4798ea] text-sm font-normal leading-normal">
                        <Link href="#" className="hover:underline">Module 3: Reading</Link>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        <div className="flex items-center gap-2">
                          <span>95</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        2024-03-12
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Liam Foster
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#4798ea] text-sm font-normal leading-normal">
                        <Link href="#" className="hover:underline">Module 2: Spelling</Link>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        <div className="flex items-center gap-2">
                          <span>80</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        2024-03-11
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}