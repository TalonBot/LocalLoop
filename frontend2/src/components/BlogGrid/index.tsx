"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";
import Image from "next/image";

type Producer = {
  id: string;
  full_name: string;
  profile_image_url: string | null;
  certifications?: string[];
};

interface ProducerItemProps {
  producer: Producer;
}

const ProducerItem: React.FC<ProducerItemProps> = ({ producer }) => (
  <Link href={`/producers/${producer.id}`} className="group block w-full">
    <div className="bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-200 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50/30">
      {/* Profile Image */}
      <div className="relative mb-4 flex justify-center">
        <div className="relative">
          {producer.profile_image_url ? (
            <Image
              src={producer.profile_image_url}
              alt={producer.full_name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 text-2xl border-3 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
              👤
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
      </div>

      {/* Producer Name */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
          {producer.full_name}
        </h3>
      </div>

      {/* Certifications */}
      {producer.certifications && producer.certifications.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {producer.certifications.slice(0, 2).map((cert, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
              {cert}
            </span>
          ))}
          {producer.certifications.length > 2 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              +{producer.certifications.length - 2}
            </span>
          )}
        </div>
      )}

      {/* View Profile Button */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-200 shadow-sm group-hover:shadow-md">
          <span className="mr-2">👁️</span>
          View Profile
          <svg
            className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  </Link>
);

const ProducersGrid: React.FC = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProducers, setFilteredProducers] = useState<Producer[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/users/producers/page?page=1&limit=10")
      .then((res) => res.json())
      .then((data) => {
        setProducers(data.producers || []);
        setFilteredProducers(data.producers || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = producers.filter((producer) =>
      producer.full_name
        ? producer.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        : false
    );
    setFilteredProducers(filtered);
  }, [searchTerm, producers]);

  if (loading) {
    return (
      <>
        <Breadcrumb title="Producers" pages={["producers"]} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 text-lg">Loading producers...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Producers" pages={["producers"]} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f1f5f9%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Meet Our Producers
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Discover the passionate individuals behind our premium products.
              Each producer brings their unique story, expertise, and commitment
              to quality.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search producers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 shadow-sm"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {producers.length}
              </div>
              <div className="text-slate-600">Total Producers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {producers.reduce(
                  (acc, p) => acc + (p.certifications?.length || 0),
                  0
                )}
              </div>
              <div className="text-slate-600">Certifications</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50 shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                100%
              </div>
              <div className="text-slate-600">Quality Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Producers Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {searchTerm ? "No producers found" : "No producers available"}
              </h3>
              <p className="text-slate-600">
                {searchTerm
                  ? `No producers match "${searchTerm}". Try a different search term.`
                  : "We're currently onboarding new producers. Check back soon!"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {searchTerm ? `Search Results` : `All Producers`}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {searchTerm
                      ? `${filteredProducers.length} producer${
                          filteredProducers.length !== 1 ? "s" : ""
                        } found for "${searchTerm}"`
                      : `Showing ${filteredProducers.length} producer${
                          filteredProducers.length !== 1 ? "s" : ""
                        }`}
                  </p>
                </div>

                {/* Filter/Sort options could go here */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-500">Sort by:</span>
                  <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Name A-Z</option>
                    <option>Name Z-A</option>
                    <option>Most Certified</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducers.map((producer) => (
                  <ProducerItem producer={producer} key={producer.id} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProducersGrid;
