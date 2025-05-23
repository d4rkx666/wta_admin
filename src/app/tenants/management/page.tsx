'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useLiveProperties } from '@/hooks/useLiveProperties';
import Loader from '@/app/components/common/Loader';
import { XMarkIcon, DocumentTextIcon, PhotoIcon, UserIcon, EnvelopeIcon, PhoneIcon, HomeIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/app/context/NotificationContext';
import { Tenant, TenantDefaultVal } from '@/types/tenant';
import { set_tenant } from '@/hooks/setTenant';
import { useRoom } from '@/hooks/useRoom';
import { Room, RoomDefaultVal } from '@/types/room';
import { Payment } from '@/types/payment';
import { useLiveTenants } from '@/hooks/useLiveTenants';
import { useLivePayments } from '@/hooks/useLivePayments';
import ModalConfirmation from '@/app/components/common/ModalConfirmation';
import { del_tenant } from '@/hooks/delTenant';
import { get_tenant_files } from '@/hooks/getTenantFiles';
import Image from 'next/image';

const TenantManagement = () => {
   const { showNotification } = useNotification();
   const [isLoading, setIsLoading] = useState(false);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);

   const [currentTenant, setCurrentTenant] = useState<Tenant>(TenantDefaultVal);
   const [currentRooms, setCurrentRooms] = useState<Room[]>([]);
   const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
   const [depositPayment, setDepositPayment] = useState<Partial<Payment>>({});
   const [firstRentPayment, setFirstRentPayment] = useState<Partial<Payment>>({});

   const [hasCouple, setHasCouple] = useState(false);
   const [tenantPaidFirstMonth, setTenantPaidFirstMonth] = useState(false);
   const [tenantPaidOtherAmount, setTenantPaidOtherAmount] = useState(false);

   const [filterProperty, setFilterProperty] = useState<string>('all');
   const [contractFile, setContractFile] = useState<File | null>(null);
   const [idFile, setIdFile] = useState<File | null>(null);
   const [contractPreview, setContractPreview] = useState<string | null>(null);
   const [idPreview, setIdPreview] = useState<string | null>(null);

   const { data: properties, loading: loadingProperties } = useLiveProperties(); // properties
   const { data: tenants, loading: loadingTenants } = useLiveTenants(); // tenants
   const { data: payments, loading: loadingPayments } = useLivePayments(); // payments

   // Handle file uploads
   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'contract' | 'id') => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (type === 'contract') {
         setContractFile(file);
         if (file.type === 'application/pdf') {
            setContractPreview(URL.createObjectURL(file));
         }
      } else {
         setIdFile(file);
         if (file.type.startsWith('image/')) {
            setIdPreview(URL.createObjectURL(file));
         }
      }
   };

   // Handle form submission
   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
         setIsLoading(true);

         const tenantToInsert: Tenant = currentTenant;
         if (!hasCouple) {
            tenantToInsert.couple_name = "";
         }

         // Prepare FormData
         const formData = new FormData();
         formData.append('tenant', JSON.stringify(tenantToInsert));
         formData.append('deposit', JSON.stringify(depositPayment));
         formData.append('rent', JSON.stringify(firstRentPayment));

         if(contractFile){
            formData.append('contractFile', contractFile);
         }
         if(idFile){
            formData.append('idFile', idFile);
         }

         const response = await set_tenant(formData);

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
         setContractFile(null);
         setIdFile(null)
         setIsLoading(false);
      }
   };

   const handleDelTenant = async()=>{
      try {
         setIsLoading(true);

         const response = await del_tenant(currentTenant);

         const data = await response.json();
         if (data.success) {
            showNotification('success', 'Tenant deleted successfully!');
            setShowCreateModal(false);
         } else {
            showNotification('error', 'Something went wrong... Please check all the form data and try again.');
         }
      } catch (err) {
         console.log(err);
      } finally {
         setIsLoading(false);
      }
   }



   const { data: roomData } = useRoom();
   const handleShowRooms = async (id_property: string) => {
      const rooms = roomData.filter(room => room.id_property === id_property && room.available);
      setCurrentRooms(rooms);
   }

   const setPriceRoom = (idRoom: string) => {
      const room = roomData.find(room => room.id === idRoom);
      if (room) {
         setCurrentRoom(room);
      }
   }

   const handleCloseModal = () => {
      setShowCreateModal(false);
      setCurrentTenant(TenantDefaultVal);
      setCurrentRoom(RoomDefaultVal);
      setCurrentRooms([]);
      setDepositPayment({});
      setFirstRentPayment({});
      setHasCouple(false);
      setTenantPaidFirstMonth(false);
      setTenantPaidOtherAmount(false);
      setContractFile(null);
      setIdFile(null);
      setIdPreview(null);
      setContractPreview(null)
   }

   const handleOnClickEdit = async (room: Room | undefined, deposit: Payment | undefined, tenant: Tenant) =>{
      setCurrentTenant(tenant);
      if (room) {
         setCurrentRooms([]); // clear rooms
         setCurrentRooms(prev => [...prev, room]); //add rooms for the select list
         setCurrentRoom(room); // set current room to select in the selects
      }
      if(deposit){
         setDepositPayment({...depositPayment, ...deposit});
      }
      if(tenant.couple_name){
         setHasCouple(true)
      }

      const data = await get_tenant_files(tenant);
      const resp:{success:boolean, contractUrl:string, idUrl:string} = await data.json();

      if(resp.success){
         setContractPreview(resp.contractUrl)
         setIdPreview(resp.idUrl)
      }

      setShowCreateModal(true);
   }

   // Filter tenants
   const filteredTenants = tenants.filter(tenant => {
      const filteredRooms = roomData.filter(r => r.id_property == filterProperty).find(r => r.id == tenant.room_id);
      if (filterProperty !== 'all' && !filteredRooms) return false;
      return true;
   });

   // Clean up preview URLs
   useEffect(() => {
      return () => {
         if (contractPreview) URL.revokeObjectURL(contractPreview);
         if (idPreview) URL.revokeObjectURL(idPreview);
      };
   }, [contractPreview, idPreview]);

   useEffect(() => {
      let amount_payment = 0;
      if (tenantPaidFirstMonth) {
         if (!tenantPaidOtherAmount) {
            amount_payment = currentRoom?.price || 0;
         }
      }
      setFirstRentPayment({ ...firstRentPayment, amount_paid: amount_payment })
   }, [tenantPaidFirstMonth, tenantPaidOtherAmount, currentRoom.price])

   if (loadingProperties || loadingTenants || loadingPayments) {
      return <Loader />;
   }

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header and Stats */}
         <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
               <button
                  onClick={() => {
                     setContractFile(null);
                     setIdFile(null);
                     setContractPreview(null);
                     setIdPreview(null);
                     setShowCreateModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
               >
                  + Add New Tenant
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <h3 className="text-gray-500 text-sm font-medium">Total Tenants</h3>
                  <p className="text-2xl font-bold">{tenants.length}</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                  <h3 className="text-gray-500 text-sm font-medium">Active Leases</h3>
                  <p className="text-2xl font-bold">{tenants.filter(t => new Date(t.lease_end) > new Date()).length}</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                  <h3 className="text-gray-500 text-sm font-medium">Pending Payments</h3>
                  <p className="text-2xl font-bold">{payments.filter(t => t.status === "Pending").length}</p>
               </div>
            </div>
         </div>

         {/* Filters */}
         <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

         {/* Tenants Table */}
         <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Tenant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Property & Room
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Lease Period
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Deposit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Rent Paid
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredTenants.length > 0 ? (
                        filteredTenants.map((tenant) => {
                           const room = roomData.find(r => r.id === tenant.room_id);
                           const property = properties.find(p => p.id === room?.id_property);
                           const deposit = payments.find(p => p.tenant_id === tenant.id && p.type === "deposit");
                           const currentRent = payments.find(p => p.tenant_id === tenant.id && p.type === "rent" && p.is_current);

                           return (
                              <tr key={tenant.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                       <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                                          <UserIcon className="h-3 w-3 text-gray-500" />
                                       </div>
                                       <div className="ml-4">
                                          <div className="font-small text-gray-900">{tenant.name}</div>
                                          {tenant.couple_name && (
                                             <div className="text-sm text-gray-500">{tenant.couple_name}</div>
                                          )}
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900">{tenant.email}</div>
                                    <div className="text-gray-500">{tenant.phone}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900">{property?.title || 'N/A'}</div>
                                    <div className="text-gray-500">Room: {room?.room_number || 'N/A'}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900">
                                       {new Date(tenant.lease_start).toLocaleDateString()} -{' '}
                                       {new Date(tenant.lease_end).toLocaleDateString()}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                       <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-1" />
                                       <span>{deposit?.amount_payment.toFixed(2)}</span>
                                       {deposit?.amount_payment ? (
                                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>
                                       ) : (
                                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Pending</span>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                       <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-1" />
                                       <span>{currentRent?.amount_payment.toFixed(2)}</span>
                                       {currentRent?.status === "Paid" ? (
                                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>
                                       ) : (
                                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Pending</span>
                                       )}
                                    </div>
                                    <span className="ml-2 text-xs">Room ${room?.price.toFixed(2) || 0}</span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                       onClick={()=>handleOnClickEdit(room, deposit, tenant)}
                                       className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                       Edit
                                    </button>
                                    {/*<button
                                       onClick={() =>handleOnClickDel(tenant)}
                                       className="text-red-600 hover:text-red-900"
                                    >
                                       Delete
                                    </button>*/}
                                 </td>
                              </tr>
                           );
                        })
                     ) : (
                        <tr>
                           <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                              No tenants found matching your filters
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Create/Edit Tenant Modal */}
         {showCreateModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
               <div
                  className="fixed inset-0 bg-gray-600/70 transition-opacity"
                  aria-hidden="true"
                  onClick={handleCloseModal}
               ></div>

               <div className="flex min-h-screen items-center justify-center p-4 text-center">
                  <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-2xl">
                     <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-lg font-semibold text-white">
                              {currentTenant.id ? 'Edit Tenant' : 'Add New Tenant'}
                           </h3>
                           <button
                              type="button"
                              className="rounded-md p-1 text-white hover:bg-blue-500 focus:outline-none"
                              onClick={handleCloseModal}
                           >
                              <XMarkIcon className="h-6 w-6" />
                           </button>
                        </div>
                     </div>

                     <div className="px-6 py-5">
                        <form onSubmit={handleSubmit}>
                           <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                 <div>
                                    <div className='flex justify-between'>
                                       <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                          Full Name
                                       </label>
                                       <div className="flex items-center">
                                          <div className="flex items-center h-5 mt-1">
                                             <input
                                                id="hasCouple"
                                                name="hasCouple"
                                                type="checkbox"
                                                checked={hasCouple}
                                                onChange={(e) => setHasCouple(e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                             />
                                          </div>
                                          <div className="ml-3 text-sm">
                                             <label htmlFor="hasCouple" className="font-medium text-gray-700">
                                                Has couple?
                                             </label>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <UserIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="text"
                                          id="name"
                                          name="name"
                                          required
                                          value={currentTenant.name || ''}
                                          onChange={(e) => setCurrentTenant({ ...currentTenant, name: e.target.value })}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border"
                                          placeholder="John Doe"
                                       />
                                    </div>
                                 </div>
                                 {hasCouple && (
                                    <div>
                                       <label htmlFor="coupleName" className="block text-sm font-medium text-gray-700 mb-1">
                                          Couple&apos;s Name
                                       </label>
                                       <div className="relative rounded-md shadow-sm">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                             <UserIcon className="h-5 w-5 text-gray-400" />
                                          </div>
                                          <input
                                             type="text"
                                             id="coupleName"
                                             name="coupleName"
                                             value={currentTenant.couple_name || ''}
                                             onChange={(e) => setCurrentTenant({ ...currentTenant, couple_name: e.target.value })}
                                             className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border"
                                             placeholder="Jane Doe"
                                          />
                                       </div>
                                    </div>
                                 )}
                              </div>

                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                 <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                       Email
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="email"
                                          id="email"
                                          name="email"
                                          required
                                          value={currentTenant.email || ''}
                                          onChange={(e) => setCurrentTenant({ ...currentTenant, email: e.target.value })}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border"
                                          placeholder="john@example.com"
                                       />
                                    </div>
                                 </div>

                                 <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                       Phone Number
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="tel"
                                          id="phone"
                                          name="phone"
                                          required
                                          value={currentTenant.phone || ''}
                                          onChange={(e) => setCurrentTenant({ ...currentTenant, phone: e.target.value })}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border"
                                          placeholder="+1 (555) 123-4567"
                                       />
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                 <div>
                                    <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
                                       Property
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <HomeIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <select
                                          id="propertyId"
                                          name="propertyId"
                                          required
                                          onChange={(e) => handleShowRooms(e.target.value)}
                                          defaultValue={currentRoom.id_property || ""}
                                          disabled={currentTenant.id ? true : false}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                                       >
                                          <option value="">Select Property</option>
                                          {properties.map(property => (
                                             <option key={property.id} value={property.id}>{property.title}</option>
                                          ))}
                                       </select>
                                    </div>
                                 </div>

                                 <div>
                                    <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                                       Room
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <HomeIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <select
                                          id="roomId"
                                          name="roomId"
                                          required
                                          defaultValue={currentRoom.id || ""}
                                          disabled={currentTenant.id ? true : false}
                                          onChange={(e) => {
                                             setCurrentTenant({ ...currentTenant, room_id: e.target.value });
                                             setPriceRoom(e.target.value);
                                          }}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                                       >
                                          <option value="">Select Room</option>
                                          {currentRooms.map(room => (
                                             <option key={room.id} value={room.id}>{room.title}</option>
                                          ))}
                                       </select>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                 <div>
                                    <label htmlFor="leaseStart" className="block text-sm font-medium text-gray-700 mb-1">
                                       Lease Start Date
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="date"
                                          id="leaseStart"
                                          name="leaseStart"
                                          required
                                          disabled={currentTenant.id ? true : false}
                                          value={new Date(currentTenant.lease_start).toISOString().split('T')[0] || ''}
                                          onChange={(e) => setCurrentTenant({ ...currentTenant, lease_start: new Date(e.target.value) })}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                       />
                                    </div>
                                 </div>

                                 <div>
                                    <label htmlFor="leaseEnd" className="block text-sm font-medium text-gray-700 mb-1">
                                       Lease End Date
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="date"
                                          id="leaseEnd"
                                          name="leaseEnd"
                                          required
                                          disabled={currentTenant.id ? true : false}
                                          value={new Date(currentTenant.lease_end).toISOString().split('T')[0] || ''}
                                          onChange={(e) => setCurrentTenant({ ...currentTenant, lease_end: new Date(e.target.value) })}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                       />
                                    </div>
                                 </div>
                              </div>

                              <div>
                                 <div>
                                    <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-1">
                                       Deposit Amount
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="number"
                                          id="depositAmount"
                                          name="depositAmount"
                                          min="0"
                                          disabled={currentTenant.id ? true : false}
                                          value={depositPayment?.amount_payment || ''}
                                          onChange={(e) => setDepositPayment({ ...depositPayment, amount_payment: parseFloat(e.target.value) || 0 })}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                          placeholder="0.00"
                                       />
                                    </div>
                                 </div>
                              </div>
                                          
                              {!currentTenant.id &&

                                 <div>
                                    <div className="flex items-start">
                                       <div className="flex items-center h-5 mt-1">
                                          <input
                                             id="rentPaidForMonth"
                                             name="rentPaidForMonth"
                                             type="checkbox"
                                             checked={tenantPaidFirstMonth}
                                             disabled={currentTenant.id ? true : false}
                                             onChange={(e) => setTenantPaidFirstMonth(e.target.checked)}
                                             className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:bg-gray-200"
                                          />
                                       </div>
                                       <div className="ml-3 text-sm">
                                          <label htmlFor="rentPaidForMonth" className="font-medium text-gray-700">
                                             Tenant paid current month
                                          </label>
                                       </div>
                                    </div>
                                 </div>
                              }

                              {(tenantPaidFirstMonth && !currentTenant.id) && (
                                 <div>
                                    <div className="flex items-center mb-2">
                                       <div className="flex items-center h-5">
                                          <input
                                             id="fixedAmount"
                                             name="fixedAmount"
                                             type="checkbox"
                                             checked={!tenantPaidOtherAmount}
                                             disabled={currentTenant.id ? true : false}
                                             onChange={(e) => {
                                                setTenantPaidOtherAmount(!e.target.checked);
                                                setFirstRentPayment({ ...firstRentPayment, amount_paid: tenantPaidOtherAmount ? currentRoom.price : firstRentPayment?.amount_payment })
                                             }}
                                             className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:bg-gray-200"
                                          />
                                       </div>
                                       <div className="ml-3 text-sm">
                                          <label htmlFor="fixedAmount" className="font-medium text-gray-700">
                                             Tenant paid ${currentRoom.price} (Room Price)
                                          </label>
                                       </div>
                                    </div>

                                    {tenantPaidOtherAmount && (
                                       <div>
                                          <label htmlFor="tenantPaidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                                             Amount Paid
                                          </label>
                                          <div className="relative rounded-md shadow-sm">
                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                             </div>
                                             <input
                                                type="number"
                                                id="tenantPaidAmount"
                                                name="tenantPaidAmount"
                                                min="0"
                                                step="0.01"
                                                value={firstRentPayment?.amount_paid || ''}
                                                disabled={currentTenant.id ? true : false}
                                                onChange={(e) => setFirstRentPayment({
                                                   ...firstRentPayment, amount_paid: parseFloat(e.target.value) || 0
                                                })}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                                placeholder="Enter amount paid"
                                             />
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              )}

                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                 <div>
                                    <label htmlFor="contractFile" className="block text-sm font-medium text-gray-700 mb-1">
                                       Lease Contract (PDF)
                                    </label>
                                    <div className="flex items-center">
                                       <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                          <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                             <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                                             <p className="text-xs text-gray-500 mt-2">
                                                {contractFile ? contractFile.name : 'Click to upload contract'}
                                             </p>
                                          </div>
                                          <input
                                             id="contractFile"
                                             name="contractFile"
                                             type="file"
                                             accept="application/pdf"
                                             className="hidden"
                                             onChange={(e) => handleFileChange(e, 'contract')}
                                          />
                                       </label>
                                    </div>
                                    { contractPreview && 
                                       <div className='mt-5 text-center'>
                                          <span className='mb-1'>Preview</span>
                                          <iframe
                                          key={contractPreview}
                                          src={contractPreview.slice(0,4) === "blob" ? contractPreview : contractPreview+"?"+new Date().getTime()}
                                          style={{ border: 'none' }}
                                          title="PDF Viewer"
                                          ></iframe>
                                       </div>
                                    }
                                    {contractPreview && (
                                       <div className="mt-2">
                                          <a
                                             href={contractPreview}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="text-blue-600 hover:text-blue-800 text-sm"
                                          >
                                             View uploaded contract
                                          </a>
                                       </div>
                                    )}
                                 </div>

                                 <div>
                                    <label htmlFor="idFile" className="block text-sm font-medium text-gray-700 mb-1">
                                       ID/Passport (Image/PDF)
                                    </label>
                                    <div className="flex items-center">
                                       <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                          <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                             <PhotoIcon className="h-8 w-8 text-gray-400" />
                                             <p className="text-xs text-gray-500 mt-2">
                                                {idFile ? idFile.name : 'Click to upload ID/Passport'}
                                             </p>
                                          </div>
                                          <input
                                             id="idFile"
                                             name="idFile"
                                             type="file"
                                             accept="image/*,.pdf"
                                             className="hidden"
                                             onChange={(e) => handleFileChange(e, 'id')}
                                          />
                                       </label>
                                    </div>
                                    { idPreview && 
                                       <div className='mt-5 text-center'>
                                          <span className='mb-1'>Preview</span>
                                          <Image
                                          key={idPreview}
                                          alt='id_file'
                                          src={idPreview.slice(0,4) === "blob" ? idPreview : idPreview+"?"+new Date().getTime()}
                                          width={400}
                                          height={50}
                                          />
                                       </div>
                                    }

                                    {idPreview && (
                                       <div className="mt-2">
                                          <a
                                             href={idPreview}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="text-blue-600 hover:text-blue-800 text-sm"
                                          >
                                             View uploaded ID
                                          </a>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>

                           <div className="mt-6 flex justify-end space-x-3">
                              <button
                                 type="button"
                                 onClick={handleCloseModal}
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
                                    currentTenant.id ? 'Updating...' : 'Creating...'
                                 ) : (
                                    currentTenant.id ? 'Update Tenant' : 'Create Tenant'
                                 )}
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         )}


         {isModalConfirmOpen && (
            <ModalConfirmation
            isOpen={isModalConfirmOpen}
            setIsOpen={setIsModalConfirmOpen}
            onConfirm={handleDelTenant}
            title="Confirm Action"
            message="Are you sure you want to proceed?"
            confirmText="Proceed"
            isDangerous={true}
          />
          )}
      </div>
   );
};

export default TenantManagement;