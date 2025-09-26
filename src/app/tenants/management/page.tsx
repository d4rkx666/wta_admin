'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useLiveProperties } from '@/hooks/useLiveProperties';
import Loader from '@/app/components/common/Loader';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
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
import { Property } from '@/types/property';
import { set_contract } from '@/hooks/setContract';
import Link from 'next/link';
import AdditionalFeeModal from '../components/AdditionalFeeModal';
import { set_additional_fee } from '@/hooks/setAdditionalFee';
import { set_additional_file, set_contract_file, set_id_file, upload_cloudinary } from '@/hooks/setFileCloudinary';

type pastContractFiles = {
   id:string,
   contractUrl:string,
   additionalUrl:string,
}

const TenantManagement = () => {

   // States
   const { showNotification } = useNotification();
   const [isLoading, setIsLoading] = useState(false);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [showAdditionalFeeModal, setShowAdditionalFeeModal] = useState(false);
   const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
   const [showCreateContractModal, setShowCreateContractModal] = useState(false);

   // Tenant info
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

   // Files Management
   const [contractFile, setContractFile] = useState<File | null>(null);
   const [additionalFile, setAdditionalFile] = useState<File | null>(null);
   const [idFile, setIdFile] = useState<File | null>(null);
   const [contractPreview, setContractPreview] = useState<string | null>(null);
   const [additionalPreview, setAdditionalPreview] = useState<string | null>(null);
   const [idPreview, setIdPreview] = useState<string | null>(null);
   const [pastContractFilesPreview, setPastContractFilesPreview] = useState<pastContractFiles[]>([]);

   // Accordion
   const [activeIndex, setActiveIndex] = useState<number | null>(null);

   const toggleItem = (index: number) => {
      setActiveIndex(activeIndex === index ? null : index);
   };

   const { data: properties, loading: loadingProperties } = useLiveProperties(); // properties
   const { data: tenants, loading: loadingTenants } = useLiveTenants(); // tenants
   const { data: contracts, loading: loadingContracts } = useLiveContracts(); // tenants
   const { data: payments, loading: loadingPayments } = useLivePayments(); // payments

   // Handle file uploads
   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'contract' | 'id' | 'additional') => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
         showNotification("error", "The file must be a valid PDF format.");
         return;
      }

      if ((file.size / 1000) > 10000) {
         showNotification("error", "The file size must be maximum 10MB.");
         return;
      }

      switch(type){
         case "contract":{
            setContractFile(file);
            setContractPreview(URL.createObjectURL(file));
            break;
         }
         case "id":{
            setIdFile(file);
            setIdPreview(URL.createObjectURL(file));
            break;
         }
         case "additional":{
            setAdditionalFile(file);
            setAdditionalPreview(URL.createObjectURL(file));
            break;
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
            formData.append('contractFile', "true");
         }
         if (idFile) {
            formData.append('idFile', "true");
         }
         if (additionalFile) {
            formData.append('additionalFile', "true");
         }

         const response = await set_tenant(formData);

         const data = await response.json();
         if (data.success) {
            // Upload pdf
            let error = false;
            if(data.signatureFiles.contract.signature){
               if(!await uploadFile(data.signatureFiles.contract, contractFile as File, currentContract.contract_file_id, "contract")){
                  error = true;
               }
            }

            if(data.signatureFiles.id.signature){
               if(!await uploadFile(data.signatureFiles.id, idFile as File, tenantToInsert.identification_file_id, "id")){
                  error = true;
               }
            }

            if(data.signatureFiles.additional.signature){
               if(!await uploadFile(data.signatureFiles.additional, additionalFile as File, currentContract.aditional_file_id, "additional")){
                  error = true;
               }
            }
            
            if(!error){
               showNotification('success', 'Tenant form submitted successfully!');
            }

            handleCloseModal();
            setIsLoading(false);
         } else {
            showNotification('error', 'Something went wrong... Please check all the form data and try again.');
            setIsLoading(false);
         }
      } catch (err) {
         console.log(err);
      }
   };

   // eslint-disable-next-line
   const uploadFile = async(data:any, fileUpload:File, public_id:string | undefined, type:"id" | "contract" | "additional")=>{
      let success = true;
      const formData2 = new FormData();
      formData2.append('file', fileUpload);
      formData2.append('folder', data.folder);
      formData2.append('api_key', data.apiKey);
      formData2.append('timestamp', data.timestamp);
      formData2.append('type', "private");
      formData2.append('invalidate', "true");
      formData2.append('signature', data.signature);
      if(public_id){
         formData2.append('public_id', public_id.split("/")[public_id.split("/").length - 1]);
      }
      
      const new_public_id = await upload_cloudinary(formData2, data.cloudName)
      if(new_public_id){
         
         if(type === "contract"){
            const newFileContract: Partial<Contract> = {
               id: data.id,
               contract_file_id: new_public_id
            }
            const sFile = await set_contract_file(newFileContract);
            const resp = await sFile.json();
            if(!resp.success){
               showNotification('error', 'Tenant updated and contract file uploaded successfully with troubles: linking the file.');
               success = false;
            }
         }else if(type === "id"){
            const newFileId: Partial<Tenant> = {
               id: data.id,
               identification_file_id: new_public_id
            }
            const sFile = await set_id_file(newFileId);
            const resp = await sFile.json();
            if(!resp.success){
               showNotification('error', 'Tenant updated and ID file uploaded successfully with troubles: linking the file.');
               success = false;
            }
         }else if(type === "additional"){
            const newFileAdditional: Partial<Contract> = {
               id: data.id,
               aditional_file_id: new_public_id
            }
            const sFile = await set_additional_file(newFileAdditional);
            const resp = await sFile.json();
            if(!resp.success){
               showNotification('error', 'Tenant updated and additional file uploaded successfully with troubles: linking the file.');
               success = false;
            }
         }
         
      }else{
         showNotification('error', 'Tenant updated successfully but file could not be uploaded.');
         success = false;
      }

      return success;
   }

   const handleCreateFirstContract = () => {
      // Validates first form
      if (!currentTenant.name || currentTenant.name === "" || !currentTenant.email || currentTenant.email === "" || !currentTenant.phone || currentTenant.phone === "") {
         showNotification("error", "Please fill the form");
         return;
      }
      if (hasCouple && (!currentTenant.couple_name || currentTenant.couple_name === "")) {
         showNotification("error", "Couple's name must have a value");
         return;
      }
      setShowCreateContractModal(true)
   }

   const handleCreateNewAdditionalFee = async(e: FormEvent<HTMLFormElement>, fee:Partial<Payment>)=>{
      e.preventDefault()
      try{
         const data = await set_additional_fee(fee);
         const resp = await data.json();

         if(resp.success){
            setShowAdditionalFeeModal(false);
            showNotification("success", "New fee added. The tenant now is able to see the new fee in the portal.")
         }else{
            showNotification("error", "Something went wrong. Please try again or contact the admin.")
         }
      }catch{

      }finally{
         setIsLoading(false);
      }
   }

   const handleShowCreateContract = ()=>{
      setContractFile(null);
      setContractPreview(null);
      setAdditionalFile(null);
      setAdditionalPreview(null)
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
      }catch{}
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
      setIsLoading(false);
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
      setAdditionalFile(null);
      setAdditionalPreview(null)
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

      if ((currentContract && (currentContract?.contract_file_id || currentContract.aditional_file_id)) || tenant.identification_file_id) {
         const data = await get_tenant_files(tenant, currentContract);
         const resp: { success: boolean, contractUrl: string, idUrl: string, additionalUrl: string} = await data.json();

         if (resp.success) {
            setContractPreview(resp.contractUrl ? resp.contractUrl : null)
            setIdPreview(resp.idUrl ? resp.idUrl : null)
            setAdditionalPreview(resp.additionalUrl ? resp.additionalUrl : null)
         }
      }

      const past_contracts = contracts.filter(c => c.tenant_id === tenant.id && c.status === "Terminated")
      const promise = past_contracts.filter(c=>c.contract_file_id).map(async c=>{

         const data = await get_tenant_files(tenant, c);
         const resp: { success: boolean, contractUrl: string, idUrl: string, additionalUrl: string} = await data.json();

         if (resp.success) {
            const p:pastContractFiles = {
               id:c.id,
               contractUrl: resp.contractUrl,
               additionalUrl: resp.additionalUrl
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

   const handleAddAdditionalFee = ()=>{
      setShowAdditionalFeeModal(true);
   }

   const handlePreviousRents = (lease_start: Date, lease_end: Date) => {
      const rents: Partial<Payment>[] = []; // rents
      let currentYear = new Date(lease_start).getUTCFullYear();
      let currentMonth = new Date(lease_start).getUTCMonth();  // skips current month


      const endYear = new Date(lease_end.getTime() > Date.now() ? Date.now() : lease_end).getUTCFullYear();
      const endMonth = new Date(lease_end.getTime() > Date.now() ? Date.now() : lease_end).getUTCMonth();

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
         if (additionalPreview) URL.revokeObjectURL(additionalPreview);
      };
   }, [contractPreview, idPreview, additionalPreview]);


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
                     setCurrentContract({});
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
                                    <div className='grid'>
                                       <button
                                          onClick={() => handleOnClickEdit(room, deposit, tenant)}
                                          className="text-blue-600 hover:text-blue-900 mr-3"
                                       >
                                          Edit
                                       </button>
                                       <button
                                          onClick={()=>handleAddAdditionalFee()}
                                          className="text-blue-600 hover:text-blue-900"
                                       >
                                          Add additional fee
                                       </button>
                                    </div>
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

                              <div>
                                 <label htmlFor="idFile" className="block text-sm font-medium text-gray-700 mb-1">
                                    Personal Document (PDF max 10MB)
                                 </label>
                                 <label className='text-xs text-gray-500'>Optional</label>

                                 <div className="flex items-center">
                                    <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                       <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                          <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                                          <p className="text-xs text-gray-500 mt-2">
                                             {idFile ? `${idFile.name} (${(idFile.size / 1000 ).toFixed(0)} KB)` : 'Click to upload ID/Passport + LOA / PAYSTUB / OFFER LETTER / WORK PERMIT (exceptions)'}
                                          </p>
                                       </div>
                                       <input
                                          id="idFile"
                                          name="idFile"
                                          type="file"
                                          accept="application/pdf"
                                          className="hidden"
                                          onChange={(e) => handleFileChange(e, 'id')}
                                       />
                                    </label>
                                 </div>


                                 {idPreview &&
                                    <div className='mt-5 text-center'>
                                       <iframe
                                          key={idPreview}
                                          src={idPreview.slice(0, 4) === "blob" ? idPreview : idPreview + "?" + new Date().getTime()}
                                          style={{ border: 'none', width: "100%" }}
                                          title="PDF Viewer"
                                       ></iframe>
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
                                          {currentContract.status === "Permanent" ?
                                             <span className="text-gray-900 font-medium">
                                                {(currentContract.lease_start as Timestamp).toDate().toDateString()} - Permanent
                                             </span>
                                          :
                                             <span className="text-gray-900 font-medium">
                                                {(currentContract.lease_start as Timestamp).toDate().toDateString()} - {(currentContract.lease_end as Timestamp).toDate().toDateString()}
                                             </span>
                                          }
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
                                             <span className={`h-2 w-2 rounded-full ${currentContract.status === "Active" || currentContract.status === "Permanent" ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                             <span className="text-gray-900 font-medium">{currentContract.status}</span>
                                          </span>
                                       </div>

                                       <div className="grid grid-cols-1 gap-6">
                                          <div>
                                             <label htmlFor="contractFile" className="block text-sm font-medium text-gray-700 mb-1">
                                                Lease Contract (PDF max 10MB)
                                             </label>
                                             <label className='text-xs text-gray-500'>Optional</label>
                                             <div className="flex items-center">
                                                <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                   <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                                      <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                                                      <p className="text-xs text-gray-500 mt-2">
                                                         {contractFile ? `${contractFile.name} (${(contractFile.size / 1000 ).toFixed(0)} KB)` : 'Click to upload Application + Contract + Addendum'}
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
                                                      key={contractPreview + "?" + new Date().getTime()}
                                                      src={contractPreview.slice(0, 4) === "blob" ? contractPreview : contractPreview + "?" + new Date().getTime()}
                                                      style={{ border: 'none', width: "100%" }}
                                                      title="PDF Viewer"
                                                   ></iframe>
                                                </div>
                                             }
                                          </div>
                                       </div>

                                       <div className="grid grid-cols-1 gap-6">
                                          <div>
                                             <label htmlFor="contractFile" className="block text-sm font-medium text-gray-700 mb-1">
                                                Additional Document (PDF max 10MB)
                                             </label>
                                             <label className='text-xs text-gray-500'>Optional</label>
                                             <div className="flex items-center">
                                                <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                   <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                                      <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                                                      <p className="text-xs text-gray-500 mt-2">
                                                         {additionalFile ? `${additionalFile.name} (${(additionalFile.size / 1000 ).toFixed(0)} KB)` : 'Click to upload Mutual Agreement To End'}
                                                      </p>
                                                   </div>
                                                   <input
                                                      id="additionalFile"
                                                      name="additionalFile"
                                                      type="file"
                                                      accept="application/pdf"
                                                      className="hidden"
                                                      onChange={(e) => handleFileChange(e, 'additional')}
                                                   />
                                                </label>
                                             </div>
                                             {additionalPreview &&
                                                <div className='mt-5 text-center w-full'>
                                                   <Link href={additionalPreview.slice(0, 4) === "blob" ? additionalPreview : additionalPreview + "?" + new Date().getTime()} target='_blank'><span className='mb-1'>Preview</span></Link>
                                                   <iframe
                                                      key={additionalPreview + "?" + new Date().getTime()}
                                                      src={additionalPreview.slice(0, 4) === "blob" ? additionalPreview : additionalPreview + "?" + new Date().getTime()}
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
                                       let contractFile = pastContractFilesPreview.find(p=>p.id === c.id)?.contractUrl;
                                       let additionalFile = pastContractFilesPreview.find(p=>p.id === c.id)?.additionalUrl;

                                       if(contractFile){
                                          contractFile = contractFile + "?" + new Date().getTime()
                                       }

                                       if(additionalFile){
                                          additionalFile = additionalFile + "?" + new Date().getTime()
                                       }
                                       
                                       const room = roomData.find(r=> r.id === c.room_id);
                                       const property = properties.findLast(p=> p.id === room?.id_property)

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
                                                      <span className="text-gray-600">Status:</span>
                                                      <span className="text-gray-900 font-medium ml-2">{c.status}</span>
                                                   </div>
                                                </div>
                                                <div className="flex justify-between border-b pb-3">
                                                   <div>
                                                      <span className="text-gray-600">Property:</span>
                                                      <span className="text-gray-900 font-medium ml-2">{property?.location}</span>
                                                   </div>
                                                   <div>
                                                      <span className="text-gray-600">Room:</span>
                                                      <span className="text-gray-900 font-medium ml-2">#{room?.room_number}</span>
                                                   </div>
                                                </div>
                                                {contractFile && 
                                                   <div className='mt-5 text-center w-full'>
                                                      <Link href={contractFile} target='_blank'><span className='mb-1'>Preview Contract</span></Link>
                                                      <iframe
                                                         key={contractFile}
                                                         src={contractFile}
                                                         style={{ border: 'none', width: "100%" }}
                                                         title="PDF Viewer"
                                                      ></iframe>
                                                   </div>
                                                }
                                                {additionalFile && 
                                                   <div className='mt-5 text-center w-full'>
                                                      <Link href={additionalFile} target='_blank'><span className='mb-1'>Preview Additional Document</span></Link>
                                                      <iframe
                                                         key={additionalFile}
                                                         src={additionalFile}
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
               isLoading={isLoading}
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
               handleSubmit={currentContract.id && currentContract.id !== "" ? handleCreateContract : handleCreateNewTenant}
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
               additionalFile={additionalFile}
               additionalPreview={additionalPreview}
            />
         }

         {showAdditionalFeeModal && 
         <AdditionalFeeModal
            setShowAdditionalFeeModal={setShowAdditionalFeeModal}
            handleSubmit={handleCreateNewAdditionalFee}
            isLoading={isLoading}
         />
         }
      </div>
   );
};

export default TenantManagement;