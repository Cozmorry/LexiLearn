import React from 'react';

const EditModulePage: React.FC = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            {/* Sidebar - Similar to other teacher dashboard pages */}
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
              <div className="flex flex-col gap-4">
                <h1 className="text-[#111418] text-base font-medium leading-normal">ReadRight</h1>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="House" data-size="24px" data-weight="fill">
                      {/* SVG for Home */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Dashboard</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="Users" data-size="24px" data-weight="regular">
                      {/* SVG for Students */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Students</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 bg-[#f0f2f4] rounded-xl">
                    <div className="text-[#111418]" data-icon="BookOpen" data-size="24px" data-weight="fill">
                      {/* SVG for Modules */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Modules</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="PresentationChart" data-size="24px" data-weight="regular">
                      {/* SVG for Reports */}
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
                      {/* SVG for Settings */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M213.66,101.65l-19.45-5.27a.34.34,0,0,0-.11-.07s0,0,0,0A8,8,0,0,0,188,92l-8.33-15.37A8,8,0,0,0,166.7,72.1L151.35,79.3a.63.63,0,0,0-.1.07l-19.46-5.27a8,8,0,0,0-9.33,0L103,79.3a.63.63,0,0,0-.1-.07L87.63,72.1A8,8,0,0,0,77.3,76.63L69,92a8,8,0,0,0,4.21,10.31l-19.45,5.27a.34.34,0,0,0-.11.07s0,0,0,0A8,8,0,0,0,40,116v24a8,8,0,0,0,4.21,7.08l19.45,5.27a.34.34,0,0,0,.11.07s0,0,0,0A8,8,0,0,0,69,164l8.33,15.37a8,8,0,0,0,10.33,4.53L103,176.7a.63.63,0,0,0,.1-.07l19.46,5.27a8,8,0,0,0,9.33,0L151.37,176.7a.63.63,0,0,0,.1-.07l15.32,7.2a8,8,0,0,0,10.33-4.53L188,164a8,8,0,0,0-4.21-10.31l19.45-5.27a.34.34,0,0,0,.11-.07s0,0,0,0A8,8,0,0,0,216,140V116A8,8,0,0,0,213.66,101.65ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"
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
                    {/* SVG for Logout */}
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
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Edit Module</p> {/* Title can change based on action */}
            </div>

            <div className="flex gap-4 px-4 pt-3 pb-4 border-b border-[#dce0e5]">
              <button className="px-4 py-2 text-sm font-medium leading-normal border-b-2 border-[#4798ea] text-[#111418]">Content</button>
              <button className="px-4 py-2 text-sm font-medium leading-normal text-[#637588]">Settings</button>
              <button className="px-4 py-2 text-sm font-medium leading-normal text-[#637588]">Preview</button>
              {/* Add Quizzes tab here if needed */}
            </div>
            {/* Content Tab Content */}
            <div className="flex flex-col gap-5 p-4">
              <div className="flex flex-col gap-3">
                <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em]">Content Generation</h2>
                <textarea
                  className="flex w-full min-h-[120px] items-center rounded-xl border border-[#dce0e5] px-4 py-2 text-[#111418] text-sm font-normal leading-normal placeholder:text-[#637588] focus:border-[#4798ea] focus:outline-none"
                  placeholder="Enter keywords or a brief description to generate content."
                ></textarea>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Generate Content</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em]">Add Files</h2>
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#dce0e5] p-6">
                  <div className="text-[#637588]" data-icon="UploadSimple" data-size="32px" data-weight="regular">
                    {/* SVG for Upload Simple */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M144,120V56a8,8,0,0,0-16,0v64a8,8,0,0,0,16,0Zm-8,40a8,8,0,0,1-8-8V56a8,8,0,0,0-16,0v96a8,8,0,0,1-8,8,16,16,0,0,0-16,16v8a8,8,0,0,0,16,0v-8a.12.12,0,0,1,.06-.11l19.94-10a8,8,0,0,0,6.34,0l19.94,10a.12.12,0,0,1,.06.11v8a8,8,0,0,0,16,0v-8A16,16,0,0,0,136,160ZM232,120c-1.2,29.22-5.44,57.52-12.3,73.12A24,24,0,0,1,198.86,208H57.14A24,24,0,0,1,36.3,193.12C29.44,177.52,25.2,149.22,24,120a8,8,0,0,1,16,0c1.18,26.41,5.08,52.78,11.2,66.88A8,8,0,0,0,57.14,192h141.72a8,8,0,0,0,5.94-4.88C214.92,172.78,218.82,146.41,220,120A8,8,0,0,1,232,120Z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-[#111418] text-sm font-medium leading-normal">Drag and drop files here</p>
                  <p className="text-[#637588] text-sm font-normal leading-normal">or</p>
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-white text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] border border-[#dce0e5]"
                  >
                    <span className="truncate">Browse Files</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em]">Text Editor</h2>
                <textarea
                  className="flex w-full min-h-[200px] items-center rounded-xl border border-[#dce0e5] px-4 py-2 text-[#111418] text-sm font-normal leading-normal placeholder:text-[#637588] focus:border-[#4798ea] focus:outline-none"
                  placeholder="Edit module content here..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em]">Quizzes</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[#111418] text-lg font-semibold leading-normal">Generate Quiz with AI</h3>
                    <textarea
                      className="flex w-full min-h-[80px] items-center rounded-xl border border-[#dce0e5] px-4 py-2 text-[#111418] text-sm font-normal leading-normal placeholder:text-[#637588] focus:border-[#4798ea] focus:outline-none"
                      placeholder="Enter prompts or keywords for quiz generation."
                    ></textarea>
                    <button
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      <span className="truncate">Generate Quiz</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[#111418] text-lg font-semibold leading-normal">Create Quiz Manually</h3>
                    {/* You might want to add a button or link here to navigate to a manual quiz creation page */}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em]">Quiz Editor</h2>
                <textarea
                  className="flex w-full min-h-[200px] items-center rounded-xl border border-[#dce0e5] px-4 py-2 text-[#111418] text-sm font-normal leading-normal placeholder:text-[#637588] focus:border-[#4798ea] focus:outline-none"
                  placeholder="Edit quiz content here..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-4">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModulePage;