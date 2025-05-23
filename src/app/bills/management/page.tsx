'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Bill, BillDefaultVal } from '@/types/bill';
import { useLiveProperties } from '@/hooks/useLiveProperties';
import Loader from '@/app/components/common/Loader';
import { CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/app/context/NotificationContext';
import { set_bill } from '@/hooks/setBill';
import { useVariable } from '@/hooks/useVariables';
import { useLiveBills } from '@/hooks/useLiveBills';
import { useLiveTenants } from '@/hooks/useLiveTenants';
import { useRoom } from '@/hooks/useRoom';
import AsignBills from '@/app/components/common/AsignBillsToTenants';
import { Payment } from '@/types/payment';
import { Tenant } from '@/types/tenant';
import { useLivePayments } from '@/hooks/useLivePayments';

const BillsManagement = () => {
   const { showNotification } = useNotification();
   const { listBillTypes } = useVariable({ type: "bills" });
   const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('all');
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [filterProperty, setFilterProperty] = useState<string>('all');
   const [isLoading, setIsLoading] = useState(false);
   const [currentBill, setCurrentBill] = useState<Bill>(BillDefaultVal);
   const [splitEvenly, setSplitEvenly] = useState(true);
   const [splitTenants, setSplitTenants] = useState<{tenant: Partial<Tenant>; payment: Partial<Payment> }[]>([]);

   const { data: properties, loading: loadingProperties } = useLiveProperties(); // Get Properties
   const { data: bills, loading: loadingBills } = useLiveBills(); // Get Bills
   const { data: tenants, loading: loadingTenants } = useLiveTenants(); // Get Tenants
   const { data: rooms, loading: loadingRooms } = useRoom(); // Get Rooms
   const { data: paymentTenantBills, loading: loadingPaymentTenantBills } = useLivePayments(); // Get Rooms

   // Filter bills based on active tab and property filter
   const filteredBills = bills.filter(bill => {
      // Filter by status
      if (activeTab === 'unpaid' && bill.status !== "Pending") return false;
      if (activeTab === 'paid' && bill.status !== 'Paid') return false;

      // Filter by property
      if (filterProperty !== 'all' && bill.propertyId !== filterProperty) return false;

      return true;
   });

   const handlePaymentAmountChange = (id: string, value: number) => {
      const newAmount = Number(value.toFixed(2));
      const newSplit = splitTenants.map((split, i) =>{
         if(splitTenants[i].tenant.id === id){
            splitTenants[i].payment.amount_payment = newAmount
         }
         return split;
      });
      setSplitTenants(newSplit)
      setSplitEvenly(false);
   };

   // Calculate totals
   const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
   const unpaidAmount = bills.filter(b => b.status === "Pending").reduce((sum, bill) => sum + bill.amount, 0);

   const handleCreateBill = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
         setIsLoading(true);

         const response = await set_bill(currentBill, splitTenants);

         const data = await response.json();
         if (data.success) {
            showNotification('success', 'Property form submitted successfully!');
            setShowCreateModal(false);
         } else {
            showNotification('error', 'Something went wrong... Please check all the form data and try again.');
         }
      } catch (err) {
         console.log(err);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      // Filter properties, then check each room to find all the tenants.
      const propertyTenants = tenants.filter(tenant => {
         const filteredRooms = rooms.filter(r => r.id_property == currentBill.propertyId).find(r => r.id == tenant.room_id);
         const tenantRentedOnBillDate = new Date(tenant.lease_start) <= new Date(currentBill.dueDate) && new Date(tenant.lease_end) >= new Date(currentBill.issuedDate);
         if (!filteredRooms || !tenantRentedOnBillDate) return false;
         return true;
      });

      if (propertyTenants.length > 0) {
         const splitAmount = Number((currentBill.amount / propertyTenants.length).toFixed(2));
         const newSplits = propertyTenants.map(tenant => {

            const t:Partial<Tenant> = {
               id: tenant.id,
               name: tenant.name,
               lease_start: tenant.lease_start,
               lease_end: tenant.lease_end,
            }
            
            const p: Partial<Payment> = {
               amount_payment: splitEvenly ? splitAmount : 0
            }

            return{
               tenant:t,
               payment:p,
            }
         });
         setSplitTenants(newSplits);
      } else {
         setSplitTenants([]);
      }
   }, [currentBill.propertyId, currentBill.amount, currentBill.issuedDate, currentBill.dueDate]);

   useEffect(()=>{
      if (splitEvenly) { // Split Evenly only when true
         const splitAmount = Number((currentBill.amount / splitTenants.length).toFixed(2));
         const newSplits = splitTenants.map(split => ({
            tenant: split.tenant,
            payment: {
               ...split.payment, amount_payment:splitAmount
            }
         }));
         setSplitTenants(newSplits);
      }
   },[splitEvenly])
   

   const handleOnCloseClick = () => {
      setShowCreateModal(false)
      setCurrentBill(BillDefaultVal);
   }

   if (loadingProperties || loadingBills || loadingTenants || loadingRooms || loadingPaymentTenantBills) {
      return <Loader />;
   }

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header and Stats */}
         <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-2xl font-bold text-gray-900">Bills Management</h1>
               <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
               >
                  + Add New Bill
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <h3 className="text-gray-500 text-sm font-medium">Total Bills</h3>
                  <p className="text-2xl font-bold">{filteredBills.length}</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                  <h3 className="text-gray-500 text-sm font-medium">Total Amount</h3>
                  <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                  <h3 className="text-gray-500 text-sm font-medium">Unpaid Amount</h3>
                  <p className="text-2xl font-bold">${unpaidAmount.toFixed(2)}</p>
               </div>
            </div>
         </div>

         {/* Filters */}
         <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
               <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
                  <button
                     onClick={() => setActiveTab('all')}
                     className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                  >
                     All Bills
                  </button>
                  <button
                     onClick={() => setActiveTab('unpaid')}
                     className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'unpaid' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                  >
                     Unpaid
                  </button>
                  <button
                     onClick={() => setActiveTab('paid')}
                     className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                  >
                     Paid
                  </button>
               </div>

               <div className="w-full md:w-auto">
                  <select
                     value={filterProperty}
                     onChange={(e) => setFilterProperty(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                     <option value="all">All Properties</option>
                     {properties.map(property => (
                        <option key={property.id} value={property.id}>{property.title}</option>
                     ))}
                  </select>
               </div>
            </div>
         </div>

         {/* Bills Table */}
         <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Property
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Bill Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Total Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Current Balance
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Issued Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Due Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Assigned To
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredBills.length > 0 ? (
                        filteredBills.map((bill) => {
                           const p = properties.find(p => p.id === bill.propertyId);
                           const t = tenants.filter(tenant => {
                              const filteredRooms = rooms.find(r => r.id_property == p?.id && r.id === tenant.room_id);
                              if (!filteredRooms) return false;
                              return true;
                           });

                           // get sum of payments done
                           const payments = paymentTenantBills.reduce((amount, p) => amount + ((p.bill_id === bill.id && p.status==="Paid") ?  p.amount_paid : 0), 0);
                           const is_amount_paid = payments >= bill.amount;

                           const p_title = p ? p.title : null;

                           return (
                              <tr key={bill.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 whitespace-nowrap">

                                    <div className="font-medium text-gray-900">{p_title}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900">{bill.type}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900">${bill.amount.toFixed(2)}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900">${bill.balance.toFixed(2)}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900">
                                       {new Date(bill.issuedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900">
                                       {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${is_amount_paid
                                       ? 'bg-green-100 text-green-800'
                                       : 
                                          'bg-yellow-100 text-yellow-800'
                                       }`}>
                                       {is_amount_paid ? "Paid" : "Pending"}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col text-gray-900">
                                       {t.length > 0 ? t.map((tenant, i) =>{
                                          return (
                                             <span key={i} className="text-xs">
                                                {tenant.name}
                                             </span>
                                          )
                                       }) : (
                                          <span className="text-sm text-gray-400">Not assigned</span>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                       {is_amount_paid && bill.status !== "Pending" && (
                                          <button
                                          type='button'
                                          className="text-green-600 hover:text-green-900"
                                          >
                                             Mark Paid
                                          </button>
                                       )}
                                    </div>
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

         {/* Create Bill Modal */}
         {showCreateModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
               <div
                  className="fixed inset-0 bg-gray-600/70 transition-opacity"
                  aria-hidden="true"
                  onClick={handleOnCloseClick}
               ></div>

               <div className="flex min-h-screen items-center justify-center p-4 text-center">
                  <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-2xl">
                     <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-lg font-semibold text-white">
                              {currentBill.id != "" ? 'Edit Bill' : 'Add New Bill'}
                           </h3>
                           <button
                              type="button"
                              className="rounded-md p-1 text-white hover:bg-blue-500 focus:outline-none"
                              onClick={handleOnCloseClick}
                           >
                              <XMarkIcon className="h-6 w-6" />
                           </button>
                        </div>
                     </div>

                     <div className="px-6 py-5">
                        <form onSubmit={handleCreateBill} method='post'>
                           <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                 <div>
                                    <label htmlFor="property_id" className="block text-sm font-medium text-gray-700 mb-1">
                                       Property
                                    </label>
                                    <select
                                       id="property_id"
                                       name="property_id"
                                       onChange={(e) => setCurrentBill({ ...currentBill, propertyId: e.target.value })}
                                       defaultValue={currentBill.propertyId || ""}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white peer"
                                       required
                                    >
                                       <option value="" disabled>Select a property</option>
                                       {properties.map(property => (
                                          <option key={property.id} value={property.id}>{property.title}</option>
                                       ))}
                                    </select>
                                    <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                       This field is required
                                    </p>
                                 </div>

                                 <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                       Bill Type
                                    </label>
                                    <select
                                       id="type"
                                       name="type"
                                       defaultValue={currentBill.type || ""}
                                       onChange={(e) => setCurrentBill({ ...currentBill, type: e.target.value })}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white peer"
                                       required
                                    >
                                       <option value="" disabled>Select a bill</option>
                                       {listBillTypes.map((b, i) => (
                                          <option key={i} value={b}>{b}</option>
                                       ))}
                                    </select>
                                    <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                       This field is required
                                    </p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                 <div>
                                    <label htmlFor="issuedDate" className="block text-sm font-medium text-gray-700 mb-1">
                                       Issued date
                                    </label>
                                    <input
                                       type="date"
                                       id="issuedDate"
                                       name="issuedDate"
                                       required
                                       defaultValue={currentBill.issuedDate.toString()}
                                       onChange={(e) => setCurrentBill({ ...currentBill, issuedDate: new Date(e.target.value) })}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-5 px-4 py-2 border peer"
                                       placeholder="123 Main St, City, State"
                                    />
                                    <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                       This field is required
                                    </p>
                                 </div>

                                 <div>
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                       Due date
                                    </label>
                                    <input
                                       type="date"
                                       id="dueDate"
                                       name="dueDate"
                                       required
                                       defaultValue={currentBill.dueDate.toString()}
                                       onChange={(e) => setCurrentBill({ ...currentBill, dueDate: new Date(e.target.value) })}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-5 px-4 py-2 border peer"
                                       placeholder="123 Main St, City, State"
                                    />
                                    <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                       This field is required
                                    </p>
                                 </div>

                              </div>

                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
                                 <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                       Amount
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="number"
                                          id="amount"
                                          name="amount"
                                          placeholder="0.00"
                                          min="0"
                                          step="0.01"
                                          required
                                          defaultValue={currentBill.amount}
                                          onChange={(e) => setCurrentBill({ ...currentBill, balance: Number(e.target.value), amount: Number(e.target.value) })}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border peer"
                                       />
                                       <p className="absolute mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                          This field is required
                                       </p>
                                    </div>
                                 </div>

                                 <div>
                                    <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                                       Balance
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="number"
                                          id="balance"
                                          name="balance"
                                          disabled
                                          value={currentBill.balance}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 pl-10 px-4 py-2 border"
                                          placeholder="123 Main St, City, State"
                                       />
                                    </div>
                                 </div>
                              </div>

                              <div>
                                 <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (optional)
                                 </label>
                                 <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    defaultValue={currentBill.notes}
                                    onChange={(e) => setCurrentBill({ ...currentBill, notes: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                                    placeholder="Any notes..."
                                 />
                              </div>



                              {splitTenants.length > 0 && (
                                 <AsignBills
                                 bill={currentBill}
                                 tenantSplits={splitTenants}
                                 handlePaymentAmountChange={handlePaymentAmountChange}
                                 splitEvenly={splitEvenly}
                                 setSplitEvenly={setSplitEvenly}
                                 />
                              )}
                           </div>

                           <div className="mt-6 flex justify-end space-x-3">
                              <button
                                 type="button"
                                 onClick={handleOnCloseClick}
                                 className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                 Cancel
                              </button>
                              <button
                                 type="submit"
                                 disabled={isLoading}
                                 className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-blue-300"
                              >
                                 {isLoading ? (
                                    currentBill.id != "" ? 'Updating Bill...' : 'Creating Bill...'
                                 ) : (
                                    currentBill.id != "" ? 'Update Bill' : 'Create Bill'
                                 )}
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default BillsManagement;