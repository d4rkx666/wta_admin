"use client"

import { useLivePayments } from '@/hooks/useLivePayments';
import { useLiveTenants } from '@/hooks/useLiveTenants';
import { useRoom } from '@/hooks/useRoom';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { Timestamp } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import Loader from './components/common/Loader';
import { useLiveContracts } from '@/hooks/useLiveContracts';
import { Contract } from '@/types/contract';
import ModalConfirmation from './components/common/ModalConfirmation';
import { set_permanent_contract } from '@/hooks/setPermanentContract';
import { useNotification } from './context/NotificationContext';

export default function Dashboard() {

  // variables
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | undefined>(undefined);
  const { showNotification } = useNotification();

  // DB
  const { data: tenants, loading: loadingTenants } = useLiveTenants();
  const { data: contracts, loading: loadingContracts } = useLiveContracts();
  const { data: rooms, loading: loadingRooms } = useRoom();
  const { data: payments, loading: loadingPayments } = useLivePayments()

  //eslint-disable-next-line
  function timeAgo(date: any) {
    if (!date) return;
    const currentDate = date as Timestamp;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - currentDate.toDate().getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  }

  const activeTenants: number = useMemo(() => {
    return contracts.filter(tenant => new Date((tenant.lease_start as Timestamp).toDate()) <= new Date(Date.now()) && new Date((tenant.lease_end as Timestamp).toDate()) > new Date(Date.now())).length
  }, [tenants])

  const occupancyRate: string = useMemo(() => {
    const occupiedRooms = rooms.filter(room => room.available === false).length;
    return ((occupiedRooms / rooms.length) * 100).toFixed(2) + " %";
  }, [rooms])

  const monthlyRevenue: string = useMemo(() => {
    return rooms.reduce((revenue, room) => revenue + (!room.available ? room.price : 0), 0).toFixed(2);
  }, [rooms])

  const stats = [
    { id: 1, name: 'Total Rooms', value: rooms.length, icon: HomeModernIcon },
    { id: 2, name: 'Active Tenants', value: activeTenants, icon: UserGroupIcon },
    { id: 3, name: 'Monthly Revenue', value: '$ ' + monthlyRevenue, icon: CurrencyDollarIcon },
    { id: 4, name: 'Occupancy Rate', value: occupancyRate, icon: ChartBarIcon },
  ];

  const activities = useMemo(() => {
    return payments.filter(payment => payment.paidDate && payment.status === "Marked").sort((a, b) => {
      const dateA = (a.paidDate as Timestamp).toDate();
      const dateB = (b.paidDate as Timestamp).toDate();
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 5)
  }, [payments])


  const makePermanentContract = async()=>{
    setIsLoading(true);
    if(currentContract){
      try{
        const data = await set_permanent_contract(currentContract);
        const resp = await data.json();

        if(resp.success){
          setIsModalConfirmOpen(false)
          showNotification("success", "The tenant contract status changed correctly. From now, this tenant will have a permanent contract (month-to-month).")
        }else{
          showNotification("error", "Something went wrong. Please try again.")
        }
      }catch{

      }finally{
        setIsLoading(false)
      }
    }
  }

  if (loadingTenants || loadingRooms || loadingPayments || loadingContracts) {
    return <Loader />
  }

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
          {activities.map((activity) => {
            const c = contracts.find(contract => contract.id === activity.contract_id);
            if (!c) return;
            const tenant = tenants.find(tenant => tenant.id === c.tenant_id);
            return (
              <div key={activity.id} className="px-5 py-4">
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {tenant?.name}
                      </p>
                      {activity.amount_paid && (
                        <p className="text-sm text-gray-500 ml-2">
                          {activity.amount_paid}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {activity.status} · {timeAgo(activity.paidDate)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
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
            href="/tenants/management"
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
            href="/bills/management"
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
            href="/properties/management"
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Rents expiring in 2 month
          </h3>
        </div>
        <div className="px-5 py-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lease start
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lease end
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Months contract left
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.length > 0 ? (
                    contracts.filter(c=> (c.lease_end as Timestamp).toDate().getMonth() - new Date().getMonth() <= 2 && c.status === "Active").map((contract) => {
                      const tenant = tenants.find(t=> t.id === contract.tenant_id);
                      const monthsLeft = (contract.lease_end as Timestamp).toDate().getMonth() - new Date().getMonth();
                      return (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {tenant?.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">{(contract.lease_start as Timestamp).toDate().toDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">{(contract.lease_end as Timestamp).toDate().toDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">{monthsLeft}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={()=>{
                              setCurrentContract(contract);
                              setIsModalConfirmOpen(true);
                              }} className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer">Make Permanent Contract</button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No bills found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalConfirmOpen && (
        <ModalConfirmation
            isOpen={isModalConfirmOpen}
            setIsOpen={setIsModalConfirmOpen}
            onConfirm={makePermanentContract}
            isLoading={isLoading}
            title="Confirm Action"
            message="Are you sure you want to proceed with a permanent contract for the user?"
            confirmText="Proceed"
            isDangerous={false}
        />
      )}
    </div>
  );
}