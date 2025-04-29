'use client';

import { useRouter } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();

  return (
    <section className="relative bg-blue-600 text-white py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-red-600 opacity-90"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Find Your Perfect Room in Vancouver</h1>
          <p className="text-xl mb-8">Premium room rentals in the heart of BC. Comfort, convenience, and community.</p>

          <div className="bg-white rounded-lg shadow-xl p-4 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-gray-800 text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Vancouver, BC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-800 text-sm font-medium mb-1">Move-in Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition self-end">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}