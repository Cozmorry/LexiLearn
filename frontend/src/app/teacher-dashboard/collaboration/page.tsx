import React from 'react';
import NavigationBar from '../components/NavigationBar'; 


const CollaborationRequestsPage: React.FC = () => {
  // Dummy data for demonstration
  const incomingRequests = [
    { teacher: 'Mr. Smith', module: 'Module 2: Sight Words Mastery', status: 'Pending' },
    { teacher: 'Ms. Davis', module: 'Module 4: Spelling Strategies', status: 'Accepted' },
  ];

  const outgoingRequests = [
    { teacher: 'Ms. Brown', module: 'Module 1: Phonics Fundamentals', status: 'Pending' },
    { teacher: 'Mr. Green', module: 'Module 3: Reading Comprehension', status: 'Rejected' },
  ];

  const teachers = ['Mr. Smith', 'Ms. Davis', 'Ms. Brown', 'Mr. Green'];
  const modules = [
    'Module 1: Phonics Fundamentals',
    'Module 2: Sight Words Mastery',
    'Module 3: Reading Comprehension',
    'Module 4: Spelling Strategies',
    'Module 5: Advanced Reading Skills',
  ];

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar (Placeholder - replace with actual sidebar component if available) */}
          <NavigationBar />

          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Collaboration Requests</p>
            </div>

            {/* Incoming Requests */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Incoming Requests</h2>
            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-3 text-left text-[#111418] w-[200px] text-sm font-medium leading-normal">Teacher</th>
                      <th className="px-4 py-3 text-left text-[#111418] w-[300px] text-sm font-medium leading-normal">Module</th>
                      <th className="px-4 py-3 text-left text-[#111418] w-[150px] text-sm font-medium leading-normal">Status</th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingRequests.map((request, index) => (
                      <tr key={index} className="border-t border-t-[#dce0e5]">
                        <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">{request.teacher}</td>
                        <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">{request.module}</td>
                        <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">{request.status}</td>
                        <td className="h-[72px] px-4 py-2">
                          {request.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button className="text-[#4798ea] text-sm font-medium leading-normal">Accept</button>
                              <button className="text-[#e5484d] text-sm font-medium leading-normal">Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Outgoing Requests */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Outgoing Requests</h2>
            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-3 text-left text-[#111418] w-[200px] text-sm font-medium leading-normal">Teacher</th>
                      <th className="px-4 py-3 text-left text-[#111418] w-[300px] text-sm font-medium leading-normal">Module</th>
                      <th className="px-4 py-3 text-left text-[#111418] w-[150px] text-sm font-medium leading-normal">Status</th>
                      <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outgoingRequests.map((request, index) => (
                      <tr key={index} className="border-t border-t-[#dce0e5]">
                        <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">{request.teacher}</td>
                        <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">{request.module}</td>
                        <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">{request.status}</td>
                        <td className="h-[72px] px-4 py-2">
                           {request.status === 'Pending' && (
                            <button className="text-[#e5484d] text-sm font-medium leading-normal">Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Request Collaboration */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Request Collaboration</h2>
            <div className="flex flex-col gap-4 p-4 border rounded-xl border-[#dce0e5]">
                <div className="flex flex-col gap-2">
                    <label htmlFor="teacher" className="text-[#111418] text-sm font-medium leading-normal">Select Teacher</label>
                    <select id="teacher" className="h-10 px-3 text-[#111418] text-sm font-normal leading-normal rounded-xl border border-[#dce0e5]">
                        <option value="">-- Select a Teacher --</option>
                        {teachers.map((teacher, index) => (
                            <option key={index} value={teacher}>{teacher}</option>
                        ))}
                    </select>
                </div>
                 <div className="flex flex-col gap-2">
                    <label htmlFor="module" className="text-[#111418] text-sm font-medium leading-normal">Select Module</label>
                    <select id="module" className="h-10 px-3 text-[#111418] text-sm font-normal leading-normal rounded-xl border border-[#dce0e5]">
                        <option value="">-- Select a Module --</option>
                        {modules.map((module, index) => (
                            <option key={index} value={module}>{module}</option>
                        ))}
                    </select>
                </div>
                 <button className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Send Request</span>
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationRequestsPage;