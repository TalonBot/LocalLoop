"use client";
import React, { useState } from "react";
import { CheckCircle, Eye } from "lucide-react";

const FeaturedProducers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const producers = [
    {
      id: "17ddbbed-2852-4b67-b0ba-a81e6123d6a4",
      name: "Anastasija",
      profileUrl: "/producers/17ddbbed-2852-4b67-b0ba-a81e6123d6a4",
      verified: true,
      description: "Passionate producer.",
    },
    {
      id: "9fe8ca93-5a09-41cf-b083-3f391c0a80c3",
      name: "Lokalni Kmet",
      profileUrl: "/producers/9fe8ca93-5a09-41cf-b083-3f391c0a80c3",
      verified: true,
      description: "Expert in delivering top-notch goods.",
    },
    {
      id: "40ba46b9-cd6d-4e9c-9343-1a51a3de84f9",
      name: "Tile",
      profileUrl: "/producers/40ba46b9-cd6d-4e9c-9343-1a51a3de84f9",
      verified: true,
      description: "Dedicated to excellence in every product.",
    },
  ];

  const filteredProducers = producers.filter((producer) =>
    producer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProducerCard = ({ producer }) => (
    <div className="border rounded-2xl bg-white p-4 flex flex-col items-center shadow-sm hover:shadow-lg transition-all relative">
      {/* Avatar */}
      <div className="relative w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-purple-700 text-4xl shadow mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-10 h-10"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        {/* Verified badge */}
        {producer.verified && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-base text-center text-gray-900 mb-1">
        {producer.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-center text-gray-600 mb-4 px-2 leading-relaxed">
        {producer.description}
      </p>

      {/* View Profile Button */}
      <a
        href={producer.profileUrl}
        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition"
      >
        <Eye className="w-4 h-4" />
        View Profile
      </a>
    </div>
  );

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Meet Our Producers</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Discover the passionate individuals behind our premium products.
          </p>
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

        {/* Producer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducers.length === 0 ? (
            <p className="text-center col-span-full text-gray-600">
              No producers found.
            </p>
          ) : (
            filteredProducers.map((producer) => (
              <ProducerCard key={producer.id} producer={producer} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducers;
