"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, Eye } from "lucide-react";

const FeaturedProducers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [producers, setProducers] = useState([]);

  // Fetching producers from API on mount
  useEffect(() => {
    fetch("http://localhost:5000/users/producers/page?page=1&limit=10") // Replace with your actual endpoint if needed
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.producers)) {
          const formatted = data.producers.map((p) => ({
            id: p.id,
            name: p.full_name,
            description: p.description || "No description available.",
            profileUrl: `/producers/${p.id}`,
            verified: true, // Change this if your API returns a `verified` field
          }));
          setProducers(formatted);
        }
      })
      .catch((err) => {
        console.error("Failed to load producers:", err);
      });
  }, []);

  const filteredProducers = producers.filter((producer) =>
    producer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProducerCard = ({ producer }) => (
    <div className="border rounded-2xl bg-white p-4 flex flex-col items-center shadow-sm hover:shadow-lg transition-all relative">
      <div className="relative w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-purple-700 text-4xl shadow mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-10 h-10"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        {producer.verified && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      <h3 className="font-semibold text-base text-center text-gray-900 mb-1">
        {producer.name}
      </h3>

      <p className="text-sm text-center text-gray-600 mb-4 px-2 leading-relaxed">
        {producer.description}
      </p>

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
