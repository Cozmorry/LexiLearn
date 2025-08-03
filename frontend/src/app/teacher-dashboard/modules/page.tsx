import React from 'react';
import NavigationBar from '../components/NavigationBar'; 

const ModulesPage: React.FC = () => {
  // Dummy data for modules
  const modules = [
    { id: 1, title: 'Reading Fundamentals', description: 'Basic reading skills', access: 'Public' },
    { id: 2, title: 'Spelling Strategies', description: 'Common spelling rules and tips', access: 'Private' },
    { id: 3, title: 'Comprehension Skills', description: 'Improving understanding of text', access: 'Public' },
  ];

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            {/* Sidebar - Replicated from teacher dashboard */}
            <NavigationBar />
          </div>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">Modules</h2>
                <button className="flex items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em]">
                  New Module
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-[#dce0e5] overflow-hidden">
                <input
                  type="text"
                  placeholder="Search modules..."
                  className="flex-1 px-4 py-2 text-sm font-normal leading-normal focus:outline-none"
                />
                <div className="text-[#111418] px-3" data-icon="MagnifyingGlass" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M232.49,215.51L185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.08,68.08,0,0,1,44,112Z"></path>
                  </svg>
                </div>
              </div>

              <div className="@container">
                <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                  <table className="flex-1">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal w-1/4">Title</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal w-1/2">Description</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal w-1/6">Access</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal w-1/12">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((module) => (
                        <tr key={module.id} className="border-t border-t-[#dce0e5]">
                          <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                            {module.title}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                            {module.description}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                            {module.access}
                          </td>
                          <td className="h-[72px] px-4 py-2">
                            <button className="text-[#4798ea] text-sm font-medium leading-normal">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;