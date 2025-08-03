import React from 'react';

const ModuleSettingsPage: React.FC = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar */}
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
              <div className="flex flex-col gap-4">
                <h1 className="text-[#111418] text-base font-medium leading-normal">LexiLearn</h1>
                <p className="text-[#111418] text-xs font-medium leading-normal -mt-1">Teacher</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="House" data-size="24px" data-weight="fill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Dashboard</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#f0f2f4]">
                    <div className="text-[#111418]" data-icon="BookOpen" data-size="24px" data-weight="fill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Modules</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="Users" data-size="24px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Students</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="PresentationChart" data-size="24px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Reports</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="Gear" data-size="24px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M128,184a56,56,0,1,0-56-56A56.06,56.06,0,0,0,128,184Zm0-96a40,40,0,1,1-40,40A40,40,0,0,1,128,88Zm91.58,41.12-14.2-5.31a8,8,0,0,0-7.86,2.15l-10.16,12.69a8,8,0,0,1-11.73.73,74.35,74.35,0,0,1-8.1-8.1c-4.24-4.23-8.34-7.49-8.38-7.53a8,8,0,0,1,.73-11.73L128,88a8,8,0,0,0,2.15-7.86L120.88,64.42a8,8,0,0,0-9-4.89A95.3,95.3,0,0,0,90.22,60a8,8,0,0,0-7.46,5l-6.83,12.07a8,8,0,0,1-10.56,3.47,82.51,82.51,0,0,1-12.17-8.72A8,8,0,0,0,49.66,67.59L35.42,53.36a8,8,0,0,0-11.57,1L20,70.72a8,8,0,0,0,1.45,10.52,82.51,82.51,0,0,1-8.72,12.17a8,8,0,0,0,3.47,10.56l12.07,6.83a8,8,0,0,1,5,7.46A95.3,95.3,0,0,0,60,165.78a8,8,0,0,0,5,7.46l12.07,6.83a8,8,0,0,1,3.47,10.56a82.51,82.51,0,0,1-8.72,12.17a8,8,0,0,0,1,11.57L70.72,236a8,8,0,0,0,10.52,1.45a82.51,82.51,0,0,1,12.17-8.72a8,8,0,0,0,10.56,3.47l6.83,12.07a8,8,0,0,0,7.46,5A95.3,95.3,0,0,0,165.78,200a8,8,0,0,0,7.46-5l6.83-12.07a8,8,0,0,1,10.56-3.47a82.51,82.51,0,0,1,12.17,8.72a8,8,0,0,0,11.57-1L236,185.28a8,8,0,0,0-1.45-10.52a82.51,82.51,0,0,1,8.72-12.17a8,8,0,0,0-3.47-10.56Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Settings</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="text-[#111418]" data-icon="ArrowLeft" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-[#111418] text-sm font-medium leading-normal">Logout</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-col gap-4 p-4">
              <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">Module Settings</h1>
              <p className="text-[#637588] text-sm font-normal leading-normal">
                Manage settings for this module.
              </p>
            </div>

            <div className="flex flex-col gap-6 p-4">
              <div className="flex flex-col gap-3">
                <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em]">Module Settings</h2>
                <div className="flex items-center justify-between rounded-xl bg-[#f0f2f4] p-4">
                  <div className="flex flex-col">
                    <p className="text-[#111418] text-base font-medium leading-normal">Student Result Visibility</p>
                    <p className="text-[#637588] text-sm font-normal leading-normal">Allow students to view their results for this module.</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="block bg-[#dce0e5] w-11 h-6 rounded-full peer-checked:bg-[#4798ea] transition"></div>
                      <div className="absolute left-0 top-0 bg-white w-6 h-6 rounded-full transition peer-checked:translate-x-full"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleSettingsPage;