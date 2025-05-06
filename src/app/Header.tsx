"use client"
import { auth } from '@/lib/firebase/client';
import { Bars3Icon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState } from 'react';

export default function AdminHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const onMenuToggle = async()=>{

  }

  const onLogout = async()=>{
    await auth.signOut();
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
              className="mr-4 inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <button
              type="button"
              className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Notifications"
            >
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-label="User menu"
                aria-expanded={showDropdown}
              >
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin User</span>
                <Image
                  className="h-8 w-8 rounded-full"
                  src="https://randomuser.me/api/portraits/women/32.jpg"
                  alt="User profile"
                  width={32}
                  height={32}
                  unoptimized
                />
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
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
    </header>
  );
}