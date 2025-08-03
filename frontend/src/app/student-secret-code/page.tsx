import Image from "next/image";
// import { Inter } from "@next/font/google";
import styles from "./page.module.css";
import Link from "next/link";
import Header from "../components/Header"; // Reused Header Component
import Footer from "../components/Footer"; // Reused Footer Component

// const inter = Inter({ subsets: ["latin"] });

export default function StudentSecretCode() {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold mb-4">Hi, Alex!</div>
          <div className="text-xl mb-8">Enter your Secret Code</div>

          <div className="flex space-x-2 mb-8">
            <input type="text" className="w-12 h-12 text-center border rounded-md text-2xl" maxLength={1} />
            <input type="text" className="w-12 h-12 text-center border rounded-md text-2xl" maxLength={1} />
            <input type="text" className="w-12 h-12 text-center border rounded-md text-2xl" maxLength={1} />
            <input type="text" className="w-12 h-12 text-center border rounded-md text-2xl" maxLength={1} />
            <input type="text" className="w-12 h-12 text-center border rounded-md text-2xl" maxLength={1} />
            <input type="text" className="w-12 h-12 text-center border rounded-md text-2xl" maxLength={1} />
          </div>
          <Link href="/student-dashboard">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded">
            Log In
          </button>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}