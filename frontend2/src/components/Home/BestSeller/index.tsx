"use client";
import React, { useState } from "react";
import { ArrowUp } from "lucide-react";

const FeaturedProducers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const producers = [
    {
      id: 1,
      name: "Anastasija",
      profileUrl: "/producers/anastasija",
      verified: true,
      description: "Passionate producer for prod.",
    },
    {
      id: 2,
      name: "Lokahi Knet",
      profileUrl: "/producers/lokahi-knet",
      verified: true,
      description: "Expert in delivering top-notch goods with care.",
    },
    {
      id: 3,
      name: "Tile",
      profileUrl: "/producers/tile",
      verified: true,
      description: "Dedicated to excellence in every product.",
    },
  ];

  const filteredProducers = producers.filter(producer =>
    producer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProducerCard = ({ producer }) => (
    <div className="relative bg-white rounded-xl shadow-md transition-all duration-300">
      <div className="relative h-48 bg-gradient-to-br from-green-light-6 to-blue-light-5 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center relative">
          <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-semibold text-lg text-dark mb-2">
          {producer.name}
        </h3>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {producer.description}
        </p>

        <div className="flex gap-2">
          <a
            href={producer.profileUrl}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            View Profile
            <ArrowUp className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span className="text-sm font-medium text-gray-700">Meet Our Producers</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Discover the passionate individuals behind our premium products, each producer brings their unique story, expertise, and commitment to quality.
          </h2>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search producers..."
              className="w-full max-w-md px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducers.map((producer) => (
            <ProducerCard key={producer.id} producer={producer} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{producers.length}</div>
            <div className="text-sm text-gray-600">Total Producers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">0</div>
            <div className="text-sm text-gray-600">Certifications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-gray-600">Quality Verified</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducers;