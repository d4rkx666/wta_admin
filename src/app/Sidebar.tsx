'use client'
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      current: pathname === '/',
    },
    {
      name: 'Tenant Control',
      icon: UsersIcon,
      current: pathname.startsWith('/tenants'),
      children: [
        { name: 'Add New Tenant', href: '/tenants/add' },
        { name: 'Payments Done', href: '/tenants/payments' },
        { name: 'Tenant Profiles', href: '/tenants/profiles' },
      ],
    },
    {
      name: 'Bills Management',
      icon: CreditCardIcon,
      current: pathname.startsWith('/bills'),
      children: [
        { name: 'Bills Overview', href: '/bills' },
        { name: 'Tenant Bills', href: '/bills/tenant-bills' },
      ],
    },
    {
      name: 'Property & Rooms',
      icon: BuildingOfficeIcon,
      current: pathname.startsWith('/property'),
      children: [
        { name: 'Property Management', href: '/property' },
        { name: 'Room Management', href: '/property/room' },
      ],
    },
  ];

  const toggleItem = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const isItemExpanded = (name: string) => {
    return expandedItems[name] ?? pathname.startsWith(`/${name.toLowerCase().split(' ')[0]}`);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <div key={item.name}>
                <div
                  onClick={() => item.children && toggleItem(item.name)}
                  className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
                    item.current
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        item.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.href ? (
                      <Link href={item.href} className="flex-grow">
                        {item.name}
                      </Link>
                    ) : (
                      <span className="flex-grow">{item.name}</span>
                    )}
                  </div>
                  {item.children && (
                    isItemExpanded(item.name) ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )
                  )}
                </div>
                {item.children && isItemExpanded(item.name) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`block px-2 py-1 text-sm rounded-md ${
                          pathname === child.href
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <Link
            href="/admin/settings"
            className="group block w-full flex-shrink-0"
          >
            <div className="flex items-center">
              <div>
                <Cog6ToothIcon
                  className="h-5 w-5 text-gray-500 group-hover:text-gray-700"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Settings
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}