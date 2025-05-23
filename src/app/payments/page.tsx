'use client';

import { useState } from 'react';
import { PaymentStatus } from '@/types/paymentStatus';
import { Payment, PaymentType } from '@/types/payment';
import { useLivePayments } from '@/hooks/useLivePayments';
import Loader from '../components/common/Loader';
import { useLiveTenants } from '@/hooks/useLiveTenants';
import { useRoom } from '@/hooks/useRoom';
import { useLiveProperties } from '@/hooks/useLiveProperties';
import { notify_payment } from '@/hooks/notifyPayment';
import { useNotification } from '../context/NotificationContext';

const PaymentsDashboard = () => {
   const {showNotification} = useNotification()
   const [activeTab, setActiveTab] = useState<PaymentStatus | 'all'>("Marked");
   const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentType | 'all'>('all');
   const [showMarkModal, setShowMarkModal] = useState(false);
   const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
   const [markPaymentAmount, setMarkPaymentAmount] = useState(0);

   const {data: payments, loading: loadingPayments} = useLivePayments();
   const {data: tenants, loading: loadingTenants} = useLiveTenants();
   const {data: rooms, loading: loadingRooms} = useRoom();
   const {data: properties, loading: loadingProperties} = useLiveProperties();

   // Filter payments based on active tab and type filter
   const filteredPayments = payments.filter(payment => {
      // Filter by status
      if (activeTab !== 'all' && payment.status !== activeTab) return false;

      // Filter by type
      if (paymentTypeFilter !== 'all' && payment.type !== paymentTypeFilter) return false;

      return true;
   });

   // Calculate totals
   const totalPending = filteredPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount_payment, 0);
   const totalMarked = filteredPayments.filter(p => p.status === 'Marked').reduce((sum, p) => sum + p.amount_paid, 0);
   const totalPaid = filteredPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount_paid, 0);

   const markPaymentAsPaid = async() => {
      if (!selectedPayment) return;
      
      try{
         const data = await notify_payment(selectedPayment);
         const resp = await data.json();
         if(resp.success){
            showNotification("success", "Payment has changed its status to Paid successfully");
            setShowMarkModal(false);
         }else{
            showNotification("error", "Something went wrong... Please try again later.");
         }
      }catch{

      }finally{
         setSelectedPayment(null);
      }
   };

   //eslint-disable-next-line
   const formatDate = (date: any) => {
      if(date){
         return date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
   };

   if(loadingPayments || loadingTenants || loadingRooms || loadingProperties){
      return <Loader/>
   }

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header and Stats */}
         <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                  <h3 className="text-gray-500 text-sm font-medium">Pending Payments</h3>
                  <p className="text-2xl font-bold">${totalPending.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                     {payments.filter(p => p.status === 'Pending').length} payment(s)
                  </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <h3 className="text-gray-500 text-sm font-medium">Marked Payments</h3>
                  <p className="text-2xl font-bold">${totalMarked.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                     {payments.filter(p => p.status === 'Marked').length} payment(s)
                  </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                  <h3 className="text-gray-500 text-sm font-medium">Verified Payments</h3>
                  <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                     {payments.filter(p => p.status === 'Paid').length} payment(s)
                  </p>
               </div>
            </div>
         </div>

         {/* Filters */}
         <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
               <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
                  <button
                     onClick={() => setActiveTab('all')}
                     className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                  >
                     All Payments
                  </button>
                  <button
                     onClick={() => setActiveTab('Pending')}
                     className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                  >
                     Pending
                  </button>
                  <button
                     onClick={() => setActiveTab('Marked')}
                     className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'Marked' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                  >
                     Marked
                  </button>
                  <button
                     onClick={() => setActiveTab('Paid')}
                     className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                  >
                     Verified
                  </button>
               </div>

               <div className="w-full md:w-auto">
                  <select
                     value={paymentTypeFilter}
                     onChange={(e) => setPaymentTypeFilter(e.target.value as PaymentType | 'all')}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                     <option value="all">All Types</option>
                     <option value="rent">Rent</option>
                     <option value="deposit">Deposit</option>
                     <option value="bills">Bills</option>
                  </select>
               </div>
            </div>
         </div>

         {/* Payments Table */}
         <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Tenant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Property
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Method
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Due Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => {
                           
                           // find info for each payment
                           const tenant = tenants.find(tenant => tenant.id === payment.tenant_id)
                           const property = properties.find(property =>{
                              const id_property = rooms.find(room=> room.id === tenant?.room_id)?.id_property
                              if(property.id === id_property){
                                 return true;
                              }
                              return false;
                           })
                           return (
                           <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="font-medium text-gray-900">{tenant?.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">{property?.location}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900 capitalize">{payment.type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">
                                    {payment.payment_method === 'E-Transfer' ? 'E-Transfer' : payment.payment_method}
                                    {payment.e_transfer_email && (
                                       <div className="text-sm text-gray-500">{payment.e_transfer_email}</div>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">
                                    ${payment.amount_paid > 0 ? payment.amount_paid.toFixed(2) : payment.amount_payment.toFixed(2)}
                                    {payment.amount_paid > 0 && payment.amount_paid !== payment.amount_payment && (
                                       <span className="text-sm text-gray-500 line-through ml-2">
                                          ${payment.amount_payment.toFixed(2)}
                                       </span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">
                                    {formatDate(payment.dueDate)}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2 py-1 text-xs rounded-full ${payment.status === 'Paid'
                                       ? 'bg-green-100 text-green-800'
                                       : payment.status === 'Pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {payment.status}
                                    {payment.status === 'Marked' && (
                                       <span className="ml-1">(${payment.amount_paid.toFixed(2)})</span>
                                    )}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                 <div className="flex justify-end space-x-2">
                                    {payment.status === "Marked" && (
                                       <button
                                          onClick={() => {
                                             setSelectedPayment(payment);
                                             setMarkPaymentAmount(payment.amount_payment);
                                             setShowMarkModal(true);
                                          }}
                                          className="bg-green-400 rounded-full px-2 py-1 text-white hover:green-blue-900 hover:bg-green-500"
                                       >
                                          Mark as Paid
                                       </button>
                                    )}
                                    {payment.status === 'Paid' && (
                                       <span className="text-gray-400">Verified</span>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        )})
                     ) : (
                        <tr>
                           <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                              No payments found matching your filters
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Mark Payment Modal */}
         {showMarkModal && selectedPayment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                           Mark Payment as Received
                        </h2>
                        <button
                           onClick={() => setShowMarkModal(false)}
                           className="text-gray-400 hover:text-gray-500"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        </button>
                     </div>

                     <div className="space-y-4">
                        <div>
                           <p className="text-sm text-gray-600 mb-2">
                              You&apos;re marking a payment for <span className="font-semibold">${selectedPayment.amount_payment.toFixed(2)}</span> as received.
                           </p>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                           <input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled
                              max={selectedPayment.amount_payment}
                              value={markPaymentAmount}
                              onChange={(e) => setMarkPaymentAmount(parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                           />
                           <p className="text-xs text-gray-500 mt-1">
                              Full amount: ${selectedPayment.amount_payment.toFixed(2)}
                           </p>
                        </div>
                     </div>

                     <div className="mt-6 flex justify-end space-x-3">
                        <button
                           onClick={() => setShowMarkModal(false)}
                           className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={markPaymentAsPaid}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                           Mark as Received
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default PaymentsDashboard;