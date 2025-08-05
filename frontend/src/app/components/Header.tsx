// src/app/components/Header.tsx
import Link from 'next/link';
import React from 'react';

const Header:React.FC = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] px-10 py-3">
              <div className="flex items-center gap-4 text-[#111418]">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#4798ea] to-[#3a7bc8] rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h2 className="text-[#4798ea] text-lg font-bold leading-tight tracking-[-0.015em]">LexiLearn</h2>
              </div>
              <div className="flex flex-1 justify-end gap-8">
                <div className="flex gap-2">
                  <Link
                    href="/student-login"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                  >
                    <span className="truncate">Student Login</span>
                  </Link>
                  
                  <Link href="/teacher-login"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f0f2f4] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                  > 
                    <span className="truncate">Teacher Login </span>
                   </Link >
                    
                  
                    
                  
                </div>
              </div>
    </header>
  );
};
export default Header;