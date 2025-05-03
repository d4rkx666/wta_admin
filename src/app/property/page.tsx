'use client'
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, LinkIcon, XMarkIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, FormEvent } from 'react';
import { Property, PropertyDefaultVal } from '@/types/property';
import { Amenity } from '@/types/amenity';
import { useLiveDocuments } from '@/hooks/useLiveListing';
import { set_property } from '@/hooks/setProperty';
import Link from 'next/link';
import ModalConfirmation from '../components/common/ModalConfirmation';
import { RoomDefaultVal } from '@/types/room';

export default function PropertyManagementPage() {
   const [properties, setProperties] = useState<Property[]>([]);
   const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage] = useState(5);
   const [filters, setFilters] = useState({
      search: '',
      type: '',
      amenity: ''
   });

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [currentProperty, setCurrentProperty] = useState<Property>(PropertyDefaultVal);
   const [showFilters, setShowFilters] = useState(false);

   const { data, loading } = useLiveDocuments();

   useEffect(() => {
      setProperties(data);
      setFilteredProperties(data);
   }, [data, loading]);

   useEffect(() => {
      // Apply filters whenever properties or filters change
      let result = [...properties];
      
      if (filters.search) {
         const searchTerm = filters.search.toLowerCase();
         console.log(searchTerm)
         result = result.filter(property => 
            property.title.toLowerCase().includes(searchTerm) || 
            property.description.toLowerCase().includes(searchTerm) ||
            property.location.toLowerCase().includes(searchTerm)
         )
      }
      
      if (filters.type) {
         result = result.filter(property => property.type === filters.type);
      }
      
      if (filters.amenity) {
         result = result.filter(property => 
            property.global_amenities.some(a => a.name === filters.amenity && a.available)
         );
      }
      
      setFilteredProperties(result);
      setCurrentPage(1); // Reset to first page when filters change
   }, [properties, filters]);

   // Get current properties for pagination
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
   const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

   const handleEditProperty = (property: Property) => {
      setCurrentProperty(property);
      setIsModalOpen(true);
   };

   const handleDeleteProperty = (property: Property) => {
      setCurrentProperty(property);
      setIsModalConfirmOpen(true);
   };

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
         setIsLoading(true);
         let response = undefined;
         const form = e.target as HTMLFormElement;
         const propertyToInsert = PropertyDefaultVal;

         propertyToInsert.type = (form.elements.namedItem('type') as HTMLInputElement).value;
         propertyToInsert.title = (form.elements.namedItem('title') as HTMLInputElement).value;
         propertyToInsert.description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
         propertyToInsert.location = (form.elements.namedItem('location') as HTMLInputElement).value;
         propertyToInsert.num_shared_washroom = Number((form.elements.namedItem('washrooms') as HTMLInputElement).value);
         propertyToInsert.url_map = (form.elements.namedItem('mapUrl') as HTMLInputElement).value;
         const amenities = form.querySelectorAll('input[name="amenities"]') as NodeListOf<HTMLInputElement>;

         const selectedAmenities: Amenity[] = Array.from(amenities)
            .map((checkbox) => {
               return {
                  name: checkbox.value,
                  available: checkbox.checked
               }
            });

         propertyToInsert.global_amenities = selectedAmenities;
         propertyToInsert.id = currentProperty.id != "" ? currentProperty.id : "";
         response = await set_property(propertyToInsert);

         setIsModalOpen(false);
      } catch (err) {
         console.log(String(err));
      } finally {
         setCurrentProperty(PropertyDefaultVal);
         setIsLoading(false);
      }
   }

   const handleDelProperty = async () => {
      try {
         setIsLoading(true);
         const deleteProperty = currentProperty;
         deleteProperty.enabled = false;
         const response = await set_property(deleteProperty);

         setIsModalConfirmOpen(false);
      } catch (err) {
         console.log(String(err));
      } finally {
         setCurrentProperty(PropertyDefaultVal);
         setIsLoading(false);
      }
   }

   const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const resetFilters = () => {
      setFilters({
         search: '',
         type: '',
         amenity: ''
      });
   };

   const propertyTypes = [...new Set(properties.map(p => p.type))];
   const allAmenities = Array.from(new Set(
      properties.flatMap(p => p.global_amenities.map(a => a.name))
   ));

   return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
         <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
               <h1 className="text-2xl font-semibold text-gray-900">Property Management</h1>
               <p className="mt-2 text-sm text-gray-700">
                  Manage all your properties, rooms, and amenities in one place.
               </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
               <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                  <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
                  Filters
               </button>
               <button
                  type="button"
                  onClick={() => { setIsModalOpen(true); setCurrentProperty(PropertyDefaultVal) }}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Property
               </button>
            </div>
         </div>

         {/* Filter Section */}
         {showFilters && (
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                     <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                        Search
                     </label>
                     <input
                        type="text"
                        id="search"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search properties..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                     />
                  </div>
                  <div>
                     <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Property Type
                     </label>
                     <select
                        id="type"
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                     >
                        <option value="">All Types</option>
                        {propertyTypes.map(type => (
                           <option key={type} value={type}>{type}</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label htmlFor="amenity" className="block text-sm font-medium text-gray-700">
                        Amenity
                     </label>
                     <select
                        id="amenity"
                        name="amenity"
                        value={filters.amenity}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                     >
                        <option value="">All Amenities</option>
                        {allAmenities.map(amenity => (
                           <option key={amenity} value={amenity}>{amenity}</option>
                        ))}
                     </select>
                  </div>
               </div>
               <div className="mt-4 flex justify-end">
                  <button
                     onClick={resetFilters}
                     className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                     Reset Filters
                  </button>
               </div>
            </div>
         )}

         {/* Results Count */}
         <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-700">
               Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
               <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredProperties.length)}
               </span>{' '}
               of <span className="font-medium">{filteredProperties.length}</span> results
            </p>
         </div>

         <div className="mt-4 flow-root">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
               <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                     <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                           <tr>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                 Title
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                 Type
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                 Location
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                 Rooms
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                 Amenities
                              </th>
                              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                 <span className="sr-only">Actions</span>
                              </th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                           {currentProperties.map((property) => (
                              <tr key={property.id}>
                                 <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    {property.title}
                                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{property.description}</p>
                                 </td>
                                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {property.type}
                                 </td>
                                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                       <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                                       {property.location}
                                    </div>
                                    {property.url_map && (
                                       <a
                                          href={property.url_map}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-indigo-600 hover:text-indigo-900 text-xs flex items-center mt-1"
                                       >
                                          <LinkIcon className="h-3 w-3 mr-1" />
                                          View on map
                                       </a>
                                    )}
                                 </td>
                                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                       {property.rooms.map(room => (
                                          <span key={room.id} className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                             Room {room.room_number}
                                          </span>
                                       ))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                       Shared washrooms: {property.num_shared_washroom}
                                    </div>
                                    <div className="mt-2">
                                       <Link
                                          href={`/property/${property.id}/room`} // Replace with your room management link
                                          className="inline-flex items-center rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 hover:bg-indigo-200"
                                       >
                                          Manage Rooms
                                       </Link>
                                    </div>
                                 </td>
                                 <td className="px-3 py-4 text-sm text-gray-500">
                                    <ul className="space-y-1">
                                       {property.global_amenities.map((amenity, index) => (
                                          <li key={index} className="flex items-center">
                                             <span className={`inline-block h-2 w-2 rounded-full mr-2 ${amenity.available ? 'bg-green-500' : 'bg-red-500'}`} />
                                             {amenity.name}
                                          </li>
                                       ))}
                                    </ul>
                                 </td>
                                 <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                                    <button
                                       onClick={() => handleEditProperty(property)}
                                       className="text-indigo-600 hover:text-indigo-900"
                                       title="Edit"
                                    >
                                       <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                       onClick={() => handleDeleteProperty(property)}
                                       className="text-red-600 hover:text-red-900"
                                       title="Delete"
                                    >
                                       <TrashIcon className="h-5 w-5" />
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>

         {/* Pagination */}
         {filteredProperties.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
               <div className="flex flex-1 justify-between sm:hidden">
                  <button
                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                     disabled={currentPage === 1}
                     className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                     Previous
                  </button>
                  <button
                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                     disabled={currentPage === totalPages}
                     className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                     Next
                  </button>
               </div>
               <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                     <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">
                           {Math.min(indexOfLastItem, filteredProperties.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredProperties.length}</span> results
                     </p>
                  </div>
                  <div>
                     <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                           onClick={() => setCurrentPage(1)}
                           disabled={currentPage === 1}
                           className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                           <span className="sr-only">First</span>
                           <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                           <ChevronLeftIcon className="h-5 w-5 -ml-2" aria-hidden="true" />
                        </button>
                        <button
                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                           disabled={currentPage === 1}
                           className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                           <span className="sr-only">Previous</span>
                           <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                           let pageNum;
                           if (totalPages <= 5) {
                              pageNum = i + 1;
                           } else if (currentPage <= 3) {
                              pageNum = i + 1;
                           } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                           } else {
                              pageNum = currentPage - 2 + i;
                           }
                           
                           return (
                              <button
                                 key={pageNum}
                                 onClick={() => setCurrentPage(pageNum)}
                                 aria-current={currentPage === pageNum ? 'page' : undefined}
                                 className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                    currentPage === pageNum 
                                       ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
                                       : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                 }`}
                              >
                                 {pageNum}
                              </button>
                           );
                        })}

                        <button
                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                           <span className="sr-only">Next</span>
                           <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                           onClick={() => setCurrentPage(totalPages)}
                           disabled={currentPage === totalPages}
                           className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                           <span className="sr-only">Last</span>
                           <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                           <ChevronRightIcon className="h-5 w-5 -ml-2" aria-hidden="true" />
                        </button>
                     </nav>
                  </div>
               </div>
            </div>
         )}

         {/* Add/Edit Property Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
               <div
                  className="fixed inset-0 bg-gray-600/70 transition-opacity"
                  aria-hidden="true"
                  onClick={() => setIsModalOpen(false)}
               ></div>

               <div className="flex min-h-screen items-center justify-center p-4 text-center">
                  <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-2xl">
                     <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-lg font-semibold text-white">
                              {currentProperty.id != "" ? 'Edit Property' : 'Add New Property'}
                           </h3>
                           <button
                              type="button"
                              className="rounded-md p-1 text-white hover:bg-blue-500 focus:outline-none"
                              onClick={() => setIsModalOpen(false)}
                           >
                              <XMarkIcon className="h-6 w-6" />
                           </button>
                        </div>
                     </div>

                     <div className="px-6 py-5">
                        <form onSubmit={handleSubmit} method='post'>
                           <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                 <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                       Property Title
                                    </label>
                                    <input
                                       type="text"
                                       id="title"
                                       name="title"
                                       required
                                       defaultValue={currentProperty?.title || ''}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border peer"
                                       placeholder="Sunshine Apartments"
                                    />
                                    <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                       This field is required
                                    </p>
                                 </div>

                                 <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                       Property Type
                                    </label>
                                    <select
                                       id="type"
                                       name="type"
                                       defaultValue={currentProperty?.type || ''}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white"
                                    >
                                       <option value="Apartment Building">Apartment Building</option>
                                       <option value="House">House</option>
                                       <option value="Condominium">Condominium</option>
                                       <option value="Townhouse">Townhouse</option>
                                    </select>
                                 </div>
                              </div>

                              <div>
                                 <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                 </label>
                                 <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    required
                                    defaultValue={currentProperty?.description || ''}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border peer"
                                    placeholder="Describe the property features and amenities..."
                                 />
                                 <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                    This field is required
                                 </p>
                              </div>

                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-10">
                                 <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                       Location
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="text"
                                          id="location"
                                          name="location"
                                          required
                                          defaultValue={currentProperty?.location || ''}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border peer"
                                          placeholder="123 Main St, City, State"
                                       />
                                       <p className="absolute mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                          This field is required
                                       </p>
                                    </div>
                                 </div>

                                 <div>
                                    <label htmlFor="washrooms" className="block text-sm font-medium text-gray-700 mb-1">
                                       Shared Washrooms
                                    </label>
                                    <input
                                       type="number"
                                       id="washrooms"
                                       name="washrooms"
                                       min="0"
                                       defaultValue={currentProperty?.num_shared_washroom || 0}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                                    />
                                 </div>
                              </div>

                              <div className="mb-10">
                                 <label htmlFor="mapUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                    Map URL
                                 </label>
                                 <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <LinkIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                       type="url"
                                       id="mapUrl"
                                       name="mapUrl"
                                       required
                                       defaultValue={currentProperty?.url_map || ''}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border peer"
                                       placeholder="https://maps.example.com/property"
                                    />
                                    <p className="absolute mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                                       This field is required
                                    </p>
                                 </div>
                              </div>

                              <div>
                                 <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
                                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {['Parking', 'Laundry', 'Gym', 'Pool', 'Elevator', 'Security'].map((amenity) => (
                                       <div key={amenity} className="flex items-center">
                                          <input
                                             id={`amenity-${amenity}`}
                                             name="amenities"
                                             type="checkbox"
                                             value={amenity}
                                             className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                             defaultChecked={currentProperty?.global_amenities.some(a => a.name === amenity && a.available) || false}
                                          />
                                          <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                                             {amenity}
                                          </label>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="mt-6 flex justify-end space-x-3">
                              <button
                                 type="button"
                                 onClick={() => setIsModalOpen(false)}
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
                                    currentProperty.id != "" ? 'Updating Property...' : 'Creating Property...'
                                 ) : (
                                    currentProperty.id != "" ? 'Update Property' : 'Create Property'
                                 )}
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Delete Confirmation Modal */}
         {isModalConfirmOpen && (
            <ModalConfirmation
            setIsModalConfirmOpen={setIsModalConfirmOpen}
            handleDelProperty={handleDelProperty}
            currentProperty={currentProperty}
            currentRoom={RoomDefaultVal}
            isLoading={isLoading}/>
         )}
      </div>
   );
}