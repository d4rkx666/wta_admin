import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function AdminHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <button
              type="button"
              className="mr-4 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <span className="text-blue-600 text-lg font-bold">Welcome</span>
                <span className="text-red-600 text-lg font-bold">Travel</span>
                <span className="text-blue-600 text-lg font-bold">Accommodation</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="relative">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Admin User</span>
                <Image
                  className="h-8 w-8 rounded-full"
                  src="https://randomuser.me/api/portraits/women/32.jpg"
                  alt="User profile"
                  width={32}
                  height={32}
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}