import React from 'react';
import NavigationBar from '../components/NavigationBar'; 

const TeacherReportsPage: React.FC = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar */}
          <NavigationBar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Reports</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 px-4 py-3">
              <button className="px-4 py-2 rounded-md bg-[#f0f2f4] text-[#111418] text-sm font-medium">
                Student Reports
              </button>
              <button className="px-4 py-2 rounded-md text-[#111418] text-sm font-medium">
                Class Reports
              </button>
            </div>

            {/* Student Progress Section */}
            <div className="px-4 py-3">
              <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Student Progress</h2>
              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label htmlFor="student-select" className="text-[#111418] text-sm font-medium leading-normal mb-1">Select Student</label>
                  <select id="student-select" className="px-3 py-2 rounded-md border border-[#dce0e5] focus:outline-none focus:ring-2 focus:ring-[#4798ea]">
                    <option>Select Student</option>
                    {/* Add student options here */}
                  </select>
                </div>
                <div className="flex flex-col flex-1">
                  <label htmlFor="module-select" className="text-[#111418] text-sm font-medium leading-normal mb-1">Select Module</label>
                  <select id="module-select" className="px-3 py-2 rounded-md border border-[#dce0e5] focus:outline-none focus:ring-2 focus:ring-[#4798ea]">
                    <option>Select Module</option>
                    {/* Add module options here */}
                  </select>
                </div>
              </div>
            </div>

            {/* Performance Over Time Section (Placeholder for Graph) */}
            <div className="px-4 py-3">
              <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Performance Over Time</h2>
              <div className="h-64 bg-[#f0f2f4] rounded-xl flex items-center justify-center text-[#637588]">
                Graph Placeholder
              </div>
            </div>

            {/* Module Completion Rates Section (Placeholder for Bar Charts) */}
            <div className="px-4 py-3">
              <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Module Completion Rates</h2>
              <div className="h-64 bg-[#f0f2f4] rounded-xl flex items-center justify-center text-[#637588]">
                Bar Charts Placeholder
              </div>
            </div>

            {/* Quiz Scores Table */}
            <div className="px-4 py-3 @container">
              <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Quiz Scores</h2>
              <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                        Quiz Name
                      </th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Score</th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Add quiz score rows here */}
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Quiz 1: Phonics Basics
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">90%</td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        2023-10-27
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dce0e5]">
                      <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                        Quiz 2: Sight Words
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">85%</td>
                      <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                        2023-10-29
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
};

export default TeacherReportsPage;