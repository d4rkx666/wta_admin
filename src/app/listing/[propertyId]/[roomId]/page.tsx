"use client"
import {useRouter} from "next/navigation";
import { useParams } from "next/navigation";
import Carousel from "../../../components/common/Carousel"
import { useDetailRoom } from "@/hooks/useDetailRoom";
import Loader from "@/app/components/common/Loader";
import Link from "next/link";


const RoomDetail = () => {
  const { propertyId, roomId }= useParams<{propertyId: string;roomId: string;}>();
  const {data, loading} = useDetailRoom(propertyId, roomId)
  
  // Navigation
  const router = useRouter();

  if (loading || !data) {
    return <Loader />;
  }

  // Mock data - in a real app, you'd fetch this based on the ID
  const room = data;
  /*const room = {
    id:  '1',
    title: "Modern Downtown Room with Mountain View",
    location: "Yaletown, Vancouver",
    price: 1200,
    availability: "2023-06-15",
    privateWashroom: true,
    size: "12m²",
    roommates: 2,
    description: `This bright and spacious room in a modern downtown condo offers stunning mountain views and convenient access to all amenities. The building features a gym, rooftop patio, and 24/7 security.

The room comes fully furnished with a queen-sized bed, desk, chair, and ample storage space. You'll be sharing the apartment with two friendly professionals who work regular hours.

Located in the heart of Yaletown, you're steps away from the best restaurants, cafes, and shopping in Vancouver. The Skytrain and multiple bus routes are just a 5-minute walk away, making commuting a breeze.

Utilities (electricity, water, heat) and high-speed internet are included in the rent. Laundry facilities are available in the building.`,
    amenities: [
      "Fully furnished",
      "Utilities included",
      "High-speed internet",
      "Gym access",
      "Rooftop patio",
      "Laundry facilities",
      "24/7 security",
      "Bike storage"
    ],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    ],
    coordinates: {
      lat: 49.2827,
      lng: -123.1207
    }
  };*/

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex-grow">
        {/* Room Gallery */}
        <div className="bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <Carousel/>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Room Details */}
            <div className="lg:w-2/3">
              {/* Title and Badge */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{room.title}</h1>
                {room.available ? (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0">
                    Available Now
                  </div>
                ):(
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0">
                    Already taken
                  </div>
                )}
                
              </div>
              
              {/* Location */}
              <div className="flex items-center text-gray-600 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {room.location}
              </div>
              
              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-sm">Price</div>
                  <div className="text-2xl font-bold text-blue-600">${room.price}<span className="text-gray-500 text-lg">/month</span></div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-sm">Available</div>
                  <div className="text-xl font-semibold">{new Date(room.date_availability.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-sm">Washroom</div>
                  <div className="text-xl font-semibold">{room.private_washroom ? 'Private' : 'Shared'}</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-sm">Roommates</div>
                  <div className="text-xl font-semibold">{room.roommates}</div>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">About This Room</h2>
                <div className="prose max-w-none">
                  {room.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Amenities */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {room.specific_amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Map */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Location</h2>
                <div className="bg-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22433.203456877294!2d-123.13960751585549!3d49.28021175064557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486717f41ba2fb1%3A0xc6952794560a44aa!2sDowntown%20Vancouver%2C%20Vancouver%2C%20BC%2C%20Canada!5e0!3m2!1sen!2smx!4v1745962606329!5m2!1sen!2smx" className="w-full h-full flex items-center justify-center" allowFullScreen={false} loading="lazy" referrerPolicy={"no-referrer-when-downgrade"}></iframe>
                </div>
              </div>
            </div>
            
            {/* Right Column - Contact/CTA */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-semibold mb-4">Interested in this room?</h3>
                <p className="text-gray-600 mb-6">Contact the property manager to schedule a viewing or ask questions.</p>
                
                <div className="space-y-4">
                  <div>
                    <Link href="tel:+1234567890">
                      <button className="sm:hidden w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Call Now
                      </button>
                    </Link>
                  </div>
                  
                  <button className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-medium transition flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Send Message
                  </button>
                  
                  {/*<button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Save to Favorites
                  </button>*/}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Share this listing</h4>
                  <div className="flex space-x-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="text-blue-400 hover:text-blue-600">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>


                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                  <Link href={"/listing"} className="text-blue-700 underline">Go back to listing</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;