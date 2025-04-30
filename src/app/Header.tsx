'use client'
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <div className="flex items-center">
            <span className="text-blue-600 text-lg font-bold">Welcome</span>
            <span className="text-red-600 text-lg font-bold">Travel</span>
            <span className="text-blue-600 text-lg font-bold">Accommodation</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-800 hover:text-blue-600 font-medium transition">Home</Link>
          <Link href="/about" className="text-gray-800 hover:text-blue-600 font-medium transition">About</Link>
          <Link href="/login" className="text-gray-800 hover:text-blue-600 font-medium transition">Login</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;