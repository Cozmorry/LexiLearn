"use client";

import React, { useState } from 'react';
import NavigationBar from '../components/NavigationBar';

const TeacherAssignmentsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <NavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Assignments</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-white gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
                aria-label="Create new assignment"
              >
                <div className="text-white" data-icon="Plus" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </div>
                <span className="truncate">Create Assignment</span>
              </button>
            </div>

            <div className="p-4">
              <div className="bg-white rounded-2xl shadow-lg border border-[#dde0e4] p-8 text-center">
                <div className="text-[#637588] mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-[#111418] text-lg font-semibold mb-2">No assignments yet</h3>
                <p className="text-[#637588] mb-6">Create your first assignment to get started.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors"
                >
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#111418]">Create Assignment</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#637588] hover:text-[#111418]"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">Assignment Type</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 text-[#111418]"
                  aria-label="Select assignment type"
                >
                  <option value="">Select type</option>
                  <option value="module">Module</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-[#637588] text-[#111418]"
                  placeholder="Enter assignment title"
                  aria-label="Assignment title"
                />
              </div>

              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full h-24 px-4 py-3 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-[#637588] text-[#111418] resize-none"
                  placeholder="Enter assignment description"
                  aria-label="Assignment description"
                />
              </div>

              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 text-[#111418]"
                  aria-label="Assignment due date"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-[#dde0e4] text-[#111418] rounded-xl hover:bg-[#f8f9fa] transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors">
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentsPage; 