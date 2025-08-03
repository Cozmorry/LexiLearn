import Link from 'next/link';
// import Header from '../app/teacher-dashboard/components/Header'; // Assuming you extract the header to a component
// import Footer from '../app/teacher-dashboard/components/Footer'; // Assuming you extract the footer to a component

const Header:React.FC = () => {
    return (
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] px-10 py-3">
                <div className="flex items-center gap-4 text-[#111418]">
                  <div className="size-4">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_6_330)">
                        <path
                          fillRule='evenodd'
                          clipRule='evenodd'
                          d='M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z'
                          fill='currentColor'
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_6_330">
                          <rect width="48" height="48" fill="white"></rect>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">LexiLearn</h2>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                  <div className="flex items-center gap-9">
                    <a className="text-[#111418] text-sm font-medium leading-normal" href="#">Home</a>
                    <a className="text-[#111418] text-sm font-medium leading-normal" href="#">About</a>
                    <a className="text-[#111418] text-sm font-medium leading-normal" href="#">Contact</a>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/student-login"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      <span className="truncate">Student Login</span>
                    </Link>
                    
                    <Link href="/"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f0f2f4] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                    > 
                      <span className="truncate">Teacher Login</span>
                     </Link >
                      
                    
                      
                    
                  </div>
                </div>
      </header>
    );
  };
  export default Header;