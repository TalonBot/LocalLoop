"use client";
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Filter,
  Search,
} from "lucide-react";

const LocalProducerMap = () => {
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for local producers
  const producers = [
    {
      id: 1,
      name: "Green Valley Farm",
      category: "farm",
      type: "Organic Vegetables",
      rating: 4.8,
      distance: "2.3 km",
      phone: "+1 (555) 123-4567",
      website: "greenvalley.com",
      hours: "6AM - 6PM",
      specialties: ["Tomatoes", "Lettuce", "Herbs"],
      description:
        "Family-owned organic farm specializing in fresh seasonal vegetables",
      position: { top: "20%", left: "25%" },
      color: "bg-green-500",
    },
    {
      id: 2,
      name: "Artisan Bakery Co.",
      category: "bakery",
      type: "Fresh Breads & Pastries",
      rating: 4.9,
      distance: "1.8 km",
      phone: "+1 (555) 234-5678",
      website: "artisanbakery.com",
      hours: "5AM - 8PM",
      specialties: ["Sourdough", "Croissants", "Cakes"],
      description: "Traditional bakery using locally sourced ingredients",
      position: { top: "45%", left: "60%" },
      color: "bg-amber-500",
    },
    {
      id: 3,
      name: "Mountain Honey",
      category: "producer",
      type: "Raw Honey & Bee Products",
      rating: 4.7,
      distance: "4.2 km",
      phone: "+1 (555) 345-6789",
      website: "mountainhoney.com",
      hours: "8AM - 5PM",
      specialties: ["Wildflower Honey", "Beeswax", "Pollen"],
      description: "Sustainable beekeeping with pure, unprocessed honey",
      position: { top: "30%", left: "75%" },
      color: "bg-yellow-500",
    },
    {
      id: 4,
      name: "Riverside Dairy",
      category: "dairy",
      type: "Fresh Dairy Products",
      rating: 4.6,
      distance: "3.1 km",
      phone: "+1 (555) 456-7890",
      website: "riversidedairy.com",
      hours: "6AM - 7PM",
      specialties: ["Fresh Milk", "Cheese", "Yogurt"],
      description: "Local dairy farm with grass-fed cows and artisan cheeses",
      position: { top: "65%", left: "40%" },
      color: "bg-blue-500",
    },
    {
      id: 5,
      name: "Craft Coffee Roasters",
      category: "coffee",
      type: "Small Batch Coffee",
      rating: 4.8,
      distance: "1.2 km",
      phone: "+1 (555) 567-8901",
      website: "craftcoffee.com",
      hours: "6AM - 9PM",
      specialties: ["Single Origin", "Blends", "Cold Brew"],
      description:
        "Locally roasted coffee beans sourced from sustainable farms",
      position: { top: "50%", left: "20%" },
      color: "bg-orange-600",
    },
    {
      id: 6,
      name: "Orchard Fresh",
      category: "farm",
      type: "Seasonal Fruits",
      rating: 4.7,
      distance: "5.8 km",
      phone: "+1 (555) 678-9012",
      website: "orchardfresh.com",
      hours: "7AM - 6PM",
      specialties: ["Apples", "Berries", "Stone Fruits"],
      description: "Pick-your-own orchard with the freshest seasonal fruits",
      position: { top: "25%", left: "45%" },
      color: "bg-red-500",
    },
  ];

  const categories = [
    { id: "all", label: "All Producers", color: "bg-gray-600" },
    { id: "farm", label: "Farms", color: "bg-green-600" },
    { id: "bakery", label: "Bakeries", color: "bg-amber-600" },
    { id: "dairy", label: "Dairy", color: "bg-blue-600" },
    { id: "producer", label: "Specialty", color: "bg-yellow-600" },
    { id: "coffee", label: "Coffee", color: "bg-orange-700" },
  ];

  const filteredProducers = producers.filter((producer) => {
    const matchesCategory =
      activeCategory === "all" || producer.category === activeCategory;
    const matchesSearch =
      producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producer.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="overflow-hidden py-20 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-bold text-4xl lg:text-5xl text-gray-900 mb-4">
            Discover Local Producers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect directly with farmers, artisans, and local food producers in
            your area. Support your community while enjoying the freshest
            products.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search producers, products, or specialties..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeCategory === category.id
                      ? `${category.color} text-white shadow-lg`
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Map Container */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-green-100 via-blue-100 to-green-200 rounded-xl shadow-lg overflow-hidden h-96 lg:h-[600px]">
              {/* Map Background Illustration */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 800 600">
                  <path
                    d="M0,300 Q200,200 400,300 T800,350"
                    stroke="#10b981"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M100,400 Q300,350 500,400 T800,450"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="150"
                    cy="100"
                    r="30"
                    fill="#86efac"
                    opacity="0.5"
                  />
                  <circle
                    cx="600"
                    cy="150"
                    r="40"
                    fill="#7dd3fc"
                    opacity="0.5"
                  />
                  <circle
                    cx="300"
                    cy="500"
                    r="25"
                    fill="#fde047"
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Producer Markers */}
              {filteredProducers.map((producer) => (
                <div
                  key={producer.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                    selectedProducer?.id === producer.id
                      ? "scale-125 z-20"
                      : "hover:scale-110 z-10"
                  }`}
                  style={{
                    top: producer.position.top,
                    left: producer.position.left,
                  }}
                  onClick={() => setSelectedProducer(producer)}
                >
                  <div
                    className={`w-12 h-12 ${producer.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white`}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  {selectedProducer?.id === producer.id && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-3 min-w-48">
                      <div className="text-sm font-semibold text-gray-900">
                        {producer.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {producer.distance} away
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  Map Legend
                </div>
                <div className="space-y-1">
                  {categories.slice(1).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 ${category.color} rounded-full`}
                      ></div>
                      <span className="text-xs text-gray-600">
                        {category.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Producer Details Panel */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {selectedProducer ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {selectedProducer.name}
                    </h3>
                    <p className="text-gray-600">{selectedProducer.type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {selectedProducer.rating}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  {selectedProducer.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedProducer.distance} away
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedProducer.hours}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedProducer.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-blue-600">
                      {selectedProducer.website}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducer.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Get Directions
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Select a Producer
                </h3>
                <p className="text-gray-600">
                  Click on any marker on the map to learn more about local
                  producers in your area.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="text-center bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {producers.length}
            </div>
            <div className="text-gray-600">Local Producers</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">2.5km</div>
            <div className="text-gray-600">Avg Distance</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-gray-600">Local & Fresh</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalProducerMap;
