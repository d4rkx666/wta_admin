"use client"

import Image from 'next/image';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-64 md:h-96 bg-gray-900">
        <figure>
          <Image
            src="/images/about-hero.jpg"
            alt="Vancouver skyline"
            fill
            className="object-cover opacity-70"
            priority
          />
          <figcaption>
            Photo by <a href="https://unsplash.com/@jeshoots?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">JESHOOTS.COM</a> on <a href="https://unsplash.com/photos/an-open-empty-notebook-on-a-white-desk-next-to-an-iphone-and-a-macbook-pUAM5hPaCRI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
          </figcaption>
        </figure>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center">
            About Welcome Travel Accommodation
          </h1>
        </div>
      </section>

      {/* Business Background */}
      <section className="py-16 container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Business Background</h2>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to Welcome Travel Accommodation, where your comfort and convenience are our top priorities. 
          Nestled in the heart of beautiful Vancouver, we specialize in providing stylish and affordable room 
          rentals that cater to both short-term and long-term stays.
        </p>
        
        <div className="grid md:grid-cols-2 gap-12 mt-12">
          {/* Our Mission */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-primary mr-2" />
              Our Mission
            </h3>
            <p className="text-gray-600">
              At Welcome Travel Accommodation, our mission is simple: to offer a seamless and enjoyable living 
              experience in one of the most vibrant cities in the world. We believe that finding the perfect 
              place to call home during your stay should be easy and stress-free. Our team is dedicated to 
              ensuring that every guest feels welcomed and well cared for, from the moment they inquire to the 
              day they check out.
            </p>
          </div>

          {/* Why Choose Us? */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-primary mr-2" />
              Why Choose Us?
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Prime Locations:</strong> Situated in key neighborhoods with easy access to transport and attractions</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Quality Accommodations:</strong> Meticulously maintained, stylish living spaces</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Personalized Service:</strong>  Tailored recommendations on what to do and where to visit, we’re here to make your stay memorable</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span><strong>Flexible Options:</strong> Whether you’re in town for a few months or several months, we offer a range of rental options to suit your needs and budget</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg text-gray-600 mb-6">
                Welcome Travel Accommodation was established in 2020 with a vision to provide exceptional room 
                rentals in one of the most captivating cities in the world. Inspired by Vancouver's unique charm 
                and vibrant lifestyle, we set out to offer a service that combines quality accommodations with 
                the warmth and hospitality that the city is known for.
              </p>
              <p className="text-lg text-gray-600">
                Our journey began with a commitment to creating a seamless and enjoyable living experience for 
                visitors. Since then, we have grown into a trusted name in the local rental market, dedicated 
                to making every stay in Vancouver memorable. Our team is passionate about sharing the beauty 
                and energy of this remarkable city with guests from around the globe.
              </p>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <figure>
                <Image
                  src="/images/about-story.jpg"
                  alt="Our team in Vancouver"
                  fill
                  className="object-cover"
                />
                <figcaption>
                  Photo by <a href="https://unsplash.com/@tfrants?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Tyler Franta</a> on <a href="https://unsplash.com/photos/person-using-laptop-on-white-wooden-table-iusJ25iYu1c?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-gray">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-6">Experience Vancouver With Us</h2>
          <p className="text-xl mb-8">
            Ready to find your perfect home away from home in beautiful Vancouver?
          </p>
          <a
            href="/"
            className="inline-block bg-blue-200 px-8 py-3 rounded-md font-medium hover:bg-blue-100 transition-colors text-lg"
          >
            Browse Available Rooms
          </a>
        </div>
      </section>
    </div>
  );
}