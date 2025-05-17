"use client"
import { auth } from '@/lib/firebase/client';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { logout_user } from '@/hooks/logout';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthProvider';

export default function AdminHeader() {
  const {email, name} = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [toggleMenu, setToggleMenu] = useState("hidden");
  const router = useRouter()
  
  const onMenuToggle = async()=>{
    
    setToggleMenu(toggleMenu == "hidden" ? "" : "hidden");
  }

  const onLogout = async()=>{
    setShowDropdown(false);
    await auth.signOut();
    const r = await logout_user();
    const data = await r.json();
    if(data.success){
      router.refresh();
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Brand and menu toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onMenuToggle}
              className="md:hidden mr-4 inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle menu"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-1">
                <span className="text-blue-600 text-lg font-bold hidden sm:inline">Welcome</span>
                <span className="text-red-600 text-lg font-bold hidden sm:inline">Travel</span>
                <span className="text-blue-600 text-lg font-bold hidden sm:inline">Accommodation</span>
                <span className="text-blue-600 text-lg font-bold sm:hidden">WTA</span>
              </div>
            </div>
          </div>

          {/* Right side - Navigation and user menu */}
          <div className="flex items-center space-x-4">

            {/* Notification bell */}
            {/*<button
              type="button"
              className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Notifications"
            >
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>*/}

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-label="User menu"
                aria-expanded={showDropdown}
              >
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin User</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{email}</p>
                  </div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    System Preferences
                  </a>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Sidebar className={`${toggleMenu} md:hidden`}/>
    </header>
  );
}