import {
   ChartBarIcon,
   UserGroupIcon,
   CurrencyDollarIcon,
   HomeModernIcon,
   CreditCardIcon,
   BuildingOfficeIcon,
 } from '@heroicons/react/24/outline';
 
 export default function Dashboard() {
   const stats = [
     { id: 1, name: 'Total Properties', value: '24', icon: HomeModernIcon },
     { id: 2, name: 'Active Tenants', value: '78', icon: UserGroupIcon },
     { id: 3, name: 'Monthly Revenue', value: '$12,345', icon: CurrencyDollarIcon },
     { id: 4, name: 'Occupancy Rate', value: '82%', icon: ChartBarIcon },
   ];
 
   const recentActivities = [
     { id: 1, tenant: 'John Smith', action: 'Payment received', amount: '$850', time: '2h ago' },
     { id: 2, tenant: 'Sarah Johnson', action: 'New booking', amount: '$1,200', time: '5h ago' },
     { id: 3, tenant: 'Michael Brown', action: 'Contract renewal', amount: '', time: '1d ago' },
     { id: 4, tenant: 'Emma Davis', action: 'Maintenance request', amount: '', time: '1d ago' },
     { id: 5, tenant: 'Robert Wilson', action: 'Payment received', amount: '$750', time: '2d ago' },
   ];
 
   return (
     <div className="space-y-6">
       <div className="pb-4 border-b border-gray-200">
         <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
         <p className="mt-1 text-sm text-gray-500">
           Welcome back! Here&apos;s what&apos;s happening with your properties today.
         </p>
       </div>
 
       {/* Stats */}
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
         {stats.map((stat) => (
           <div
             key={stat.id}
             className="bg-white overflow-hidden shadow rounded-lg"
           >
             <div className="p-5">
               <div className="flex items-center">
                 <div className="flex-shrink-0">
                   <stat.icon className="h-6 w-6 text-indigo-500" aria-hidden="true" />
                 </div>
                 <div className="ml-5 w-0 flex-1">
                   <dl>
                     <dt className="text-sm font-medium text-gray-500 truncate">
                       {stat.name}
                     </dt>
                     <dd>
                       <div className="text-lg font-medium text-gray-900">
                         {stat.value}
                       </div>
                     </dd>
                   </dl>
                 </div>
               </div>
             </div>
           </div>
         ))}
       </div>
 
       {/* Recent Activity */}
       <div className="bg-white shadow rounded-lg overflow-hidden">
         <div className="px-5 py-4 border-b border-gray-200">
           <h3 className="text-lg font-medium leading-6 text-gray-900">
             Recent Activity
           </h3>
         </div>
         <div className="divide-y divide-gray-200">
           {recentActivities.map((activity) => (
             <div key={activity.id} className="px-5 py-4">
               <div className="flex items-center">
                 <div className="min-w-0 flex-1">
                   <div className="flex justify-between">
                     <p className="text-sm font-medium text-indigo-600 truncate">
                       {activity.tenant}
                     </p>
                     {activity.amount && (
                       <p className="text-sm text-gray-500 ml-2">
                         {activity.amount}
                       </p>
                     )}
                   </div>
                   <p className="text-sm text-gray-500">
                     {activity.action} · <time dateTime={activity.time}>{activity.time}</time>
                   </p>
                 </div>
               </div>
             </div>
           ))}
         </div>
         <div className="bg-gray-50 px-5 py-3">
           <div className="text-sm">
             <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
               View all activity
             </a>
           </div>
         </div>
       </div>
 
       {/* Quick Actions */}
       <div className="bg-white shadow rounded-lg overflow-hidden">
         <div className="px-5 py-4 border-b border-gray-200">
           <h3 className="text-lg font-medium leading-6 text-gray-900">
             Quick Actions
           </h3>
         </div>
         <div className="px-5 py-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
           <a
             href="/admin/tenants/add"
             className="group block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
           >
             <div className="flex items-center">
               <div className="bg-indigo-100 p-2 rounded-md">
                 <UserGroupIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
               </div>
               <div className="ml-4">
                 <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                   Add New Tenant
                 </h4>
                 <p className="text-xs text-gray-500">
                   Register a new tenant and assign property
                 </p>
               </div>
             </div>
           </a>
           <a
             href="/admin/bills/management"
             className="group block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
           >
             <div className="flex items-center">
               <div className="bg-indigo-100 p-2 rounded-md">
                 <CreditCardIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
               </div>
               <div className="ml-4">
                 <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                   Manage Bills
                 </h4>
                 <p className="text-xs text-gray-500">
                   View and process property bills
                 </p>
               </div>
             </div>
           </a>
           <a
             href="/admin/properties/management"
             className="group block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
           >
             <div className="flex items-center">
               <div className="bg-indigo-100 p-2 rounded-md">
                 <BuildingOfficeIcon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
               </div>
               <div className="ml-4">
                 <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                   Manage Properties
                 </h4>
                 <p className="text-xs text-gray-500">
                   Update property details and availability
                 </p>
               </div>
             </div>
           </a>
         </div>
       </div>
     </div>
   );
 }