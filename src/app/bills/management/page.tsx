'use client';

import { useState } from 'react';
import { Bill } from '@/types/bill';

type Property = {
   id: string;
   name: string;
   address: string;
};

type Tenant = {
   id: string;
   name: string;
   email: string;
   propertyId: string;
};

const BillsManagement = () => {
   const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('all');
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [showAssignModal, setShowAssignModal] = useState(false);
   const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
   const [filterProperty, setFilterProperty] = useState<string>('all');

   // Mock data - replace with your actual data fetching
   const properties: Property[] = [
      { id: '1', name: 'Downtown Suite', address: '123 Main St, Vancouver' },
      { id: '2', name: 'Kitsilano House', address: '456 Beach Ave, Vancouver' },
      { id: '3', name: 'West End Apartment', address: '789 Robson St, Vancouver' },
   ];

   const tenants: Tenant[] = [
      { id: '1', name: 'Alex Johnson', email: 'alex@example.com', propertyId: '1' },
      { id: '2', name: 'Sam Wilson', email: 'sam@example.com', propertyId: '1' },
      { id: '3', name: 'Taylor Smith', email: 'taylor@example.com', propertyId: '2' },
      { id: '4', name: 'Jordan Lee', email: 'jordan@example.com', propertyId: '3' },
   ];

   const [bills, setBills] = useState<Bill[]>([
      {
         id: '1',
         propertyId: '1',
         propertyName: 'Downtown Suite',
         billType: 'Electricity',
         period: '2023-10',
         amount: 125.75,
         dueDate: '2023-11-05',
         status: 'Paid',
         assignedTenants: ['1', '2'],
         notes: 'Increased usage this month'
      },
      {
         id: '2',
         propertyId: '2',
         propertyName: 'Kitsilano House',
         billType: 'Internet',
         period: '2023-10',
         amount: 89.99,
         dueDate: '2023-11-01',
         status: 'Unpaid',
         assignedTenants: ['3'],
         notes: 'Monthly subscription'
      },
      {
         id: '3',
         propertyId: '3',
         propertyName: 'West End Apartment',
         billType: 'Gas',
         period: '2023-10',
         amount: 65.50,
         dueDate: '2023-11-10',
         status: 'Pending',
         assignedTenants: ['4'],
         notes: ''
      },
      {
         id: '4',
         propertyId: '1',
         propertyName: 'Downtown Suite',
         billType: 'Water',
         period: '2023-09',
         amount: 85.25,
         dueDate: '2023-10-05',
         status: 'Paid',
         assignedTenants: ['1', '2'],
         notes: 'Normal usage'
      },
   ]);

   // Form state for creating/editing bills
   const [formData, setFormData] = useState<Omit<Bill, 'id' | 'propertyName' | 'status' | 'assignedTenants'>>({
      propertyId: '',
      billType: 'Electricity',
      period: new Date().toISOString().slice(0, 7),
      amount: 0,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10),
      notes: ''
   });

   // Form state for assigning tenants
   const [assignmentData, setAssignmentData] = useState({
      billId: '',
      tenantIds: [] as string[]
   });

   // Filter bills based on active tab and property filter
   const filteredBills = bills.filter(bill => {
      // Filter by status
      if (activeTab === 'unpaid' && bill.status !== 'Unpaid') return false;
      if (activeTab === 'paid' && bill.status !== 'Paid') return false;

      // Filter by property
      if (filterProperty !== 'all' && bill.propertyId !== filterProperty) return false;

      return true;
   });

   // Calculate totals
   const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
   const unpaidAmount = bills.filter(b => b.status === 'Unpaid').reduce((sum, bill) => sum + bill.amount, 0);

   const handleCreateBill = () => {
      const newBill: Bill = {
         id: (bills.length + 1).toString(),
         propertyName: properties.find(p => p.id === formData.propertyId)?.name || '',
         status: 'Unpaid',
         assignedTenants: [],
         ...formData
      };

      setBills([...bills, newBill]);
      setShowCreateModal(false);
      setFormData({
         propertyId: '',
         billType: 'Electricity',
         period: new Date().toISOString().slice(0, 7),
         amount: 0,
         dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10),
         notes: ''
      });
   };

   const handleAssignTenants = () => {
      if (!selectedBill) return;

      const updatedBills = bills.map(bill => {
         if (bill.id === selectedBill.id) {
            return {
               ...bill,
               assignedTenants: assignmentData.tenantIds
            };
         }
         return bill;
      });

      setBills(updatedBills);
      setShowAssignModal(false);
      setAssignmentData({
         billId: '',
         tenantIds: []
      });
   };

   const markAsPaid = (billId: string) => {
      console.log(billId)
      /*const updatedBills = bills.map(bill => {
        if (bill.id === billId) {
          return {
            ...bill,
            status: 'Paid'
          };
        }
        return bill;
      });
      
      setBills(updatedBills);*/
   };

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
                        <option key={property.id} value={property.id}>{property.name}</option>
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
                           Period
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
                        filteredBills.map((bill) => (
                           <tr key={bill.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="font-medium text-gray-900">{bill.propertyName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">{bill.billType}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">
                                    {new Date(bill.period + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">${bill.amount.toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">
                                    {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2 py-1 text-xs rounded-full ${bill.status === 'Paid'
                                       ? 'bg-green-100 text-green-800'
                                       : bill.status === 'Unpaid'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {bill.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-gray-900">
                                    {bill.assignedTenants.length > 0 ? (
                                       <span className="text-sm">
                                          {bill.assignedTenants.length} tenant{bill.assignedTenants.length !== 1 ? 's' : ''}
                                       </span>
                                    ) : (
                                       <span className="text-sm text-gray-400">Not assigned</span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                 <div className="flex justify-end space-x-2">
                                    {bill.status === 'Unpaid' && (
                                       <button
                                          onClick={() => markAsPaid(bill.id)}
                                          className="text-green-600 hover:text-green-900"
                                       >
                                          Mark Paid
                                       </button>
                                    )}
                                    <button
                                       onClick={() => {
                                          setSelectedBill(bill);
                                          setAssignmentData({
                                             billId: bill.id,
                                             tenantIds: [...bill.assignedTenants]
                                          });
                                          setShowAssignModal(true);
                                       }}
                                       className="text-blue-600 hover:text-blue-900"
                                    >
                                       Assign
                                    </button>
                                    {bill.notes && (
                                       <button
                                          onClick={() => alert(`Notes:\n${bill.notes}`)}
                                          className="text-gray-600 hover:text-gray-900"
                                          title="View notes"
                                       >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                          </svg>
                                       </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Add New Bill</h2>
                        <button
                           onClick={() => setShowCreateModal(false)}
                           className="text-gray-400 hover:text-gray-500"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        </button>
                     </div>

                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                           <select
                              value={formData.propertyId}
                              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                           >
                              <option value="">Select Property</option>
                              {properties.map(property => (
                                 <option key={property.id} value={property.id}>{property.name}</option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Bill Type</label>
                           <select
                              value={formData.billType}
                              //</div>onChange={(e) => setFormData({ ...formData, billType: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                           >
                              <option value="Electricity">Electricity</option>
                              <option value="Gas">Gas</option>
                              <option value="Water">Water</option>
                              <option value="Internet">Internet</option>
                              <option value="Cable">Cable</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Period (Month/Year)</label>
                           <input
                              type="month"
                              value={formData.period}
                              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                           <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.amount}
                              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                           <input
                              type="date"
                              value={formData.dueDate}
                              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                           <textarea
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                           />
                        </div>
                     </div>

                     <div className="mt-6 flex justify-end space-x-3">
                        <button
                           onClick={() => setShowCreateModal(false)}
                           className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleCreateBill}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                           Save Bill
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Assign Tenants Modal */}
         {showAssignModal && selectedBill && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                           Assign Tenants to {selectedBill.billType} Bill
                        </h2>
                        <button
                           onClick={() => setShowAssignModal(false)}
                           className="text-gray-400 hover:text-gray-500"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        </button>
                     </div>

                     <div className="mb-4">
                        <p className="text-sm text-gray-600">
                           Select tenants to assign this bill to. The bill amount will be split equally among assigned tenants.
                        </p>
                     </div>

                     <div className="space-y-3">
                        {tenants.filter(t => t.propertyId === selectedBill.propertyId).map(tenant => (
                           <div key={tenant.id} className="flex items-center">
                              <input
                                 type="checkbox"
                                 id={`tenant-${tenant.id}`}
                                 checked={assignmentData.tenantIds.includes(tenant.id)}
                                 onChange={(e) => {
                                    if (e.target.checked) {
                                       setAssignmentData({
                                          ...assignmentData,
                                          tenantIds: [...assignmentData.tenantIds, tenant.id]
                                       });
                                    } else {
                                       setAssignmentData({
                                          ...assignmentData,
                                          tenantIds: assignmentData.tenantIds.filter(id => id !== tenant.id)
                                       });
                                    }
                                 }}
                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`tenant-${tenant.id}`} className="ml-3 block text-sm text-gray-700">
                                 {tenant.name} ({tenant.email})
                              </label>
                           </div>
                        ))}
                     </div>

                     <div className="mt-6 flex justify-end space-x-3">
                        <button
                           onClick={() => setShowAssignModal(false)}
                           className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleAssignTenants}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                           Save Assignments
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default BillsManagement;