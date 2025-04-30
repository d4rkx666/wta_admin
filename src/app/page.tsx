'use client'

import Carousel from '@/app/components/common/Carousel';
import { RoomCard } from './components/RoomCard';
import { useLiveDocuments } from '@/hooks/useLiveListing';
import Loader from './components/common/Loader';
import { useRouter } from 'next/navigation';

export default function HomePage() {

   // Navigation
   const router = useRouter();
   
   const {data, loading} = useLiveDocuments();

   if (loading) {
      return <Loader />;
   }
   
   const featuredRooms = data;
   /*const featuredRooms2 = [
      {
         id: "rKoa7qfOWVZgPGlEO53v",
         title: "Modern Downtown Room",
         location: "Yaletown, Vancouver",
         image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
         price: 1200,
         rommates: 2,
      },
      {
         id: 2,
         title: "Cozy Kitsilano Room",
         location: "Kitsilano, Vancouver",
         image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
         price: 950,
         rommates: 1,
      },
      {
         id: 3,
         title: "Luxury West End Room",
         location: "West End, Vancouver",
         image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
         price: 1500,
         rommates: 3,
      },
   ];*/

   return (
      <div>

         {/* Hero Section */}
         <section className="relative bg-blue-600 text-white">
            <Carousel/>
         </section>

         {/* Featured Listings */}
         <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Rooms</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">Browse our selection of premium rooms in Vancouver&apos;s best neighborhoods.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {featuredRooms.map((room, i) => (
                  <RoomCard key={i} room={room}/>
                  ))}
               </div>

               <div className="text-center mt-12">
                  <button onClick={() => router.push(`/listing`)} className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition">
                     View All Listings
                  </button>
               </div>
            </div>
         </section>

         {/* Why Choose Us */}
         <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Vancouver Rooms</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">We make finding and renting rooms in Vancouver simple and stress-free.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-6 rounded-lg bg-gray-50">
                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                     </div>
                     <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
                     <p className="text-gray-600">Every room is personally verified by our team to ensure quality and accuracy.</p>
                  </div>

                  <div className="text-center p-6 rounded-lg bg-gray-50">
                     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                     </div>
                     <h3 className="text-xl font-semibold mb-2">No Hidden Fees</h3>
                     <p className="text-gray-600">Transparent pricing with no surprise costs or hidden charges.</p>
                  </div>

                  <div className="text-center p-6 rounded-lg bg-gray-50">
                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                     </div>
                     <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                     <p className="text-gray-600">Safe and secure payment processing for your peace of mind.</p>
                  </div>
               </div>
            </div>
         </section>

         {/* Testimonials */}
         {/*<section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">Hear from people who found their perfect room with us.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                           <Image src="https://randomuser.me/api/portraits/women/32.jpg" alt="Sarah J." fill className="w-full h-full object-cover" />
                        </div>
                        <div>
                           <h4 className="font-semibold">Sarah J.</h4>
                           <p className="text-gray-600 text-sm">Student at UBC</p>
                        </div>
                     </div>
                     <p className="text-gray-700">&quot;Found my perfect room in Kitsilano within days of searching. The process was so easy and the Vancouver Rooms team was incredibly helpful!&quot;</p>
                     <div className="flex mt-4 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                           <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                           <Image src="https://randomuser.me/api/portraits/men/45.jpg" alt="Michael T." className="w-full h-full object-cover" />
                        </div>
                        <div>
                           <h4 className="font-semibold">Michael T.</h4>
                           <p className="text-gray-600 text-sm">Professional</p>
                        </div>
                     </div>
                     <p className="text-gray-700">&quot;Moving to Vancouver for work was stressful, but Vancouver Rooms made finding a place easy. My downtown room is perfect for my commute.&quot;</p>
                     <div className="flex mt-4 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                           <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                           <Image src="https://randomuser.me/api/portraits/women/68.jpg" alt="Emma L." className="w-full h-full object-cover" />
                        </div>
                        <div>
                           <h4 className="font-semibold">Emma L.</h4>
                           <p className="text-gray-600 text-sm">Digital Nomad</p>
                        </div>
                     </div>
                     <p className="text-gray-700">&quot;As someone who moves frequently, I appreciate how Vancouver Rooms understands the needs of temporary residents. My West End room is perfect!&quot;</p>
                     <div className="flex mt-4 text-yellow-400">
                        {[...Array(4)].map((_, i) => (
                           <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                        ))}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                     </div>
                  </div>
               </div>
            </div>
         </section>*/}

         {/* CTA Section */}
         <section className="py-16 bg-gradient-to-r from-blue-600 to-red-600 text-white">
            <div className="container mx-auto px-4 text-center">
               <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Room?</h2>
               <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of happy renters who found their ideal living space with Vancouver Rooms.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => router.push(`/listing`)} className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg transition">
                     Browse Listings
                  </button>
               </div>
            </div>
         </section>
      </div>
   );
}