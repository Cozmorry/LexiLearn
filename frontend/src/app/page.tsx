"use client";

import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className='@container'>
              <div className='@[480px]:p-4'>
                <div
                  className='flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4'
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(/kidsreading.png)',
                  }}
                >
                  <div className='flex flex-col gap-2 text-center'>
                    <h1
                      className='text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]'
                      style={{textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'}}
                    >
                      Empowering Young Minds with LexiLearn
                    </h1>
                    <h2 className='text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal'>
                      LexiLearn is a specialized web application designed to support children with dyslexia in enhancing their reading, spelling, and comprehension skills. Our
                      engaging and interactive platform offers tailored learning experiences for both students and educators.
                    </h2>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/student-login">
                      <button
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#4798ea] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors duration-200"
                      >
                        <span className="truncate">Student Login</span>
                      </button>
                    </Link>
                    <Link href="/teacher-login">
                      <button
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#f0f2f4] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#e1e5e9] transition-colors duration-200"
                      >
                        <span className="truncate">Teacher Login</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
