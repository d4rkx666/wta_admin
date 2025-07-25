'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useLiveProperties } from '@/hooks/useLiveProperties';
import Loader from '@/app/components/common/Loader';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, CurrencyDollarIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/app/context/NotificationContext';
import { Tenant } from '@/types/tenant';
import { set_tenant } from '@/hooks/setTenant';
import { useRoom } from '@/hooks/useRoom';
import { Room, RoomDefaultVal } from '@/types/room';
import { Payment } from '@/types/payment';
import { useLiveTenants } from '@/hooks/useLiveTenants';
import { useLivePayments } from '@/hooks/useLivePayments';
import { useLiveContracts } from '@/hooks/useLiveContracts';
import ModalConfirmation from '@/app/components/common/ModalConfirmation';
import { del_tenant } from '@/hooks/delTenant';
import { get_tenant_files } from '@/hooks/getTenantFiles';
import { Timestamp } from 'firebase/firestore';
import { Contract } from '@/types/contract';
import ContractModal from '../components/ContractModal';
import Image from 'next/image';
import { Property } from '@/types/property';
import { set_contract } from '@/hooks/setContract';
import Link from 'next/link';

type pastContractFiles = {
   id:string,
   url:string,
}

const TenantManagement = () => {
   const { showNotification } = useNotification();
   const [isLoading, setIsLoading] = useState(false);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
   const [showCreateContractModal, setShowCreateContractModal] = useState(false);

   const [currentTenant, setCurrentTenant] = useState<Partial<Tenant>>({ id: "" });
   const [currentRooms, setCurrentRooms] = useState<Room[]>([]);
   const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
   const [currentProperty, setCurrentProperty] = useState<Partial<Property>>({});
   const [currentContract, setCurrentContract] = useState<Partial<Contract>>({id:""});
   const [depositPayment, setDepositPayment] = useState<Partial<Payment>>({});
   const [contract, setContract] = useState<Partial<Contract>>({ id: "" });
   const [pastContracts, setPastContracts] = useState<Partial<Contract>[]>([]);
   const [pastRents, setPastRents] = useState<Partial<Payment>[]>([]);
   const [futureRents, setFutureRents] = useState<Partial<Payment>[]>([]);

   const [hasCouple, setHasCouple] = useState(false);

   const [filterProperty, setFilterProperty] = useState<string>('all');
   const [contractFile, setContractFile] = useState<File | null>(null);
   const [idFile, setIdFile] = useState<File | null>(null);
   const [contractPreview, setContractPreview] = useState<string | null>(null);
   const [idPreview, setIdPreview] = useState<string | null>(null);
   const [pastContractFilesPreview, setPastContractFilesPreview] = useState<pastContractFiles[]>([]);

   // accordion
   const [activeIndex, setActiveIndex] = useState<number | null>(null);

   const toggleItem = (index: number) => {
      setActiveIndex(activeIndex === index ? null : index);
   };

   const { data: properties, loading: loadingProperties } = useLiveProperties(); // properties
   const { data: tenants, loading: loadingTenants } = useLiveTenants(); // tenants
   const { data: contracts, loading: loadingContracts } = useLiveContracts(); // tenants
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
   const handleCreateNewTenant = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
         setIsLoading(true);

         // create deep copy of currentTenant
         const tenantToInsert: Partial<Tenant> = JSON.parse(JSON.stringify(currentTenant));
         if (!hasCouple) {
            tenantToInsert.couple_name = "";
         }

         // check if there is an empty field of past rents
         let rentsError = false;
         if (pastRents.length > 0) {
            for (const rent of pastRents) {
               if (!rent.amount_paid) {
                  rentsError = true;
                  break;
               }
            }
         }

         if (rentsError) {
            showNotification('error', 'The amount of rents cannnot be empty!');
            return;
         }

         // set paid date deposit
         depositPayment.paidDate = new Date();

         // Prepare FormData
         const formData = new FormData();
         formData.append('tenant', JSON.stringify(tenantToInsert));
         formData.append('contract', JSON.stringify(contract));
         formData.append('currentContract', JSON.stringify(currentContract));
         formData.append('deposit', JSON.stringify(depositPayment));
         formData.append('pastRents', JSON.stringify(pastRents));
         formData.append('futureRents', JSON.stringify(futureRents));

         if (contractFile) {
            formData.append('contractFile', contractFile);
         }
         if (idFile) {
            formData.append('idFile', idFile);
         }

         const response = await set_tenant(formData);

         const data = await response.json();
         if (data.success) {
            showNotification('success', 'Tenant form submitted successfully!');
            handleCloseModal();
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

   const handleCreateFirstContract = () => {
      if (!currentTenant.name || currentTenant.name === "" || !currentTenant.email || currentTenant.email === "") {
         showNotification("error", "Please fill the form");
         return;
      }
      console.log(hasCouple, currentTenant.couple_name)
      if (hasCouple && (!currentTenant.couple_name || currentTenant.couple_name === "")) {
         showNotification("error", "Couple's name must have a value");
         return;
      }
      setShowCreateContractModal(true)
   }

   const handleShowCreateContract = ()=>{
      setContractFile(null);
      setContractPreview(null);
      setShowCreateContractModal(true);
   }

   const handleCreateContract = async (e: FormEvent<HTMLFormElement>)=>{
      e.preventDefault();

      try{
         const formData = new FormData();
         formData.append('contract', JSON.stringify(contract));
         formData.append('currentTenant', JSON.stringify(currentTenant));
         formData.append('deposit', JSON.stringify(depositPayment));

         if (contractFile) {
            formData.append('contractFile', contractFile);
         }

         const data = await set_contract(formData);
         const resp = await data.json();
         if (resp.success) {
            showNotification('success', 'Contract created successfully!');
            handleCloseModal();
         } else {
            showNotification('error', 'Something went wrong... Please check all the form data and try again.');
         }
      }catch{}finally{

      }
      console.log(contract)
   }

   const handleDelTenant = async () => {
      try {
         setIsLoading(true);

         const response = await del_tenant(currentTenant);

         const data = await response.json();
         if (data.success) {
            showNotification('success', 'Tenant deleted successfully!');
            handleCloseModal();
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
      const rooms = roomData.filter(room => room.id_property === id_property && (room.available || (currentRoom && currentRoom.id === room.id)));
      setCurrentRooms(rooms);
   }

   const setPriceRoom = (idRoom: string) => {
      const room = roomData.find(room => room.id === idRoom);
      if (room) {
         setCurrentRoom(room);
         setDepositPayment({ ...depositPayment, amount_payment: parseFloat((room.price / 2).toFixed(2)) })
      }
   }

   const handleCloseModal = () => {
      setShowCreateModal(false);
      setShowCreateContractModal(false);
      setIsModalConfirmOpen(false)
      setCurrentTenant({ id: "" });
      setCurrentRoom(RoomDefaultVal);
      setCurrentRooms([]);
      setDepositPayment({});
      setHasCouple(false);
      setContractFile(null);
      setIdFile(null);
      setIdPreview(null);
      setContractPreview(null)
      setPastRents([])
   }

   const handleOnClickEdit = async (room: Room | undefined, deposit: Payment | undefined, tenant: Tenant) => {
      setCurrentTenant(tenant);
      if (room) {
         setCurrentRooms([]); // clear rooms
         setCurrentRooms(prev => [...prev, room]); //add rooms for the select list
         setCurrentRoom(room); // set current room to select in the selects
      }
      if (deposit) {
         setDepositPayment({ ...depositPayment, ...deposit });
      }
      if (tenant.couple_name) {
         setHasCouple(true)
      }

      const currentContract = contracts.find(c => c.tenant_id === tenant.id && c.is_current);
      if (currentContract) {
         setCurrentContract(currentContract);
      }

      if ((currentContract && currentContract?.contract_file_id) || tenant.identification_file_id) {
         const data = await get_tenant_files(tenant, currentContract);
         const resp: { success: boolean, contractUrl: string, idUrl: string } = await data.json();

         if (resp.success) {
            setContractPreview(resp.contractUrl ? resp.contractUrl : null)
            setIdPreview(resp.idUrl ? resp.idUrl : null)
         }
      }

      const past_contracts = contracts.filter(c => c.tenant_id === tenant.id && c.status === "Terminated")
      const promise = past_contracts.filter(c=>c.contract_file_id).map(async c=>{

         const data = await get_tenant_files(tenant, c);
         const resp: { success: boolean, contractUrl: string, idUrl: string } = await data.json();

         if (resp.success) {
            const p:pastContractFiles = {
               id:c.id,
               url: resp.contractUrl,
            }
            setPastContractFilesPreview(prev=> [...prev, p])
         }
         
      })

      Promise.all(promise).then(() => {
         console.log(pastContractFilesPreview)
         setPastContracts(past_contracts);
      });

      const current_property = properties.find(p => p.id === room?.id_property);
      if (current_property) {
         setCurrentProperty(current_property)
      }

      setShowCreateModal(true);
   }

   const handlePreviousRents = (lease_start: Date) => {
      const rents: Partial<Payment>[] = []; // rents
      let currentYear = new Date(lease_start).getUTCFullYear();
      let currentMonth = new Date(lease_start).getUTCMonth();  // skips current month

      const endYear = new Date().getUTCFullYear();
      const endMonth = new Date().getUTCMonth();

      while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {

         const newRent: Partial<Payment> = {
            amount_paid: currentRoom.price,
            dueDate: new Date(currentYear, currentMonth, 1),
         }
         rents.push(newRent)

         // Move to the next year
         if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
         } else {
            currentMonth++;
         }
      }

      console.log("past", rents)
      setPastRents(rents)
   }

   const handleFutureRents = (lease_end: Date) => {
      const rents: Partial<Payment>[] = []; // rents
      let currentYear = new Date().getUTCFullYear();
      let currentMonth = new Date().getUTCMonth() + 1;  // skips current month

      const endYear = new Date(lease_end).getUTCFullYear();
      const endMonth = new Date(lease_end).getUTCMonth();

      while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {

         const newRent: Partial<Payment> = {
            dueDate: new Date(currentYear, currentMonth, 1),
         }
         rents.push(newRent)

         // Move to the next year
         if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
         } else {
            currentMonth++;
         }
      }

      console.log("future", rents)
      setFutureRents(rents)
   }

   const handleEditPastRentAmount = (value: number, index: number) => {
      const updatedPastRents = [...pastRents];
      updatedPastRents[index] = {
         ...updatedPastRents[index],
         amount_paid: value,
      };
      setPastRents(updatedPastRents);
   }

   // Filter tenants
   const filteredTenants = tenants.filter(tenant => {
      const contract_tenant = contracts.find(c => c.tenant_id === tenant.id && c.is_current);
      if (!contract_tenant) return;

      const filteredRooms = roomData.filter(r => r.id_property == filterProperty).find(r => r.id == contract_tenant.room_id);
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


   if (loadingProperties || loadingTenants || loadingPayments || loadingContracts) {
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
                  <p className="text-2xl font-bold">{contracts.filter(c => c.is_current && new Date((c.lease_end as Timestamp).toDate()) > new Date()).length}</p>
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
                           Current Contract
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
                           const contract_tenant = contracts.find(contract => contract.tenant_id === tenant.id && contract.is_current)
                           if (!contract_tenant) return;

                           const room = roomData.find(r => r.id === contract_tenant.room_id);
                           const property = properties.find(p => p.id === room?.id_property);
                           const deposit = payments.find(p => p.contract_id === contract_tenant.id && p.type === "deposit");
                           const currentRent = payments.find(p => p.contract_id === contract_tenant.id && p.type === "rent" && p.is_current);

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
                                       {new Date((contract_tenant.lease_start as Timestamp).toDate()).toLocaleDateString()} -{' '}
                                       {new Date((contract_tenant.lease_end as Timestamp).toDate()).toLocaleDateString()}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                       <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-1" />
                                       <span>{deposit?.amount_payment}</span>
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
                                       <span>{currentRent?.amount_payment}</span>
                                       {currentRent?.status === "Paid" ? (
                                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>
                                       ) : currentRent?.status === "Marked" ? (
                                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Marked</span>
                                       ) : (
                                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Pending</span>
                                       )}
                                    </div>
                                    <span className="ml-2 text-xs">Room ${room?.price || 0}</span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                       onClick={() => handleOnClickEdit(room, deposit, tenant)}
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
                        <form onSubmit={handleCreateNewTenant}>
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
                                          disabled={currentTenant.id && currentTenant.id !== "" ? true : false}
                                          required
                                          value={currentTenant.email || ''}
                                          onChange={(e) => setCurrentTenant({ ...currentTenant, email: e.target.value })}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                          placeholder="john@example.com"
                                       />
                                    </div>
                                 </div>

                                 <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                       Phone Number <span className='font-normal text-xs text-gray-500'>Optional</span>
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

                              <div>
                                 <label htmlFor="idFile" className="block text-sm font-medium text-gray-700 mb-1">
                                    ID/Passport (Image only: JPEG / PNG)
                                 </label>
                                 <label className='text-xs text-gray-500'>Optional</label>
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
                                 {idPreview &&
                                    <div className='mt-5 text-center flex flex-col items-center'>
                                       <span className='mb-1'>Preview</span>
                                       <Image
                                          key={idPreview}
                                          alt='id_file'
                                          src={idPreview.slice(0, 4) === "blob" ? idPreview : idPreview + "?" + new Date().getTime()}
                                          width={200}
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

                              {currentTenant && currentTenant.id && currentContract.id !== "" &&
                                 <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h3>

                                    <div className="space-y-4">
                                       {/* Lease Dates */}
                                       <div className="flex justify-between border-b pb-3">
                                          <span className="text-gray-600">Lease Period:</span>
                                          <span className="text-gray-900 font-medium">
                                             {(currentContract.lease_start as Timestamp).toDate().toDateString()} - {(currentContract.lease_end as Timestamp).toDate().toDateString()}
                                          </span>
                                       </div>

                                       {/* Property Assignment */}
                                       <div className="flex justify-between border-b pb-3">
                                          <div>
                                             <span className="text-gray-600">Property:</span>
                                             <span className="text-gray-900 font-medium ml-2">{currentProperty.location}</span>
                                          </div>
                                          <div>
                                             <span className="text-gray-600">Room:</span>
                                             <span className="text-gray-900 font-medium ml-2">#{currentRoom.room_number}</span>
                                          </div>
                                       </div>

                                       {/* Current Contract */}
                                       <div className="flex justify-between border-b pb-3">
                                          <span className="text-gray-600">Current Contract:</span>
                                          <span className="inline-flex items-center gap-1.5">
                                             <span className={`h-2 w-2 rounded-full ${currentContract.status === "Active" ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                             <span className="text-gray-900 font-medium">{currentContract.status === "Active" ? 'Active' : 'Inactive'}</span>
                                          </span>
                                       </div>

                                       <div className="grid grid-cols-1 gap-6">
                                          <div>
                                             <label htmlFor="contractFile" className="block text-sm font-medium text-gray-700 mb-1">
                                                Lease Contract (PDF)
                                             </label>
                                             <label className='text-xs text-gray-500'>Optional</label>
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
                                             {contractPreview &&
                                                <div className='mt-5 text-center w-full'>
                                                   <Link href={contractPreview.slice(0, 4) === "blob" ? contractPreview : contractPreview + "?" + new Date().getTime()} target='_blank'><span className='mb-1'>Preview</span></Link>
                                                   <iframe
                                                      key={contractPreview}
                                                      src={contractPreview.slice(0, 4) === "blob" ? contractPreview : contractPreview + "?" + new Date().getTime()}
                                                      style={{ border: 'none', width: "100%" }}
                                                      title="PDF Viewer"
                                                   ></iframe>
                                                </div>
                                             }
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              }

                              {/* Past contracts */}
                              {pastContracts &&
                                 <div className={`w-full space-y-2`}>
                                    {pastContracts.map((c, index) => {
                                       let file = pastContractFilesPreview.find(p=>p.id === c.id)?.url;
                                       if(file){
                                          file = file + "?" + new Date().getTime()
                                       }
                                       return(
                                       <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                          <button
                                             type='button'
                                             className={`w-full p-4 text-left flex justify-between items-center transition-colors ${activeIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50'
                                                }`}
                                             onClick={() => toggleItem(index)}
                                             aria-expanded={activeIndex === index}
                                             aria-controls={`accordion-content-${index}`}
                                          >
                                             <span className="font-medium text-gray-900">{(c.lease_start as Timestamp).toDate().toDateString()} - {(c.lease_end as Timestamp).toDate().toDateString()}</span>
                                             <svg
                                                className={`w-5 h-5 text-gray-500 transform transition-transform ${activeIndex === index ? 'rotate-180' : ''
                                                   }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                             >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                             </svg>
                                          </button>
                                          <div
                                             id={`accordion-content-${index}`}
                                             className={`transition-all duration-300 overflow-hidden ${activeIndex === index ? 'max-h-96' : 'max-h-0'
                                                }`}
                                          >
                                             <div className="p-4 text-gray-600">
                                                <div className="flex justify-between border-b pb-3">
                                                   <div>
                                                      <span className="text-gray-600">Property:</span>
                                                      <span className="text-gray-900 font-medium ml-2">{c.status}</span>
                                                   </div>
                                                   <div>
                                                      <span className="text-gray-600">Room:</span>
                                                      <span className="text-gray-900 font-medium ml-2">#</span>
                                                   </div>
                                                </div>
                                                {file && 
                                                   <div className='mt-5 text-center w-full'>
                                                      <Link href={file} target='_blank'><span className='mb-1'>Preview</span></Link>
                                                      <iframe
                                                         key={file}
                                                         src={file}
                                                         style={{ border: 'none', width: "100%" }}
                                                         title="PDF Viewer"
                                                      ></iframe>
                                                   </div>
                                                }
                                             </div>
                                          </div>
                                       </div>
                                    )})}
                                 </div>
                              }
                           </div>

                           <div className="mt-6 flex justify-end space-x-3">
                              <button
                                 type="button"
                                 onClick={handleCloseModal}
                                 className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                 Cancel
                              </button>

                              {currentTenant.id &&
                                 <>
                                    <button
                                       type="button"
                                       disabled={isLoading}
                                       onClick={() => setIsModalConfirmOpen(true)}
                                       className="inline-flex items-center rounded-lg border border-transparent bg-red-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-blue-300"
                                    >Delete tenant
                                    </button>

                                    <button
                                       type="button"
                                       onClick={handleShowCreateContract}
                                       className="inline-flex items-center rounded-lg border border-transparent bg-indigo-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-blue-300"
                                    >New Contract
                                    </button>
                                 </>
                              }

                              <button
                                 type={currentTenant.id === "" ? "button" : "submit"}
                                 disabled={isLoading}
                                 onClick={() => {
                                    if (currentTenant.id === "") handleCreateFirstContract();
                                 }}
                                 className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-blue-300"
                              >
                                 {isLoading ? (
                                    currentTenant.id ? 'Updating...' : 'Creating...'
                                 ) : (
                                    currentTenant.id ? 'Update Tenant' : 'Continue'
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
               message="Are you sure you want to proceed deleting the user?"
               confirmText="Proceed"
               additionalContent={<>
               <label>This will delete all the tenant&apos;s data such as</label>
               <ul>
                  <li>Contract history</li>
                  <li>Payment history</li>
                  <li>Part of the bills asigned</li>
                  <li>Account to login in the portal</li>
               </ul>
               </>}
               isDangerous={true}
            />
         )}

         {showCreateContractModal &&
            <ContractModal
               handleCloseModal={handleCloseModal}
               handleSubmit={currentContract.id ? handleCreateContract : handleCreateNewTenant}
               isLoading={isLoading}
               isEditing={currentTenant.id ? true : false}
               currentRoom={currentRoom}
               properties={properties}
               handleShowRooms={handleShowRooms}
               contract={contract}
               setContract={setContract}
               setPriceRoom={setPriceRoom}
               currentRooms={currentRooms}
               handlePreviousRents={handlePreviousRents}
               handleFutureRents={handleFutureRents}
               depositPayment={depositPayment}
               setDepositPayment={setDepositPayment}
               pastRents={pastRents}
               handleEditPastRentAmount={handleEditPastRentAmount}
               contractFile={contractFile}
               handleFileChange={handleFileChange}
               contractPreview={contractPreview}
               idFile={idFile}
               idPreview={idPreview}
            />
         }
      </div>
   );
};

export default TenantManagement;