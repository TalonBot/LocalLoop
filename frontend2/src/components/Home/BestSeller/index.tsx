"use client";
import React, { useEffect, useState } from "react";
import { Eye, Heart, Award } from "lucide-react";
import Link from "next/link";

const FeaturedProducers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [producers, setProducers] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  // Fetch producers and their ratings from API on mount
  useEffect(() => {
    fetch(`${process.env.API_BASE}/users/producers/page?page=1&limit=10`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data && Array.isArray(data.producers)) {
          const formatted = await Promise.all(
            data.producers.map(async (p) => {
              let rating = "N/A";
              try {
                const res = await fetch(
                  `${process.env.API_BASE}/users/producer/${p.id}/average-rating`
                );
                const ratingData = await res.json();
                // We expect the endpoint to return { average_rating: number, count: number }
                if (
                  ratingData &&
                  typeof ratingData.average_rating === "number"
                ) {
                  rating = ratingData.average_rating.toFixed(1);
                }
              } catch (error) {
                console.error("Failed to fetch rating for", p.id, error);
              }
              return {
                id: p.id,
                name: p.full_name,
                description: p.description || "No description available.",
                profileUrl: `/producers/${p.id}`,
                verified: true,
                image: "👤",
                badge: "Certified Producer",
                rating,
              };
            })
          );
          setProducers(formatted);
        }
      })
      .catch((err) => {
        console.error("Failed to load producers:", err);
      });
  }, []);

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const filteredProducers = producers.filter((producer) =>
    producer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProducerCard = ({ producer }) => (
    <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden">
      {/* Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Award className="w-3 h-3" />
          {producer.badge}
        </div>
      </div>

      {/* Favorite Button */}
      <button
        onClick={() => toggleFavorite(producer.id)}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-red-100 transition-colors duration-200"
      >
        <Heart
          className={`w-4 h-4 ${
            favorites.has(producer.id)
              ? "text-red-500 fill-current"
              : "text-gray-500"
          }`}
        />
      </button>

      {/* Image/Icon Section */}
      <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-6xl">{producer.image}</div>
        <div className="absolute bottom-3 right-3">
          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            Verified
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
          {producer.name}
        </h3>
        <div className="text-sm text-yellow-600 font-medium mb-1">
          ⭐ Rating: {producer.rating}
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {producer.description}
        </p>
        <a
          href={producer.profileUrl}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          View Profile
        </a>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Section Title */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2.5 font-medium text-gray-800 mb-1.5">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Award className="w-2.5 h-2.5 text-white" />
            </div>
            This Month
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Featured Local Producers
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-4">
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

        {/* Producers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
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

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/producers/our">
            <button className="inline-flex font-medium text-sm py-3 px-7 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-800 hover:text-white hover:border-transparent transition-colors duration-200">
              View All Producers
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducers;
