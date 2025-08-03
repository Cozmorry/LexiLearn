// src/app/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className='flex justify-center'>
              <div className="flex max-w-[960px] flex-1 flex-col">
                <div className="flex flex-col gap-6 px-5 py-10 text-center @container">
                  <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                    <a className="text-[#637588] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
                    <a className="text-[#637588] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
                    <a className="text-[#637588] text-base font-normal leading-normal min-w-40" href="#">Contact Us</a>
                  </div>
                  <p className="text-[#637588] text-base font-normal leading-normal">@2025 LexiLearn. All rights reserved.</p>
                </div>
              </div>
    </footer>
  );
};

export default Footer;